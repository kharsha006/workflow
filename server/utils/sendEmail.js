const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (process.env.NODE_ENV === 'production') {
    console.log('--- MOCK EMAIL SENT ---');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('-----------------------');
    return;
  }

  // Use Ethereal Mail for local testing
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  const message = {
    from: '"WorkFlow Admin" <noreply@workflow-company.com>',
    // Overriding the 'to' address to the requested testing email:
    to: 'harshakadiyala2006@gmail.com', 
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;
