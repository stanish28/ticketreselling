"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const index_1 = require("../index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, startDate, endDate, minPrice, maxPrice } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {};
        if (category)
            where.category = category;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { venue: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        if (minPrice || maxPrice) {
            where.tickets = {
                some: {
                    price: {
                        gte: minPrice ? Number(minPrice) : undefined,
                        lte: maxPrice ? Number(maxPrice) : undefined
                    }
                }
            };
        }
        const [events, total] = await Promise.all([
            index_1.prisma.event.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { date: 'asc' },
                include: {
                    _count: {
                        select: {
                            tickets: {
                                where: { status: 'AVAILABLE' },
                            },
                        },
                    },
                },
            }),
            index_1.prisma.event.count({ where })
        ]);
        res.json({
            success: true,
            data: {
                events,
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
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const event = await index_1.prisma.event.findUnique({
            where: { id },
            include: {
                tickets: {
                    where: { status: 'AVAILABLE' },
                    include: {
                        seller: {
                            select: { id: true, name: true, email: true, role: true }
                        },
                        _count: {
                            select: { bids: true }
                        }
                    },
                    orderBy: { price: 'asc' }
                },
                _count: {
                    select: { tickets: true }
                }
            }
        });
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        res.json({
            success: true,
            data: event
        });
    }
    catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});
router.post('/', [
    auth_1.authenticateToken,
    auth_1.requireAdmin,
    (0, express_validator_1.body)('title').trim().isLength({ min: 3 }),
    (0, express_validator_1.body)('description').trim().isLength({ min: 10 }),
    (0, express_validator_1.body)('venue').trim().notEmpty(),
    (0, express_validator_1.body)('date').isISO8601(),
    (0, express_validator_1.body)('category').trim().notEmpty(),
    (0, express_validator_1.body)('capacity').isInt({ min: 1 })
], async (req, res) => {
    try {
        console.log('Create event request body:', req.body);
        console.log('User making request:', req.user);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const eventData = req.body;
        console.log('Processed event data:', eventData);
        let event;
        try {
            event = await index_1.prisma.event.create({
                data: eventData
            });
            console.log('Created event:', event);
        }
        catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({ error: `Database error: ${dbError.message}` });
            return;
        }
        res.status(201).json({
            success: true,
            data: event,
            message: 'Event created successfully'
        });
    }
    catch (error) {
        console.error('Create event error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: `Failed to create event: ${error.message}` });
    }
});
router.put('/:id', [
    auth_1.authenticateToken,
    auth_1.requireAdmin,
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 3 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ min: 10 }),
    (0, express_validator_1.body)('venue').optional().trim().notEmpty(),
    (0, express_validator_1.body)('date').optional().isISO8601(),
    (0, express_validator_1.body)('category').optional().trim().notEmpty(),
    (0, express_validator_1.body)('capacity').optional().isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { id } = req.params;
        const updateData = req.body;
        const event = await index_1.prisma.event.update({
            where: { id },
            data: updateData
        });
        res.json({
            success: true,
            data: event,
            message: 'Event updated successfully'
        });
    }
    catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});
router.delete('/:id', [auth_1.authenticateToken, auth_1.requireAdmin], async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.event.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});
router.get('/categories', async (req, res) => {
    try {
        const categories = await index_1.prisma.event.findMany({
            select: { category: true },
            distinct: ['category']
        });
        res.json({
            success: true,
            data: categories.map((c) => c.category)
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map