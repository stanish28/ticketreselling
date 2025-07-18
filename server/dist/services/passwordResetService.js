"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPasswordReset = exports.resetPassword = exports.verifyPasswordResetToken = exports.sendPasswordResetEmail = exports.generatePasswordResetToken = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("../index");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const generatePasswordResetToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId, type: 'password-reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
exports.generatePasswordResetToken = generatePasswordResetToken;
const sendPasswordResetEmail = async (email, name, token) => {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '🔐 Reset Your FastPass Password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">FastPass Account Security</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your FastPass account password. If you didn't make this request, 
            you can safely ignore this email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🔑 Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-top: 30px;">
            <h4 style="color: #333; margin-top: 0;">📋 Important Information</h4>
            <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
              <li>This reset link expires in 1 hour</li>
              <li>If you didn't request this, your password is still secure</li>
              <li>For security, this link can only be used once</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Thank you for using FastPass!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `
    };
    await transporter.sendMail(mailOptions);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const verifyPasswordResetToken = async (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'password-reset') {
            return { success: false, error: 'Invalid token type' };
        }
        const userId = decoded.userId;
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        return { success: true, userId };
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return { success: false, error: 'Reset link has expired' };
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return { success: false, error: 'Invalid reset link' };
        }
        return { success: false, error: 'Token verification failed' };
    }
};
exports.verifyPasswordResetToken = verifyPasswordResetToken;
const resetPassword = async (userId, newPassword) => {
    try {
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await index_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return { success: true };
    }
    catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: 'Failed to reset password' };
    }
};
exports.resetPassword = resetPassword;
const requestPasswordReset = async (email) => {
    try {
        const user = await index_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return { success: true };
        }
        const token = (0, exports.generatePasswordResetToken)(user.id);
        await (0, exports.sendPasswordResetEmail)(user.email, user.name, token);
        return { success: true };
    }
    catch (error) {
        console.error('Request password reset error:', error);
        return { success: false, error: 'Failed to send reset email' };
    }
};
exports.requestPasswordReset = requestPasswordReset;
//# sourceMappingURL=passwordResetService.js.map