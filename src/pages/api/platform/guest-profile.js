import { getAuthenticatedGuestTicket } from '@/lib/guest-ticket-server';
import { getIsCheckInEnabled } from '@/lib/contentful';
import { logSentryError } from '@/utils/sentry-utils';
import { getCheckInHref } from '@/components/GuestProfilePanel/utils';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  try {
    const guestResult = await getAuthenticatedGuestTicket(req.body?.idToken);
    if (guestResult.status) {
      return res
        .status(guestResult.status)
        .json({ message: guestResult.message });
    }
    const { ticket } = guestResult;
    let isCheckInEnabled = false;
    let checkInError = '';
    try {
      isCheckInEnabled = await getIsCheckInEnabled();
    } catch (error) {
      logSentryError(error, { action: 'load-guest-check-in-availability' });
      checkInError =
        'Check-in availability could not be loaded. Reload this page to try again.';
    }
    return res.status(200).json({
      guest: {
        id: ticket.id,
        name: ticket.fields.Name || '',
        cabin: ticket.fields.Cabin || null,
        isCheckedIn: ticket.fields['Checked In'] === 'Yes',
        dietaryRequirements: ticket.fields['Dietary Requirements'] || [],
        dietaryNotes: ticket.fields['Dietary Notes'] || '',
      },
      isCheckInEnabled,
      checkInHref: isCheckInEnabled ? getCheckInHref(ticket.id) : null,
      checkInError,
    });
  } catch (error) {
    logSentryError(error, { action: 'load-guest-information' });
    return res.status(500).json({
      message: 'Unable to load your guest information. Please try again.',
    });
  }
}
