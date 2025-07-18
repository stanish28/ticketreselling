"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const emailVerificationService_1 = require("../services/emailVerificationService");
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('phone').optional().custom((value) => {
        if (value === '' || value === null || value === undefined) {
            return true;
        }
        const phoneRegex = /^\+?1?\d{9,15}$/;
        if (!phoneRegex.test(value)) {
            throw new Error('Invalid phone number format');
        }
        return true;
    })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, name, password, phone } = req.body;
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(400).json({
                error: 'Account already exists',
                code: 'USER_ALREADY_EXISTS',
                message: 'An account with this email already exists. Please sign in or reset your password.',
                actions: ['signin', 'reset_password']
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await database_1.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                phone: phone && phone.trim() !== '' ? phone : null,
                emailVerified: null
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                emailVerified: true,
                createdAt: true
            }
        });
        try {
            const verificationToken = (0, emailVerificationService_1.generateVerificationToken)(user.id);
            await (0, emailVerificationService_1.sendVerificationEmail)(email, name, verificationToken);
        }
        catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            data: {
                user,
                token
            },
            message: 'User registered successfully. Please check your email to verify your account.'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        const user = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        if (user.banned) {
            res.status(403).json({
                error: 'Your account has been banned',
                code: 'USER_BANNED',
                message: 'Your account has been banned. Please contact support if you believe this is a mistake.'
            });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        if (!user.emailVerified && user.role !== 'ADMIN') {
            res.status(403).json({
                error: 'Email verification required',
                code: 'EMAIL_NOT_VERIFIED',
                message: 'Please verify your email address before logging in'
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            data: {
                user: userWithoutPassword,
                token
            },
            message: 'Login successful'
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const { password: _, ...userWithoutPassword } = req.user;
        res.json({
            success: true,
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            res.status(400).json({ error: 'Verification token is required' });
            return;
        }
        const result = await (0, emailVerificationService_1.verifyEmailToken)(token);
        if (!result.success) {
            res.status(400).json({ error: result.error });
            return;
        }
        res.json({
            success: true,
            message: 'Email verified successfully! You can now log in to your account.'
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Email verification failed' });
    }
});
router.post('/create-admin', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, name, password } = req.body;
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const updatedUser = await database_1.prisma.user.update({
                where: { email },
                data: {
                    name,
                    password: hashedPassword,
                    role: 'ADMIN',
                    emailVerified: new Date()
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    emailVerified: true,
                    createdAt: true
                }
            });
            const token = jsonwebtoken_1.default.sign({ userId: updatedUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.json({
                success: true,
                data: {
                    user: updatedUser,
                    token
                },
                message: 'User updated to admin successfully'
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await database_1.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'ADMIN',
                emailVerified: new Date()
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                emailVerified: true,
                createdAt: true
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            data: {
                user,
                token
            },
            message: 'Admin user created successfully'
        });
    }
    catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ error: 'Failed to create admin user' });
    }
});
router.post('/resend-verification', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email } = req.body;
        const result = await (0, emailVerificationService_1.resendVerificationEmail)(email);
        if (!result.success) {
            res.status(400).json({ error: result.error });
            return;
        }
        res.json({
            success: true,
            message: 'Verification email sent successfully. Please check your inbox.'
        });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Failed to resend verification email' });
    }
});
router.put('/profile', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail(),
    (0, express_validator_1.body)('phone').optional().trim().isLength({ max: 20 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, phone } = req.body;
        const userId = req.user.id;
        if (email) {
            const existingUser = await database_1.prisma.user.findFirst({
                where: {
                    email,
                    id: { not: userId }
                }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Email is already taken' });
            }
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone !== undefined && { phone: phone || null })
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                emailVerified: true,
                banned: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.json({
            success: true,
            data: { user: updatedUser },
            message: 'Profile updated successfully'
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
});
router.put('/change-password', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('currentPassword').notEmpty(),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });
        return res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ error: 'Failed to change password' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map