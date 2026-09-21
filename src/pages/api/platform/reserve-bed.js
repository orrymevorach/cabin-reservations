import {
  clearCurrentBedSelection,
  getCabinById,
  getGroup,
  getUserByRecordId,
  reserveBed,
} from '@/lib/airtable';
import { resolveGroupMembers } from '@/lib/platform-utils';
import { sendConfirmationEmail } from '@/lib/emails';
import { BEDS } from '@/utils/constants';

// mirrors bedSelection.jsx's confirm-selection flow, but resolves group
// members by id (not name) and only allows reserving beds for the host's own group
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { cabinId, hostUserId, beds } = req.body;

    if (!cabinId || !hostUserId || !Array.isArray(beds) || !beds.length) {
      return res
        .status(400)
        .json({ message: 'cabinId, hostUserId, and beds are required.' });
    }

    const [cabin, host] = await Promise.all([
      getCabinById({ cabinId }),
      getUserByRecordId({ id: hostUserId }),
    ]);

    if (!cabin) return res.status(404).json({ message: 'Cabin not found.' });
    if (cabin.totalBeds === 3) {
      return res.status(422).json({
        message: 'Bed selection is not available for head staff cabins.',
      });
    }

    const groupMemberIds = host.group?.length
      ? (await getGroup({ groupId: host.group[0] }))?.members || []
      : [];
    const allowedMemberIds = new Set([hostUserId, ...groupMemberIds]);

    const hasUnauthorizedBed = beds.some(
      ({ userId }) => !allowedMemberIds.has(userId),
    );
    if (hasUnauthorizedBed) {
      return res.status(403).json({
        message: 'You can only reserve beds for members of your own group.',
      });
    }

    const groupMembers = await resolveGroupMembers({
      memberIds: beds.map(({ userId }) => userId),
    });

    const resolvedBeds = beds.map(({ userId, bedName }) => {
      const member = groupMembers.find(({ id }) => id === userId);
      return {
        bedName,
        id: userId,
        name: member?.name,
        emailAddress: member?.emailAddress,
      };
    });

    for (const bedEntry of resolvedBeds) {
      const bedField = BEDS[bedEntry.bedName];
      await clearCurrentBedSelection({ userId: bedEntry.id });
      await reserveBed({ userId: bedEntry.id, bedName: bedField, cabinId });

      const groupMember = groupMembers.find(({ id }) => id === bedEntry.id);
      await sendConfirmationEmail({
        groupMember,
        cabin,
        selectedBeds: resolvedBeds,
        host,
      });
    }

    res.status(200).json({ cabin });
  } catch (err) {
    console.log('error', err);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}
