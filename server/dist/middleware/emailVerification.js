"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalEmailVerification = exports.requireEmailVerification = void 0;
const requireEmailVerification = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!req.user.emailVerified) {
            res.status(403).json({
                error: 'Email verification required',
                code: 'EMAIL_NOT_VERIFIED',
                message: 'Please verify your email address before accessing this feature'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Email verification middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.requireEmailVerification = requireEmailVerification;
const optionalEmailVerification = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        req.userEmailVerified = !!req.user.emailVerified;
        next();
    }
    catch (error) {
        console.error('Optional email verification middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.optionalEmailVerification = optionalEmailVerification;
//# sourceMappingURL=emailVerification.js.map