import {
  clearCurrentBedSelection,
  getCabinById,
  getUserByRecordId,
  reserveSpotInCabin,
} from '@/lib/airtable';
import { sendConfirmationEmail } from '@/lib/emails';

// mirrors the confirm-reservation logic from reserveButton.jsx, but enforces
// the yurt/head-staff/capacity rules server-side instead of trusting the client
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const {
      cabinId,
      groupMemberIds,
      hostUserId,
      selectedBeds = [],
    } = req.body;

    if (!cabinId || !Array.isArray(groupMemberIds) || !groupMemberIds.length) {
      return res
        .status(400)
        .json({ message: 'cabinId and groupMemberIds are required.' });
    }

    const [cabin, host] = await Promise.all([
      getCabinById({ cabinId }),
      getUserByRecordId({ id: hostUserId }),
    ]);

    if (!cabin) return res.status(404).json({ message: 'Cabin not found.' });

    const groupMembers = await Promise.all(
      groupMemberIds.map(id => getUserByRecordId({ id })),
    );

    const isYurt = cabin.unit?.[0] === 'Yurtlands';
    if (isYurt && host.status !== 'Yurt') {
      return res.status(422).json({
        message: 'You must have purchased a Yurt in order to reserve one.',
      });
    }
    if (!isYurt && host.status === 'Yurt') {
      return res.status(422).json({
        message: 'Yurt ticket holders can only reserve a yurt in Yurtlands.',
      });
    }

    const isHeadStaffCabin = cabin.bedConfiguration === 'Head Staff';
    if (isHeadStaffCabin && groupMembers.length !== 3) {
      return res.status(422).json({
        message: 'Head staff cabins require exactly 3 people in your group.',
      });
    }

    if (cabin.availability !== 'Open') {
      return res
        .status(422)
        .json({ message: 'This cabin is no longer open.' });
    }
    if (cabin.openBeds < groupMembers.length) {
      return res.status(422).json({
        message:
          'There are not enough beds in this cabin for your entire group.',
      });
    }

    for (const groupMember of groupMembers) {
      const userHasNoPreviouslyReservedCabin = !groupMember.cabin;
      const usersExistingCabinIsDifferentFromCurrentCabin =
        groupMember.cabin && groupMember.cabin[0] !== cabinId;

      // reserving a spot clears the member's existing bed selection, so skip
      // members already confirmed in this exact cabin
      if (
        userHasNoPreviouslyReservedCabin ||
        usersExistingCabinIsDifferentFromCurrentCabin
      ) {
        await clearCurrentBedSelection({ userId: groupMember.id });
        await reserveSpotInCabin({ cabinId, attendeeId: groupMember.id });
        await sendConfirmationEmail({
          groupMember,
          cabin,
          selectedBeds,
          host,
        });
      }
    }

    res.status(200).json({ cabin });
  } catch (err) {
    console.log('error', err);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}
