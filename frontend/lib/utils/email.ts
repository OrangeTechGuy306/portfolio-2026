import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@portfolio.com';
const FROM_NAME = process.env.FROM_NAME || 'Portfolio';

/**
 * Create email transporter
 */
function createTransporter() {
  return nodemailer.createTransporter({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Send email
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<boolean> {
  try {
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('Email credentials not configured. Email not sent.');
      return false;
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send contact form notification
 */
export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || SMTP_USER;

  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Subject:</strong> ${data.subject}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message.replace(/\n/g, '<br>')}</p>
    <hr>
    <p><small>This email was sent from your portfolio contact form.</small></p>
  `;

  const text = `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

---
This email was sent from your portfolio contact form.
  `;

  return sendEmail({
    to: adminEmail,
    subject: `Portfolio Contact: ${data.subject}`,
    text,
    html,
  });
}

/**
 * Send contact form reply
 */
export async function sendContactReply(data: {
  to: string;
  name: string;
  replyMessage: string;
}): Promise<boolean> {
  const html = `
    <h2>Reply to Your Contact Form Submission</h2>
    <p>Hi ${data.name},</p>
    <p>${data.replyMessage.replace(/\n/g, '<br>')}</p>
    <hr>
    <p><small>This is a reply to your portfolio contact form submission.</small></p>
  `;

  const text = `
Hi ${data.name},

${data.replyMessage}

---
This is a reply to your portfolio contact form submission.
  `;

  return sendEmail({
    to: data.to,
    subject: 'Reply to Your Contact Form Submission',
    text,
    html,
  });
}

