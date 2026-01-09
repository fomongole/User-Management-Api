import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Creating a transporter (using Ethereal for testing, or Gmail/SendGrid for prod)
  // For this demo, i use a "Stub" service so i don't need real credentials yet.
  // In a real app, i would put SMTP credentials in .env
  
  // For development, using Mailtrap or Ethereal. 
  // Using a standard setup that i can swap easily.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_EMAIL || 'test_user',
      pass: process.env.SMTP_PASSWORD || 'test_pass',
    },
  });

  // 2. Define email options
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html
  };

  // 3. Send email
  const info = await transporter.sendMail(message);

  console.log(`Message sent: ${info.messageId}`);
};

export default sendEmail;