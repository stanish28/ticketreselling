import express from 'express';
import { requestPasswordReset, verifyPasswordResetToken, resetPassword } from '../services/passwordResetService';

const router = express.Router();

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await requestPasswordReset(email);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Always return success to prevent email enumeration
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
    return;
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Verify reset token
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const result = await verifyPasswordResetToken(token);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ 
      message: 'Token is valid',
      userId: result.userId 
    });
    return;
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verify token first
    const tokenResult = await verifyPasswordResetToken(token);
    if (!tokenResult.success) {
      return res.status(400).json({ error: tokenResult.error });
    }

    // Reset password
    const resetResult = await resetPassword(tokenResult.userId!, newPassword);

    if (!resetResult.success) {
      return res.status(500).json({ error: resetResult.error });
    }

    res.json({ message: 'Password has been reset successfully' });
    return;
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

export default router; 