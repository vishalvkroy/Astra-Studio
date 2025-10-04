import nodemailer from 'nodemailer';

// Create a test account for development
const createTestAccount = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      return {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      };
    } catch (error) {
      console.warn('Failed to create test account, using fallback config');
      return {
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'test@example.com',
          pass: process.env.EMAIL_PASS || 'test123',
        },
      };
    }
  }
  
  return {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
};

let transporter: nodemailer.Transporter;

const initializeTransporter = async () => {
  const config = await createTestAccount();
  transporter = nodemailer.createTransport(config);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(' Email transporter initialized with test account');
  }
};

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const config = await createTestAccount();
    this.transporter = nodemailer.createTransport(config);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email transporter initialized with test account');
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    if (!this.transporter) {
      await this.initializeTransporter();
    }
    
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #00C9A7, #845EC2); padding: 20px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .button { display: inline-block; background: #00C9A7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 3D Education App</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName}!</h2>
              <p>Welcome to our 3D Education Platform! Please verify your email address to get started with your learning journey.</p>
              <p>Click the button below to verify your email:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 3D Education App. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.transporter!.sendMail({
      from: `"3D Education App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    if (!this.transporter) {
      await this.initializeTransporter();
    }
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #00C9A7, #845EC2); padding: 20px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .button { display: inline-block; background: #00C9A7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 3D Education App</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName}!</h2>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 3D Education App. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.transporter!.sendMail({
      from: `"3D Education App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html,
    });
  }
}

export const emailService = new EmailService();
