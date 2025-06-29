"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const index_1 = require("../index");
const auth_1 = require("../middleware/auth");
const payment_1 = require("../utils/payment");
const qrCode_1 = require("../utils/qrCode");
const email_1 = require("../utils/email");
const router = express_1.default.Router();
router.get('/my', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const tickets = await index_1.prisma.ticket.findMany({
            where: {
                buyerId: userId,
                status: 'SOLD',
            },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        venue: true,
                        date: true,
                        image: true,
                        category: true,
                    },
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    },
                },
                purchase: {
                    select: {
                        createdAt: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        const transformedTickets = tickets.map(ticket => ({
            ...ticket,
            purchasedAt: ticket.purchase?.createdAt || ticket.updatedAt,
            qrCode: `TICKET:${ticket.id}:${Date.now()}`,
        }));
        res.json({
            success: true,
            data: transformedTickets,
        });
    }
    catch (error) {
        console.error('Get user tickets error:', error);
        res.status(500).json({ error: 'Failed to fetch user tickets' });
    }
});
router.get('/my-listings', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const listings = await index_1.prisma.ticket.findMany({
            where: {
                sellerId: userId,
                status: 'AVAILABLE',
            },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        venue: true,
                        date: true,
                    },
                },
                _count: {
                    select: { bids: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: listings,
        });
    }
    catch (error) {
        console.error('Get user listings error:', error);
        res.status(500).json({ error: 'Failed to fetch user listings' });
    }
});
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, eventId, status, listingType, minPrice, maxPrice, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            status: 'AVAILABLE',
        };
        if (eventId)
            where.eventId = eventId;
        if (listingType)
            where.listingType = listingType;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = Number(minPrice);
            if (maxPrice)
                where.price.lte = Number(maxPrice);
        }
        if (search) {
            where.event = {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { venue: { contains: search, mode: 'insensitive' } }
                ]
            };
        }
        const [tickets, total] = await Promise.all([
            index_1.prisma.ticket.findMany({
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
                            date: true,
                            image: true
                        }
                    },
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
                    _count: {
                        select: { bids: true }
                    }
                }
            }),
            index_1.prisma.ticket.count({ where })
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
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await index_1.prisma.ticket.findUnique({
            where: { id },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        venue: true,
                        date: true,
                        image: true
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                bids: {
                    include: {
                        bidder: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: { amount: 'desc' },
                    take: 10
                },
                _count: {
                    select: { bids: true }
                }
            }
        });
        if (!ticket) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        res.json({
            success: true,
            data: ticket
        });
    }
    catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
});
router.post('/', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('eventId').notEmpty(),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }),
    (0, express_validator_1.body)('listingType').isIn(['DIRECT_SALE', 'AUCTION']),
    (0, express_validator_1.body)('endTime').optional().isISO8601()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const ticketData = req.body;
        const userId = req.user.id;
        const event = await index_1.prisma.event.findUnique({
            where: { id: ticketData.eventId }
        });
        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }
        const ticket = await index_1.prisma.ticket.create({
            data: {
                ...ticketData,
                sellerId: userId,
                endTime: ticketData.endTime ? new Date(ticketData.endTime) : null
            },
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
                        email: true,
                        role: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: ticket,
            message: 'Ticket listed successfully'
        });
    }
    catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Failed to list ticket' });
    }
});
router.post('/:id/purchase', auth_1.authenticateToken, async (req, res) => {
    try {
        console.log('Purchase endpoint called');
        const { id } = req.params;
        const userId = req.user.id;
        const { cardNumber, expiryDate, cvv } = req.body;
        console.log('Purchase request:', { id, userId, cardNumber: cardNumber ? 'provided' : 'missing' });
        if (!cardNumber || !expiryDate || !cvv) {
            console.log('Payment validation failed');
            return res.status(400).json({ error: 'Payment information is required' });
        }
        const ticket = await index_1.prisma.ticket.findUnique({
            where: { id },
            include: {
                event: true,
                seller: true,
            },
        });
        console.log('Ticket found:', ticket ? 'yes' : 'no');
        if (!ticket) {
            console.log('Ticket not found');
            return res.status(404).json({ error: 'Ticket not found' });
        }
        if (ticket.status !== 'AVAILABLE') {
            console.log('Ticket not available, status:', ticket.status);
            return res.status(400).json({ error: 'Ticket is not available for purchase' });
        }
        if (ticket.listingType === 'AUCTION') {
            console.log('Auction ticket cannot be purchased directly');
            return res.status(400).json({ error: 'Auction tickets cannot be purchased directly' });
        }
        if (ticket.sellerId === userId) {
            console.log('User trying to purchase their own ticket');
            return res.status(400).json({ error: 'You cannot purchase your own ticket' });
        }
        console.log('Processing payment...');
        const paymentResult = await (0, payment_1.processPayment)({
            amount: ticket.price,
            cardNumber,
            expiryDate,
            cvv,
        });
        console.log('Payment result:', paymentResult.success);
        if (!paymentResult.success) {
            console.log('Payment failed');
            return res.status(400).json({ error: 'Payment failed' });
        }
        console.log('Updating ticket status...');
        const updatedTicket = await index_1.prisma.ticket.update({
            where: { id },
            data: {
                status: 'SOLD',
                buyerId: userId,
            },
            include: {
                event: true,
                seller: true,
                buyer: true,
            },
        });
        console.log('Creating purchase record...');
        await index_1.prisma.purchase.upsert({
            where: {
                ticketId: id,
            },
            update: {
                buyerId: userId,
                amount: ticket.price,
                status: 'COMPLETED',
            },
            create: {
                ticketId: id,
                buyerId: userId,
                amount: ticket.price,
                status: 'COMPLETED',
            },
        });
        console.log('Generating QR code...');
        const qrCodeData = (0, qrCode_1.generateQRCodeSync)(updatedTicket.id);
        console.log('Sending email notifications...');
        if (updatedTicket.buyer) {
            try {
                await (0, email_1.sendPurchaseConfirmationEmail)({
                    to: updatedTicket.buyer.email,
                    ticket: {
                        id: updatedTicket.id,
                        price: updatedTicket.price,
                        event: updatedTicket.event,
                        seller: updatedTicket.seller,
                        buyer: {
                            name: updatedTicket.buyer.name,
                            email: updatedTicket.buyer.email,
                        },
                    },
                    qrCodeData,
                });
                console.log('Buyer email sent successfully');
            }
            catch (emailError) {
                console.error('Failed to send purchase confirmation email:', emailError);
            }
        }
        try {
            await (0, email_1.sendSaleNotificationEmail)({
                to: updatedTicket.seller.email,
                ticket: {
                    id: updatedTicket.id,
                    price: updatedTicket.price,
                    event: updatedTicket.event,
                    seller: updatedTicket.seller,
                    buyer: updatedTicket.buyer ? {
                        name: updatedTicket.buyer.name,
                        email: updatedTicket.buyer.email,
                    } : undefined,
                },
            });
            console.log('Seller email sent successfully');
        }
        catch (emailError) {
            console.error('Failed to send sale notification email:', emailError);
        }
        console.log('Sending success response...');
        return res.json({
            message: 'Ticket purchased successfully',
            data: {
                ...updatedTicket,
                qrCode: qrCodeData,
            },
        });
    }
    catch (error) {
        console.error('Purchase error:', error);
        return res.status(500).json({ error: 'Failed to purchase ticket' });
    }
});
router.put('/:id', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('section').optional().trim(),
    (0, express_validator_1.body)('row').optional().trim(),
    (0, express_validator_1.body)('seat').optional().trim()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { id } = req.params;
        const userId = req.user.id;
        const updateData = req.body;
        const ticket = await index_1.prisma.ticket.findUnique({
            where: { id }
        });
        if (!ticket) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        if (ticket.sellerId !== userId) {
            res.status(403).json({ error: 'Not authorized to update this ticket' });
            return;
        }
        if (ticket.status !== 'AVAILABLE') {
            res.status(400).json({ error: 'Cannot update sold ticket' });
            return;
        }
        const updatedTicket = await index_1.prisma.ticket.update({
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
                }
            }
        });
        res.json({
            success: true,
            data: updatedTicket,
            message: 'Ticket updated successfully'
        });
    }
    catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const ticket = await index_1.prisma.ticket.findUnique({
            where: { id }
        });
        if (!ticket) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        if (ticket.sellerId !== userId) {
            res.status(403).json({ error: 'Not authorized to delete this ticket' });
            return;
        }
        if (ticket.status !== 'AVAILABLE') {
            res.status(400).json({ error: 'Cannot delete sold ticket' });
            return;
        }
        await index_1.prisma.ticket.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Ticket deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete ticket error:', error);
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
});
router.put('/:id/resell', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { price, listingType } = req.body;
        const ticket = await index_1.prisma.ticket.findUnique({
            where: { id },
        });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        if (ticket.buyerId !== userId) {
            return res.status(403).json({ error: 'You are not the owner of this ticket' });
        }
        const updatedTicket = await index_1.prisma.ticket.update({
            where: { id },
            data: {
                price: price,
                listingType: listingType,
                status: 'AVAILABLE',
                buyerId: null,
                sellerId: userId,
            },
            include: {
                event: true,
                seller: true,
            },
        });
        return res.json({
            success: true,
            data: updatedTicket,
            message: 'Ticket relisted for sale',
        });
    }
    catch (error) {
        console.error('Resell ticket error:', error);
        return res.status(500).json({ error: 'Failed to relist ticket' });
    }
});
router.put('/:id/cancel-listing', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const ticket = await index_1.prisma.ticket.findUnique({
            where: { id },
            include: {
                event: true,
                seller: true,
            },
        });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        if (ticket.sellerId !== userId) {
            return res.status(403).json({ error: 'You are not the seller of this ticket' });
        }
        if (ticket.status !== 'AVAILABLE') {
            return res.status(400).json({ error: 'Cannot cancel a sold ticket' });
        }
        const pendingBids = await index_1.prisma.bid.findMany({
            where: {
                ticketId: id,
                status: 'PENDING',
            },
        });
        if (pendingBids.length > 0) {
            return res.status(400).json({
                error: 'Cannot cancel listing with pending bids. Please reject all bids first.'
            });
        }
        const updatedTicket = await index_1.prisma.ticket.update({
            where: { id },
            data: {
                status: 'SOLD',
                sellerId: userId,
                buyerId: userId,
                listingType: 'DIRECT_SALE',
            },
            include: {
                event: true,
                buyer: true,
            },
        });
        await index_1.prisma.bid.deleteMany({
            where: { ticketId: id },
        });
        return res.json({
            success: true,
            data: updatedTicket,
            message: 'Listing cancelled successfully. Ticket returned to your purchased tickets.',
        });
    }
    catch (error) {
        console.error('Cancel listing error:', error);
        return res.status(500).json({ error: 'Failed to cancel listing' });
    }
});
exports.default = router;
//# sourceMappingURL=tickets.js.map