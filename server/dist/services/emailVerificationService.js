"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationEmail = exports.verifyEmailToken = exports.sendVerificationEmail = exports.generateVerificationToken = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const generateVerificationToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId, type: 'email-verification' }, process.env.JWT_SECRET, { expiresIn: '24h' });
};
exports.generateVerificationToken = generateVerificationToken;
const sendVerificationEmail = async (email, name, token) => {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔐 Verify Your FastPass Account',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🔐 FastPass Account Verification</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Welcome to FastPass!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for creating your FastPass account! To complete your registration and start buying and selling tickets, 
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
          <p>Thank you for choosing FastPass!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `
    };
    await transporter.sendMail(mailOptions);
};
exports.sendVerificationEmail = sendVerificationEmail;
const verifyEmailToken = async (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'email-verification') {
            return { success: false, error: 'Invalid token type' };
        }
        const userId = decoded.userId;
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        if (user.emailVerified) {
            return { success: false, error: 'Email already verified' };
        }
        await index_1.prisma.user.update({
            where: { id: userId },
            data: { emailVerified: new Date() }
        });
        return { success: true, userId };
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return { success: false, error: 'Verification link has expired' };
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return { success: false, error: 'Invalid verification link' };
        }
        return { success: false, error: 'Verification failed' };
    }
};
exports.verifyEmailToken = verifyEmailToken;
const resendVerificationEmail = async (email) => {
    try {
        const user = await index_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        if (user.emailVerified) {
            return { success: false, error: 'Email already verified' };
        }
        const token = (0, exports.generateVerificationToken)(user.id);
        await (0, exports.sendVerificationEmail)(user.email, user.name, token);
        return { success: true };
    }
    catch (error) {
        console.error('Resend verification email error:', error);
        return { success: false, error: 'Failed to send verification email' };
    }
};
exports.resendVerificationEmail = resendVerificationEmail;
//# sourceMappingURL=emailVerificationService.js.map