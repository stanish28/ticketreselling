import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const requireEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if email is verified
    if (!req.user.emailVerified) {
      res.status(403).json({ 
        error: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address before accessing this feature'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Email verification middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const optionalEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Add email verification status to request for optional checking
    req.userEmailVerified = !!req.user.emailVerified;
    next();
  } catch (error) {
    console.error('Optional email verification middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 