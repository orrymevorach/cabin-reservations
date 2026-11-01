import { logSentryApiError } from '@/utils/sentry-utils';
import { getGuestErrorMessage } from '@/utils/api-error-utils';
import {
  createGroup,
  createPurchasedTicketGuest,
  createUser,
  getCabinById,
  getGroup,
  getPurchasedTicketAllocation,
  getUserByEmail,
  getUserByRecordId,
  reserveSpotInCabin,
  updateGroup,
} from '@/lib/airtable';
import { resolveGroupMembers } from '@/lib/platform-utils';
import {
  sendConfirmationEmail,
  sendTemporaryPasswordEmail,
} from '@/lib/emails';
import { sendSlackNotification } from '@/lib/slack';
import Cookies from 'cookies';
import { COOKIES } from '@/utils/constants';
import {
  hasIncludedGuestTicketRemaining,
  throwIfReservationTicketIsInvalid,
} from '@/utils/ticket-utils';

function verifyGuest({ guest, hostUserId, existingMemberEmails }) {
  if (!guest?.id) return 'No user found with this email.';
  // A host without a group isn't in the member list yet, so check their own ticket separately
  // before Airtable rejects a group that lists them twice.
  if (guest.id === hostUserId) {
    return 'This is your own ticket. Please enter your guest’s email.';
  }
  if (existingMemberEmails.includes(guest.emailAddress)) {
    return 'This guest is already in your group. Please enter a new email.';
  }
  if (guest.cabin) return 'This guest is already in a cabin.';
  return null;
}

async function addToGroup({
  groupId,
  hostUserId,
  memberIds,
  newMemberId,
  groupName,
}) {
  const hasGroup = !!groupId;
  const allMemberIds = hasGroup
    ? [...memberIds, newMemberId]
    : [hostUserId, newMemberId];

  const groupResponse = hasGroup
    ? await updateGroup({ groupId, members: allMemberIds })
    : await createGroup({ groupName, members: allMemberIds });

  const members = await resolveGroupMembers({ memberIds: allMemberIds });
  return { id: groupResponse.id, members };
}

async function addMember({
  groupId,
  hostUserId,
  memberIds,
  email,
  cabinId = null,
}) {
  const guest = await getUserByEmail({ email });
  const existingMembers = await resolveGroupMembers({ memberIds });
  const existingMemberEmails = existingMembers.map(
    ({ emailAddress }) => emailAddress,
  );

  const error = verifyGuest({ guest, hostUserId, existingMemberEmails });
  if (error) return { error };

  const host = await getUserByRecordId({ id: hostUserId });
  throwIfReservationTicketIsInvalid(host);
  const group = await addToGroup({
    groupId,
    hostUserId,
    memberIds,
    newMemberId: guest.id,
    groupName: host.name,
  });

  // adding a guest from the summary page immediately places them in the cabin;
  // adding a guest before a cabin is reserved (reserve page) does not
  let cabin = null;
  // A post-reservation assignment must use the purchaser's cabin and an available bed.
  if (cabinId) {
    await reserveSpotInCabin({ cabinId, attendeeId: guest.id });
    cabin = await getCabinById({ cabinId });
    await sendConfirmationEmail({
      groupMember: guest,
      cabin,
      selectedBeds: [],
      host,
    });
  }

  return { group, cabin };
}

