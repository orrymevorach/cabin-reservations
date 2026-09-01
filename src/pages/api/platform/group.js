import {
  createGroup,
  getUserByEmail,
  getUserByRecordId,
  updateGroup,
} from '@/lib/airtable';
import { resolveGroupMembers } from '@/lib/platform-utils';

function verifyGuest({ guest, existingMemberEmails }) {
  if (!guest?.id) return 'No user found with this email.';
  if (existingMemberEmails.includes(guest.emailAddress)) {
    return 'This guest is already in your group. Please enter a new email.';
  }
  if (guest.cabin) return 'This guest is already in a cabin.';
  return null;
}

async function addMember({ groupId, hostUserId, memberIds, email }) {
  const guest = await getUserByEmail({ email });
  const existingMembers = await resolveGroupMembers({ memberIds });
  const existingMemberEmails = existingMembers.map(
    ({ emailAddress }) => emailAddress,
  );

  const error = verifyGuest({ guest, existingMemberEmails });
  if (error) return { error };

  const hasGroup = !!groupId;
  const allMemberIds = hasGroup
    ? [...memberIds, guest.id]
    : [hostUserId, guest.id];

  const groupResponse = hasGroup
    ? await updateGroup({ groupId, members: allMemberIds })
    : await createGroup({
        groupName: (await getUserByRecordId({ id: hostUserId })).name,
        members: allMemberIds,
      });

  const members = await resolveGroupMembers({ memberIds: allMemberIds });
  return { group: { id: groupResponse.id, members } };
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
      removeUserId,
    } = req.body;

    let result;
    if (action === 'add') {
      result = await addMember({ groupId, hostUserId, memberIds, email });
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
