const nodemailer = require('nodemailer');

const createTransporter = async () => {
  const SMTP_HOST = process.env.SMTP_HOST;
  let SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
  const isGmailUser = SMTP_USER?.toLowerCase().endsWith('@gmail.com');

  if (SMTP_USER && SMTP_PASS) {
    const transportConfig = SMTP_HOST
      ? {
          host: SMTP_HOST,
          port: SMTP_PORT ?? (SMTP_SECURE ? 465 : 587),
          secure: SMTP_SECURE || SMTP_PORT === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
          tls: { rejectUnauthorized: false },
        }
      : isGmailUser
      ? {
          service: 'gmail',
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        }
      : {
          host: 'smtp.gmail.com',
          port: SMTP_PORT ?? 465,
          secure: true,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
          tls: { rejectUnauthorized: false },
        };

    return {
      transporter: nodemailer.createTransport(transportConfig),
      usingTestAccount: false,
      smtpConfig: transportConfig,
    };
  }

  const testAccount = await nodemailer.createTestAccount();
  return {
    transporter: nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    }),
    usingTestAccount: true,
  };
};

const sendContactEmail = async (contact) => {
  const SMTP_USER = process.env.SMTP_USER;
  const { transporter, usingTestAccount } = await createTransporter();
  const fromAddress = process.env.SMTP_FROM || (SMTP_USER ? `ShopSweet <${SMTP_USER}>` : 'ShopSweet <no-reply@shopsweet.com>');
  const adminEmail = process.env.SMTP_ADMIN_EMAIL || SMTP_USER;
  const replyToAddress = contact.email;

  const adminSubject = `New ShopSweet contact: ${contact.subject}`;
  const adminHtml = `
    <div style="font-family:Arial, sans-serif; color:#202124;">
      <h2>New contact message received</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Phone:</strong> ${contact.phone}</p>
      <p><strong>Subject:</strong> ${contact.subject}</p>
      <div style="margin-top:16px; padding:16px; border:1px solid #e2e8f0; border-radius:12px; background:#f8fafc;">
        <p><strong>Message:</strong><br/>${contact.message.replace(/\n/g, '<br/>')}</p>
      </div>
      <p style="margin-top:24px;">Reply directly to this user at <a href="mailto:${contact.email}">${contact.email}</a>.</p>
    </div>
  `;

  const adminText = `New contact message received\n\nName: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone}\nSubject: ${contact.subject}\n\nMessage:\n${contact.message}\n\nReply directly to: ${contact.email}`;

  const notificationOptions = {
    from: fromAddress,
    to: adminEmail || contact.email,
    subject: adminSubject,
    text: adminText,
    html: adminHtml,
    replyTo: replyToAddress,
  };

  const responseInfo = { sentToAdmin: null, sentToUser: null };

  const infoAdmin = await transporter.sendMail(notificationOptions);
  responseInfo.sentToAdmin = infoAdmin;

  if (adminEmail) {
    const userSubject = `ShopSweet received your message: ${contact.subject}`;
    const userHtml = `
      <div style="font-family:Arial, sans-serif; color:#202124;">
        <h2>Thanks for reaching out, ${contact.name}!</h2>
        <p>Your message has been received by ShopSweet. We will reply as soon as possible.</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <div style="margin-top:16px; padding:16px; border:1px solid #e2e8f0; border-radius:12px; background:#f8fafc;">
          <p><strong>Message:</strong><br/>${contact.message.replace(/\n/g, '<br/>')}</p>
        </div>
        <p style="margin-top:24px;">Warmly,<br/>The ShopSweet Team</p>
      </div>
    `;
    const userText = `Thanks for reaching out, ${contact.name}!\n\nWe have received your message and will reply soon.\n\nSubject: ${contact.subject}\nMessage: ${contact.message}\n\nWarmly,\nThe ShopSweet Team`;

    const userOptions = {
      from: fromAddress,
      to: contact.email,
      subject: userSubject,
      text: userText,
      html: userHtml,
    };

    const infoUser = await transporter.sendMail(userOptions);
    responseInfo.sentToUser = infoUser;
  }

  const previewUrl = usingTestAccount ? nodemailer.getTestMessageUrl(infoAdmin) : undefined;
  if (previewUrl) {
    console.info('✅ Preview email URL:', previewUrl);
  }

  return { previewUrl, usingTestAccount };
};

module.exports = { sendContactEmail };
