import { logSentryApiError } from '@/utils/sentry-utils';
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
import { isInactiveTicketStatus } from '@/utils/ticket-utils';

// mirrors bedSelection.jsx's confirm-selection flow, but resolves group
// members by id (not name) and only allows reserving beds for the host's own group
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { cabinId, reservingAttendeeId, beds } = req.body;

    if (!cabinId || !reservingAttendeeId || !Array.isArray(beds) || !beds.length) {
      return res
        .status(400)
        .json({ message: 'cabinId, reservingAttendeeId, and beds are required.' });
    }

    const [cabin, reservingAttendee] = await Promise.all([
      getCabinById({ cabinId }),
      getUserByRecordId({ id: reservingAttendeeId }),
    ]);

    if (!cabin) return res.status(404).json({ message: 'Cabin not found.' });
    if (!reservingAttendee?.id || isInactiveTicketStatus(reservingAttendee.status)) {
      return res.status(410).json({
        message:
          "We couldn't save your bed selection because your ticket is no longer valid. No bed reservations were changed. Please contact Highlands for help.",
      });
    }
    if (cabin.totalBeds === 3) {
      return res.status(422).json({
        message: 'Bed selection is not available for head staff cabins.',
      });
    }

    const groupMemberIds = reservingAttendee.group?.length
      ? (await getGroup({ groupId: reservingAttendee.group[0] }))?.members || []
      : [];
    const allowedMemberIds = new Set([reservingAttendeeId, ...groupMemberIds]);

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
    const bedSelectionWithInvalidTicket = beds.find(({ userId }) => {
      const attendee = groupMembers.find(member => member.id === userId);
      return !attendee?.id || isInactiveTicketStatus(attendee.status);
    });
    if (bedSelectionWithInvalidTicket) {
      const bedLabel =
        BEDS[bedSelectionWithInvalidTicket.bedName] ||
        bedSelectionWithInvalidTicket.bedName;
      const guestDescription = bedLabel
        ? `the guest selected for ${bedLabel}`
        : 'one of the selected guests';
      return res.status(410).json({
        message: `We couldn't save your bed selection because ${guestDescription} no longer has a valid ticket. No bed reservations were changed. Remove that guest from this selection and try again, or contact Highlands for help.`,
      });
    }

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
        host: reservingAttendee,
      });
    }

    res.status(200).json({ cabin });
  } catch (err) {
    await logSentryApiError({
      error: err,
      req,
      action: 'reserve-bed',
      extra: {
        cabinId: req.body?.cabinId,
        reservingAttendeeId: req.body?.reservingAttendeeId,
      },
    });
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}
