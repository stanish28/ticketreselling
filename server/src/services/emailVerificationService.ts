import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

// Email transporter configuration (reusing existing setup)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate verification token
export const generateVerificationToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'email-verification' },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' } // Token expires in 24 hours
  );
};

// Send verification email
export const sendVerificationEmail = async (email: string, name: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔐 Verify Your LayLow-India Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🔐 LayLow-India Account Verification</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Welcome to LayLow-India!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for creating your LayLow-India account! To complete your registration and start buying and selling tickets, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ✅ Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Or copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-top: 30px;">
            <h4 style="color: #333; margin-top: 0;">📋 Important Information</h4>
            <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
              <li>This verification link expires in 24 hours</li>
              <li>You must verify your email to access all features</li>
              <li>If you didn't create this account, you can safely ignore this email</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Thank you for choosing LayLow-India!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Verify email token
export const verifyEmailToken = async (token: string): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if token is for email verification
    if (decoded.type !== 'email-verification') {
      return { success: false, error: 'Invalid token type' };
    }

    const userId = decoded.userId;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return { success: false, error: 'Email already verified' };
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() }
    });

    return { success: true, userId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, error: 'Verification link has expired' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, error: 'Invalid verification link' };
    }
    return { success: false, error: 'Verification failed' };
  }
};

// Resend verification email
export const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email already verified' };
    }

    const token = generateVerificationToken(user.id);
    await sendVerificationEmail(user.email, user.name, token);

    return { success: true };
  } catch (error) {
    console.error('Resend verification email error:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
}; 