// test-email.ts (create this in your backend root)
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

async function testEmail() {
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Test the connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send a test email
    const info = await transporter.sendMail({
      from: `"3D Education App" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email',
      text: 'If you receive this, your email service is working!',
      html: '<p>If you receive this, your <strong>email service is working</strong>!</p>',
    });

    console.log('✅ Test email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmail();
