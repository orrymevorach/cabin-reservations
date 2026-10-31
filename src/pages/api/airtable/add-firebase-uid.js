import Airtable from 'airtable';
import { transformFields } from '@/lib/airtable';
import { isInactiveTicketStatus } from '@/utils/ticket-utils';
import { logSentryError } from '@/utils/sentry-utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const idToken = req.body?.idToken;
  if (typeof idToken !== 'string' || !idToken) {
    return res.status(401).json({ message: 'Please sign in again.' });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (
      !apiKey ||
      !process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN ||
      !process.env.AIRTABLE_BASE
    ) {
      throw new Error(
        'Firebase and Airtable account-linking configuration is missing.',
      );
    }
    const identityResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        signal: AbortSignal.timeout(15000),
      },
    );
    const identityResult = await identityResponse.json();
    if (!identityResponse.ok) {
      const expectedErrors = [
        'INVALID_ID_TOKEN',
        'TOKEN_EXPIRED',
        'USER_DISABLED',
        'USER_NOT_FOUND',
      ];
      if (expectedErrors.includes(identityResult.error?.message)) {
        return res.status(401).json({ message: 'Please sign in again.' });
      }
      throw new Error(
        `Firebase account verification failed (${identityResponse.status}).`,
      );
    }
    const identity = identityResult.users?.[0];
    if (!identity?.localId || !identity.email || identity.disabled) {
      return res
        .status(401)
        .json({
          message: 'A Firebase account with an email address is required.',
        });
    }

    const email = identity.email.trim().toLowerCase();
    const escapedEmail = email.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const table = new Airtable({
      apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
    }).base(process.env.AIRTABLE_BASE)('Ticket Purchases');
    const records = await table
      .select({
        filterByFormula: `LOWER({Email Address}) = "${escapedEmail}"`,
      })
      .all();
    const ticket = records.find(
      record =>
        record.fields.Status !== 'Payment Made' &&
        !isInactiveTicketStatus(record.fields.Status),
    );
    if (!ticket) {
      return res.status(422).json({
        message:
          'We do not have an active ticket for this email. Please buy a ticket, or contact info@highlandsmusicfestival.ca.',
      });
    }
    const existingUid = ticket.fields['Firebase UID'];
    if (existingUid && existingUid !== identity.localId) {
      return res.status(409).json({
        message:
          'This ticket is linked to a different account. Please contact info@highlandsmusicfestival.ca.',
      });
    }

    // Link only an unclaimed active ticket; never overwrite another account's identity.
    const linkedTicket = existingUid
      ? ticket
      : (
          await table.update([
            { id: ticket.id, fields: { 'Firebase UID': identity.localId } },
          ])
        )[0];
    const user = transformFields({ record: linkedTicket });
    return res.status(200).json({ user });
  } catch (error) {
    logSentryError(error, { action: 'link-reservation-account' });
    return res.status(500).json({
      message:
        'Unable to link your ticket to your account. Please try again or contact info@highlandsmusicfestival.ca.',
    });
  }
}
