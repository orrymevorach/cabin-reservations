import {
  createGroup,
  createUser,
  getCabinById,
  getUserByEmail,
  getUserByRecordId,
  reserveSpotInCabin,
  updateGroup,
} from '@/lib/airtable';
import { resolveGroupMembers } from '@/lib/platform-utils';
import { sendConfirmationEmail } from '@/lib/emails';
import { sendSlackNotification } from '@/lib/slack';

function verifyGuest({ guest, existingMemberEmails }) {
  if (!guest?.id) return 'No user found with this email.';
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

  const error = verifyGuest({ guest, existingMemberEmails });
  if (error) return { error };

  const host = await getUserByRecordId({ id: hostUserId });
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

async function createMember({
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

  const name = `${firstName} ${lastName}`;
  const newGuest = await createUser({ email, name, cabinId });
  const host = await getUserByRecordId({ id: hostUserId });

  const group = await addToGroup({
    groupId,
    hostUserId,
    memberIds,
    newMemberId: newGuest.id,
    groupName: host.name,
  });

  const cabin = await getCabinById({ cabinId });
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
    console.error('Slack notification failed:', slackError);
  }

  return { group, cabin };
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
    if (action === 'add') {
      result = await addMember({
        groupId,
        hostUserId,
        memberIds,
        email,
        cabinId,
      });
    } else if (action === 'create') {
      result = await createMember({
        groupId,
        hostUserId,
        memberIds,
        email,
        firstName,
        lastName,
        cabinId,
      });
    } else if (action === 'remove') {
      result = await removeMember({ groupId, memberIds, removeUserId });
    } else {
      return res.status(400).json({ message: 'Unsupported action.' });
    }

    if (result.error) return res.status(422).json({ message: result.error });
    res.status(200).json(result);
  } catch (err) {
    console.log('error', err);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}

