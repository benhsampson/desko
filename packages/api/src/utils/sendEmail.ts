import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

type MailKey = {
  client_id: string;
  private_key: string;
};

export async function sendEmail(subject: string, to: string, html: string) {
  const mailKey = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../mailKey.json')).toString()
  ) as MailKey;
  console.log(process.env.NODEMAILER_USERNAME, mailKey);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: process.env.NODEMAILER_USERNAME,
      serviceClient: mailKey.client_id,
      privateKey: mailKey.private_key,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.NODEMAILER_USERNAME,
    to,
    subject,
    html,
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
