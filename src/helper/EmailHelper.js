import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const EmailSend = async (EmailTo, EmailText, EmailSubject) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", //Delete this when in hosting deployment
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: EmailTo,
    subject: EmailSubject,
    html: EmailText,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

export default EmailSend;
