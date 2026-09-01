import { replaceCamelCaseWithSpaces } from '@/utils/string-utils';
import { sendEmail } from '@/lib/emails';

export default async function handler(req, res) {
  try {
    const { groupMember, cabin, selectedBeds = [], host } = req.body;

    const selectedBed = selectedBeds.find(
      ({ name }) => name === groupMember.name,
    );
    const selectedBedName = selectedBed
      ? replaceCamelCaseWithSpaces(selectedBed.bedName)
      : 'No bed selected';
    const hasBed = selectedBedName !== 'No bed selected';

    const subject = hasBed
      ? 'Bed Reservation Confirmed'
      : 'Cabin Reservation Confirmed';

    const isHost = groupMember.emailAddress === host.emailAddress;

    await sendEmail({
      emailAddress: groupMember.emailAddress,
      subject,
      html: `
      <div>
        <img style="width:400px;" src="https://reservations.highlandsmusicfestival.ca/Logo-1200px-No-Bkgd-min.png" />
        <p>Your reservation is confirmed!</p>
        <p style="display:flex;"><span style="display:block;width:45px;">Cabin:</span> <span style="display:block;font-weight:bold;">${
          cabin.name
        }</span></p>
        <p style="display:flex;"><span style="display:block;width:45px;">Unit:</span> <span style="display:block;font-weight:bold;">${
          cabin.unit
        }</span></p>
        <p style="display:flex;"><span style="display:block;width:45px;">Bed:</span> <span style="display:block;font-weight:bold;text-transform:capitalize">${selectedBedName}</span>${
          !hasBed
            ? `<span style="display:block;;margin-left:5px;">(<a href="https://reservations.highlandsmusicfestival.ca/summary?stage=BED_SELECTION">Click here</a> to reserve your bed</span>)`
            : ''
        }</p>
    ${
      !isHost
        ? `<p>This reservation was made on your behalf by ${host.name}. If you do not know this person, please contact us.`
        : ''
    }    
        <p>To view or modify your reservation, <a href="https://reservations.highlandsmusicfestival.ca">click here</a>.</p>
        <p>If you have any question or concerns, please contact us at info@highlandsmusicfestival.ca</p>
        <p><em>Please do not reply to this email</em></p>
      </div>
      `,
    });

    res.status(200).json({});
  } catch {
    res.status(500).json({ error: 'Unable to send cabin confirmation email.' });
  }
}
