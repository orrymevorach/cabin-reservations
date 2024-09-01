import { replaceCamelCaseWithSpaces } from '@/utils/string-utils';

let nodemailer = require('nodemailer');

export default async function handler(req, res) {
  const { groupMember, cabin, selectedBeds, host } = req.body;

  let transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    auth: {
      user: process.env.MAILGUN_USER,
      pass: process.env.MAILGUN_SMTP_PASSWORD,
    },
  });

  const selectedBed = selectedBeds.find(
    ({ name }) => name === groupMember.name
  );
  const selectedBedName = selectedBed
    ? replaceCamelCaseWithSpaces(selectedBed.bedName)
    : 'No bed selected';
  const hasBed = selectedBedName !== 'No bed selected';

  const subject = hasBed
    ? 'Bed Reservation Confirmed'
    : 'Cabin Reservation Confirmed';

  const isHost = groupMember.emailAddress === host.emailAddress;

  await transporter.sendMail({
    from: 'Highlands Music Festival noreply@reservations.highlandsmusicfestival.ca',
    to: groupMember.emailAddress,
    subject,
    html: `
      <div>
        <img style="width:400px;"src="https://reservations.highlandsmusicfestival.ca/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FLogo-1200px-No-Bkgd-min.effb0614.png&w=3840&q=75" />
        <p>Your reservation is confirmed!</p>
        <p style="display:flex;"><span style="display:block;width:45px;">Cabin:</span> <span style="display:block;font-weight:bold;">${
          cabin.name
        }</span></p>
        <p style="display:flex;"><span style="display:block;width:45px;">Unit:</span> <span style="display:block;font-weight:bold;">${
          cabin.unit
        }</span></p>
        <p style="display:flex;"><span style="display:block;width:45px;">Bed:</span> <span style="display:block;font-weight:bold;text-transform:capitalize">${selectedBedName}</span>${
      !hasBed
        ? `<span style="display:block;;margin-left:5px;">(<a href="http://localhost:3000/summary?stage=BED_SELECTION">Click here</a> to reserve your bed</span>)`
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
}
