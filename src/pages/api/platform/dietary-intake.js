import { getAuthenticatedGuestTicket } from '@/lib/guest-ticket-server';
import { logSentryError } from '@/utils/sentry-utils';
import {
  dietaryOptions,
  dietaryNotesMaxLength,
  hasProvidedDietaryInformation,
} from '@/components/GuestProfilePanel/utils';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'POST, PATCH');
    return res.status(405).end('Method Not Allowed');
  }
  const { idToken, dietaryRequirements, dietaryNotes } = req.body || {};
  const shouldSaveDietary = req.method === 'PATCH';
  if (
    shouldSaveDietary &&
    (!Array.isArray(dietaryRequirements) ||
      dietaryRequirements.some(option => !dietaryOptions.includes(option)) ||
      dietaryRequirements.length > dietaryOptions.length ||
      typeof dietaryNotes !== 'string' ||
      dietaryNotes.length > dietaryNotesMaxLength)
  ) {
    return res.status(422).json({
      message: `Select the listed dietary options and limit notes to ${dietaryNotesMaxLength} characters.`,
    });
  }
  try {
    const guestResult = await getAuthenticatedGuestTicket(idToken);
    if (guestResult.status) {
      return res
        .status(guestResult.status)
        .json({ message: guestResult.message });
    }
    const { table, ticket } = guestResult;
    let dietaryTicket = ticket;

    // The checkbox marks a dietary response, including an explicit "None", not only restrictions.
    if (shouldSaveDietary) {
      const requirements = [...new Set(dietaryRequirements)];
      const notes = dietaryNotes.trim();
      const savedTickets = await table.update([
        {
          id: ticket.id,
          fields: {
            'Dietary Requirements': requirements,
            'Dietary Notes': notes,
            'Dietary Restrictions': hasProvidedDietaryInformation(
              requirements,
              notes,
            ),
          },
        },
      ]);
      dietaryTicket = savedTickets[0];
    }
    return res.status(200).json({
      dietaryRequirements: dietaryTicket.fields['Dietary Requirements'] || [],
      dietaryNotes: dietaryTicket.fields['Dietary Notes'] || '',
    });
  } catch (error) {
    logSentryError(error, {
      action: shouldSaveDietary
        ? 'save-guest-dietary-information'
        : 'load-guest-dietary-information',
    });
    return res.status(500).json({
      message: shouldSaveDietary
        ? 'Unable to save your dietary information. Please try again.'
        : 'Unable to load your dietary information. Please try again.',
    });
  }
}
