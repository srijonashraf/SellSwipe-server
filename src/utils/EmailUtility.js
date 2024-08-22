import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
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

const EmailSend = async (EmailTo, EmailSubject, EmailText) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_NAME} <${process.env.EMAIL_USER}>`,
      to: EmailTo,
      subject: EmailSubject,
      html: EmailText,
    };
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

export default EmailSend;
