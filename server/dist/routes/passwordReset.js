"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passwordResetService_1 = require("../services/passwordResetService");
const router = express_1.default.Router();
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const result = await (0, passwordResetService_1.requestPasswordReset)(email);
        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }
        res.json({
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/verify-reset-token', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        const result = await (0, passwordResetService_1.verifyPasswordResetToken)(token);
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }
        res.json({
            message: 'Token is valid',
            userId: result.userId
        });
    }
    catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        const tokenResult = await (0, passwordResetService_1.verifyPasswordResetToken)(token);
        if (!tokenResult.success) {
            return res.status(400).json({ error: tokenResult.error });
        }
        const resetResult = await (0, passwordResetService_1.resetPassword)(tokenResult.userId, newPassword);
        if (!resetResult.success) {
            return res.status(500).json({ error: resetResult.error });
        }
        res.json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=passwordReset.js.map