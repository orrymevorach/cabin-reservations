import Airtable from 'airtable';
import { transformFields } from '@/lib/airtable';
import { isInactiveTicketStatus } from '@/utils/ticket-utils';
import { logSentryError } from '@/utils/sentry-utils';
import { getFirebaseIdentity } from '@/lib/firebase-identity';
import { setUserSession } from '@/lib/user-session-server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const idToken = req.body?.idToken;
  const temporaryPassword = req.body?.temporaryPassword;
  if (typeof idToken !== 'string' || !idToken) {
    return res.status(401).json({ message: 'Please sign in again.' });
  }

  try {
    if (
      !process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN ||
      !process.env.AIRTABLE_BASE
    ) {
      throw new Error(
        'Firebase and Airtable account-linking configuration is missing.',
      );
    }
    const identityResult = await getFirebaseIdentity(idToken);
    if (identityResult.status) {
      return res.status(identityResult.status).json({
        message: identityResult.message,
      });
    }
    const { identity } = identityResult;

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

    // Linking an unclaimed ticket needs proof that the signer-in owns the ticket's email: the
    // temporary password emailed with the ticket, or a Firebase account whose email is verified.
    // Firebase does not verify emails at sign-up, so the email alone could be anyone's.
    if (!existingUid) {
      const ticketTemporaryPassword = ticket.fields['Temporary Password'];
      const hasTemporaryPassword =
        typeof temporaryPassword === 'string' &&
        Boolean(ticketTemporaryPassword) &&
        temporaryPassword === ticketTemporaryPassword;
      if (!hasTemporaryPassword && !identity.emailVerified) {
        return res.status(403).json({
          code: 'EMAIL_VERIFICATION_REQUIRED',
          message:
            'Please verify your email address. We sent a verification link to your inbox; open it, then log in again.',
        });
      }
    }

    // Link only an unclaimed active ticket; never overwrite another account's identity.
    const linkedTicket = existingUid
      ? ticket
      : (
          await table.update([
            { id: ticket.id, fields: { 'Firebase UID': identity.localId } },
          ])
        )[0];
    setUserSession(res, { recordId: linkedTicket.id, firebaseUid: identity.localId });
    // The temporary password has done its job once the account is linked, so it is not sent back.
    const user = { ...transformFields({ record: linkedTicket }), id: linkedTicket.id };
    delete user.temporaryPassword;
    return res.status(200).json({ user });
  } catch (error) {
    logSentryError(error, { action: 'link-reservation-account' });
    return res.status(500).json({
      message:
        'Unable to link your ticket to your account. Please try again or contact info@highlandsmusicfestival.ca.',
    });
  }
}