async function createCabinGuest({
  groupId,
  hostUserId,
  memberIds,
  email,
  firstName,
  lastName,
  cabinId,
}) {
  const existingGuest = await getUserByEmail({ email });
  if (existingGuest?.id) {
    return {
      error:
        'We already have a ticket associated with this email. Please enter a new email.',
    };
  }

  const host = await getUserByRecordId({ id: hostUserId });
  if (!host?.id || host.cabin?.[0] !== cabinId) {
    return { error: 'Unable to verify your cabin reservation.' };
  }

  // Count guests from the host's saved group, not the browser's member list, so free cabin and yurt guests stop at the allowance.
  const hostGroupId = host.group?.[0];
  const storedGroup = hostGroupId
    ? await getGroup({ groupId: hostGroupId })
    : null;
  const canCreateGuest = hasIncludedGuestTicketRemaining({
    status: host.status,
    groupMemberCount: storedGroup?.members?.length,
  });
  if (!canCreateGuest) {
    return {
      error:
        'You have added all of the guests included with your reservation. Please contact Highlands to add more.',
    };
  }

  const cabin = await getCabinById({ cabinId });
  if (!cabin) return { error: 'Unable to verify your cabin reservation.' };

  const isYurtCabin = cabin.unit?.[0] === 'Yurtlands';
  const isYurtPurchaser = host.status === 'Yurt';
  if (isYurtCabin !== isYurtPurchaser) {
    return { error: 'Unable to verify your cabin reservation.' };
  }

  const openBedCount = Number(cabin.openBeds);
  if (!Number.isFinite(openBedCount) || openBedCount < 1) {
    return { error: 'No additional beds are available in this cabin.' };
  }

  const name = `${firstName} ${lastName}`;
  const newGuest = await createUser({ email, name, cabinId });

  const group = await addToGroup({
    groupId,
    hostUserId,
    memberIds,
    newMemberId: newGuest.id,
    groupName: host.name,
  });

  await sendConfirmationEmail({
    groupMember: newGuest,
    cabin,
    selectedBeds: [],
    host,
  });

  try {
    await sendSlackNotification({
      originalGuestName: host.name,
      newGuestName: name,
      email,
      cabin: cabin.name,
    });
  } catch (slackError) {
    await logSentryApiError({
      error: slackError,
      action: 'send-cabin-guest-slack-notification',
      extra: { cabinId: cabin.id, groupId: group?.id },
    });
  }

  return { group, cabin };
}

