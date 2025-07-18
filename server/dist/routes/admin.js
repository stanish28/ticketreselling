"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAdmin);
router.get('/dashboard', async (req, res) => {
    try {
        const [totalUsers, totalEvents, totalTickets, totalRevenue, recentPurchases, topEvents] = await Promise.all([
            database_1.prisma.user.count(),
            database_1.prisma.event.count(),
            database_1.prisma.ticket.count(),
            database_1.prisma.purchase.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            }),
            database_1.prisma.purchase.findMany({
                where: { status: 'COMPLETED' },
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    ticket: {
                        include: {
                            event: {
                                select: {
                                    title: true,
                                    venue: true,
                                    date: true
                                }
                            },
                            buyer: {
                                select: {
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            }),
            database_1.prisma.event.findMany({
                take: 5,
                orderBy: { date: 'asc' },
                include: {
                    _count: {
                        select: { tickets: true }
                    }
                }
            })
        ]);
        const stats = {
            totalUsers,
            totalEvents,
            totalTickets,
            totalRevenue: totalRevenue._sum.amount || 0,
            recentPurchases,
            topEvents
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [users, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    banned: true,
                    _count: {
                        select: {
                            ticketsSold: true,
                            purchases: true,
                            bids: true
                        }
                    }
                }
            }),
            database_1.prisma.user.count({ where })
        ]);
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
router.put('/users/:id', [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('role').optional().isIn(['USER', 'ADMIN'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const updateData = req.body;
        const existingUser = await database_1.prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                banned: true,
                _count: {
                    select: {
                        ticketsSold: true,
                        purchases: true,
                        bids: true
                    }
                }
            }
        });
        return res.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        return res.status(500).json({ error: 'Failed to update user' });
    }
});
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existingUser = await database_1.prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (existingUser.role === 'ADMIN') {
            const adminCount = await database_1.prisma.user.count({
                where: { role: 'ADMIN' }
            });
            if (adminCount <= 1) {
                return res.status(400).json({ error: 'Cannot delete the last admin user' });
            }
        }
        await database_1.prisma.user.delete({
            where: { id }
        });
        return res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        return res.status(500).json({ error: 'Failed to delete user' });
    }
});
router.patch('/users/:id/ban', async (req, res) => {
    try {
        const { id } = req.params;
        const { banned } = req.body;
        if (typeof banned !== 'boolean') {
            res.status(400).json({ error: 'Missing or invalid banned value' });
            return;
        }
        if (req.user && req.user.id === id) {
            res.status(400).json({ error: 'You cannot ban/unban yourself' });
            return;
        }
        const user = await database_1.prisma.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (user.role === 'ADMIN') {
            res.status(403).json({ error: 'Cannot ban/unban another admin' });
            return;
        }
        const updated = await database_1.prisma.user.update({
            where: { id },
            data: { banned }
        });
        res.json({ success: true, user: updated, message: banned ? 'User banned' : 'User unbanned' });
        return;
    }
    catch (error) {
        console.error('Ban/unban user error:', error);
        res.status(500).json({ error: 'Failed to update user ban status' });
        return;
    }
});
router.post('/events', [
    (0, express_validator_1.body)('title').notEmpty().trim(),
    (0, express_validator_1.body)('description').notEmpty().trim(),
    (0, express_validator_1.body)('venue').notEmpty().trim(),
    (0, express_validator_1.body)('date').isISO8601(),
    (0, express_validator_1.body)('category').notEmpty().trim(),
    (0, express_validator_1.body)('capacity').isInt({ min: 1 }),
    (0, express_validator_1.body)('image').optional().isURL()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const eventData = req.body;
        const newEvent = await database_1.prisma.event.create({
            data: {
                ...eventData,
                date: new Date(eventData.date)
            }
        });
        return res.status(201).json({
            success: true,
            data: newEvent,
            message: 'Event created successfully'
        });
    }
    catch (error) {
        console.error('Create event error:', error);
        return res.status(500).json({ error: 'Failed to create event' });
    }
});
router.put('/events/:id', [
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('venue').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('date').optional().isISO8601(),
    (0, express_validator_1.body)('category').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('capacity').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('image').optional().isURL()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const updateData = req.body;
        const existingEvent = await database_1.prisma.event.findUnique({
            where: { id }
        });
        if (!existingEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const updatedEvent = await database_1.prisma.event.update({
            where: { id },
            data: {
                ...updateData,
                ...(updateData.date && { date: new Date(updateData.date) })
            },
            include: {
                _count: {
                    select: { tickets: true }
                }
            }
        });
        return res.json({
            success: true,
            data: updatedEvent,
            message: 'Event updated successfully'
        });
    }
    catch (error) {
        console.error('Update event error:', error);
        return res.status(500).json({ error: 'Failed to update event' });
    }
});
router.delete('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existingEvent = await database_1.prisma.event.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { tickets: true }
                }
            }
        });
        if (!existingEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (existingEvent._count.tickets > 0) {
            return res.status(400).json({
                error: 'Cannot delete event with existing tickets. Please delete all tickets first.'
            });
        }
        await database_1.prisma.event.delete({
            where: { id }
        });
        return res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete event error:', error);
        return res.status(500).json({ error: 'Failed to delete event' });
    }
});
router.get('/events', async (req, res) => {
    try {
        const { page = 1, limit = 20, category } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (category)
            where.category = category;
        const [events, total] = await Promise.all([
            database_1.prisma.event.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { date: 'asc' },
                include: {
                    _count: {
                        select: { tickets: true }
                    },
                    tickets: {
                        where: { status: 'SOLD' },
                        select: { price: true }
                    }
                }
            }),
            database_1.prisma.event.count({ where })
        ]);
        const eventsWithRevenue = events.map((event) => ({
            ...event,
            revenue: event.tickets.reduce((sum, ticket) => sum + ticket.price, 0)
        }));
        res.json({
            success: true,
            data: {
                events: eventsWithRevenue,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get admin events error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
        return;
    }
});
router.get('/tickets', async (req, res) => {
    try {
        const { page = 1, limit = 20, status, eventId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (status)
            where.status = status;
        if (eventId)
            where.eventId = eventId;
        const [tickets, total] = await Promise.all([
            database_1.prisma.ticket.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            venue: true,
                            date: true
                        }
                    },
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    _count: {
                        select: { bids: true }
                    }
                }
            }),
            database_1.prisma.ticket.count({ where })
        ]);
        res.json({
            success: true,
            data: {
                tickets,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get admin tickets error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
        return;
    }
});
router.put('/tickets/:id', [
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('section').optional().trim(),
    (0, express_validator_1.body)('row').optional().trim(),
    (0, express_validator_1.body)('seat').optional().trim(),
    (0, express_validator_1.body)('status').optional().isIn(['AVAILABLE', 'SOLD', 'RESERVED', 'EXPIRED']),
    (0, express_validator_1.body)('listingType').optional().isIn(['DIRECT_SALE', 'AUCTION'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const updateData = req.body;
        const existingTicket = await database_1.prisma.ticket.findUnique({
            where: { id }
        });
        if (!existingTicket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        const updatedTicket = await database_1.prisma.ticket.update({
            where: { id },
            data: updateData,
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        venue: true,
                        date: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: { bids: true }
                }
            }
        });
        return res.json({
            success: true,
            data: updatedTicket,
            message: 'Ticket updated successfully'
        });
    }
    catch (error) {
        console.error('Update ticket error:', error);
        return res.status(500).json({ error: 'Failed to update ticket' });
    }
});
router.delete('/tickets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const existingTicket = await database_1.prisma.ticket.findUnique({
            where: { id }
        });
        if (!existingTicket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        await database_1.prisma.$transaction(async (tx) => {
            await tx.bid.deleteMany({
                where: { ticketId: id }
            });
            await tx.purchase.deleteMany({
                where: { ticketId: id }
            });
            await tx.ticket.delete({
                where: { id }
            });
        });
        return res.json({
            success: true,
            message: 'Ticket deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete ticket error:', error);
        return res.status(500).json({ error: 'Failed to delete ticket' });
    }
});
router.get('/purchases', async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (status)
            where.status = status;
        const [purchases, total] = await Promise.all([
            database_1.prisma.purchase.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    ticket: {
                        include: {
                            event: {
                                select: {
                                    id: true,
                                    title: true,
                                    venue: true,
                                    date: true
                                }
                            }
                        }
                    },
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }),
            database_1.prisma.purchase.count({ where })
        ]);
        return res.json({
            success: true,
            data: {
                purchases,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get purchases error:', error);
        return res.status(500).json({ error: 'Failed to fetch purchases' });
    }
});
router.get('/analytics/revenue', async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = Number(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const revenue = await database_1.prisma.purchase.aggregate({
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: startDate
                }
            },
            _sum: { amount: true },
            _count: true
        });
        const dailyRevenue = await database_1.prisma.purchase.groupBy({
            by: ['createdAt'],
            where: {
                status: 'COMPLETED',
                createdAt: {
                    gte: startDate
                }
            },
            _sum: { amount: true },
            orderBy: { createdAt: 'asc' }
        });
        res.json({
            success: true,
            data: {
                totalRevenue: revenue._sum.amount || 0,
                totalTransactions: revenue._count,
                dailyRevenue
            }
        });
    }
    catch (error) {
        console.error('Get revenue analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch revenue analytics' });
        return;
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map