async function assignPurchasedTicketToGuest({
  groupId,
  hostUserId,
  email,
  firstName,
  lastName,
  cabinId,
}) {
  const hasValidGuestDetails = Boolean(
    typeof email === 'string' &&
    typeof firstName === 'string' &&
    typeof lastName === 'string' &&
    email.trim() &&
    firstName.trim() &&
    lastName.trim(),
  );
  if (!hasValidGuestDetails) {
    return { error: 'Guest name and email are required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  if (!isEmailValid) return { error: 'Enter a valid guest email address.' };

  const name = `${firstName.trim()} ${lastName.trim()}`;
  const host = await getUserByRecordId({ id: hostUserId });
  if (!host?.id) return { error: 'Unable to find the ticket purchaser.' };

  const purchaserGroupId = host.group?.[0] || null;
  if ((groupId || null) !== purchaserGroupId) {
    return { error: 'Unable to verify your reservation group.' };
  }
  const storedGroup = purchaserGroupId
    ? await getGroup({ groupId: purchaserGroupId })
    : null;
  if (purchaserGroupId && !storedGroup?.id) {
    return { error: 'Unable to verify your reservation group.' };
  }
  const verifiedMemberIds = storedGroup?.members || [hostUserId];
  if (!verifiedMemberIds.includes(hostUserId)) {
    return { error: 'Unable to verify your reservation group.' };
  }

  const allocation = await getPurchasedTicketAllocation({ user: host });
  if (allocation.remainingTicketCount <= 0) {
    return { error: 'There are no unassigned purchased tickets available.' };
  }

  const existingGuest = await getUserByEmail({ email: normalizedEmail });
  if (existingGuest?.id) {
    return {
      error:
        'We already have a ticket associated with this email. Please add that guest using their ticket email.',
    };
  }

  const existingMembers = await resolveGroupMembers({
    memberIds: verifiedMemberIds,
  });
  const doesEmailAlreadyBelongToGroup = existingMembers.some(
    member => member.emailAddress?.toLowerCase() === normalizedEmail,
  );
  if (doesEmailAlreadyBelongToGroup) {
    return { error: 'This guest is already in your group.' };
  }

  let cabin = null;
  if (cabinId) {
    const hostCabinId = host.cabin?.[0];
    if (hostCabinId !== cabinId) {
      return { error: 'Unable to verify your cabin reservation.' };
    }

    cabin = await getCabinById({ cabinId });
    const openBedCount = Number(cabin?.openBeds);
    if (!cabin || !Number.isFinite(openBedCount) || openBedCount < 1) {
      return { error: 'No additional beds are available in this cabin.' };
    }
  }

  const { guest } = await createPurchasedTicketGuest({
    host,
    email: normalizedEmail,
    name,
    cabinId,
    placeholderRecord: allocation.placeholderRecords[0],
    isBundlePurchase: allocation.isBundlePurchase,
  });
  const group = await addToGroup({
    groupId: purchaserGroupId,
    hostUserId,
    memberIds: verifiedMemberIds,
    newMemberId: guest.id,
    groupName: host.name,
  });

  if (cabinId) {
    await sendConfirmationEmail({
      groupMember: guest,
      cabin,
      selectedBeds: [],
      host,
    });
  }

  const passwordEmailResponse = await sendTemporaryPasswordEmail({
    emailAddress: normalizedEmail,
  });
  if (passwordEmailResponse?.error) {
    throw new Error('Unable to send purchased ticket account credentials.');
  }

  try {
    await sendSlackNotification({
      originalGuestName: host.name,
      newGuestName: name,
      email: normalizedEmail,
      cabin: cabin?.name || '',
    });
  } catch (slackError) {
    await logSentryApiError({
      error: slackError,
      action: 'send-purchased-ticket-slack-notification',
      extra: { cabinId: cabin?.id, groupId: group?.id },
    });
  }

  const { remainingTicketCount: remainingPurchasedTicketCount } =
    await getPurchasedTicketAllocation({ user: host });
  return { group, cabin, remainingPurchasedTicketCount };
}

async function removeMember({ groupId, memberIds, removeUserId }) {
  const remainingMemberIds = memberIds.filter(id => id !== removeUserId);
  const groupResponse = await updateGroup({
    groupId,
    members: remainingMemberIds,
  });
  const members = await resolveGroupMembers({ memberIds: remainingMemberIds });
  return { group: { id: groupResponse.id, members } };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Supported actions:
  // 'add-existing-ticket-holder',
  // 'create-cabin-guest',
  // 'assign-purchased-ticket',
  // 'remove-group-member'.
  try {
    const {
      action,
      groupId = null,
      hostUserId,
      memberIds = [],
      email,
      firstName,
      lastName,
      cabinId = null,
      removeUserId,
    } = req.body;

    let result;
    if (action === 'add-existing-ticket-holder') {
      result = await addMember({
        groupId,
        hostUserId,
        memberIds,
        email,
        cabinId,
      });
    } else if (action === 'create-cabin-guest') {
      result = await createCabinGuest({
        groupId,
        hostUserId,
        memberIds,
        email,
        firstName,
        lastName,
        cabinId,
      });
      // Spend a paid slot, claim or create its ticket record, and email the guest.
    } else if (action === 'assign-purchased-ticket') {
      const cookies = new Cookies(req, res);
      const authenticatedUserId = cookies.get(COOKIES.USER_RECORD);
      if (authenticatedUserId !== hostUserId) {
        return res.status(403).json({
          message: 'You must be signed in as the ticket purchaser.',
        });
      }

      result = await assignPurchasedTicketToGuest({
        groupId,
        hostUserId,
        email,
        firstName,
        lastName,
        cabinId,
      });
    } else if (action === 'remove-group-member') {
      result = await removeMember({ groupId, memberIds, removeUserId });
    } else {
      return res.status(400).json({ message: 'Unsupported action.' });
    }

    if (result.error) return res.status(422).json({ message: result.error });
    res.status(200).json(result);
  } catch (err) {
    await logSentryApiError({
      error: err,
      req,
      action: 'update-cabin-group',
      extra: {
        groupAction: req.body?.action,
        groupId: req.body?.groupId,
        hostUserId: req.body?.hostUserId,
        cabinId: req.body?.cabinId,
      },
    });
    res
      .status(err.statusCode || 500)
      .json({ message: getGuestErrorMessage(err) });
  }
}
