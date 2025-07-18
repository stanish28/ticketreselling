"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/ticket/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const bids = await database_1.prisma.bid.findMany({
            where: { ticketId },
            orderBy: { amount: 'desc' },
        });
        res.json({
            success: true,
            data: bids,
        });
    }
    catch (error) {
        console.error('Get bids error:', error);
        res.status(500).json({ error: 'Failed to fetch bids' });
    }
});
router.post('/:ticketId', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('amount').isFloat({ min: 0 }),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { ticketId } = req.params;
        const { amount } = req.body;
        const userId = req.user.id;
        const ticket = await database_1.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                event: true,
                seller: true,
            },
        });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        if (ticket.status !== 'AVAILABLE') {
            return res.status(400).json({ error: 'Ticket is not available for bidding' });
        }
        if (ticket.listingType !== 'AUCTION') {
            return res.status(400).json({ error: 'This ticket is not an auction' });
        }
        if (ticket.sellerId === userId) {
            return res.status(400).json({ error: 'You cannot bid on your own ticket' });
        }
        if (ticket.endTime && new Date() > ticket.endTime) {
            return res.status(400).json({ error: 'Auction has ended' });
        }
        const highestBid = await database_1.prisma.bid.findFirst({
            where: { ticketId },
            orderBy: { amount: 'desc' },
        });
        const existingUserBid = await database_1.prisma.bid.findFirst({
            where: {
                ticketId,
                bidderId: userId,
                status: 'PENDING',
            },
        });
        const currentHighestAmount = highestBid?.amount || 0;
        const minBidAmount = Math.max(1, currentHighestAmount * 1.1);
        if (amount < minBidAmount) {
            return res.status(400).json({
                error: `Bid must be at least ₹${minBidAmount.toFixed(2)} (10% higher than current highest bid)`
            });
        }
        let bid;
        let message;
        if (existingUserBid) {
            bid = await database_1.prisma.bid.update({
                where: { id: existingUserBid.id },
                data: { amount },
            });
            message = 'Bid updated successfully';
        }
        else {
            bid = await database_1.prisma.bid.create({
                data: {
                    ticketId,
                    bidderId: userId,
                    amount,
                },
            });
            message = 'Bid placed successfully';
        }
        return res.status(201).json({
            success: true,
            data: bid,
            message,
        });
    }
    catch (error) {
        console.error('Place bid error:', error);
        return res.status(500).json({ error: 'Failed to place bid' });
    }
});
router.get('/user/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const bids = await database_1.prisma.bid.findMany({
            where: { bidderId: userId },
            include: {
                ticket: {
                    include: {
                        event: {
                            select: {
                                id: true,
                                title: true,
                                venue: true,
                                date: true,
                                image: true,
                            },
                        },
                        seller: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: bids,
        });
    }
    catch (error) {
        console.error('Get user bids error:', error);
        res.status(500).json({ error: 'Failed to fetch user bids' });
    }
});
router.put('/:bidId/accept', auth_1.authenticateToken, async (req, res) => {
    try {
        const { bidId } = req.params;
        const userId = req.user.id;
        console.log(`Accepting offer ${bidId} for user ${userId}`);
        const bid = await database_1.prisma.bid.findUnique({
            where: { id: bidId },
            include: {
                ticket: {
                    include: {
                        event: true,
                        seller: true,
                    },
                },
                bidder: true,
            },
        });
        if (!bid) {
            console.log('Offer not found');
            return res.status(404).json({ error: 'Offer not found' });
        }
        console.log(`Found bid: ${bid.id}, status: ${bid.status}, ticket status: ${bid.ticket.status}`);
        if (bid.ticket.sellerId !== userId) {
            console.log(`User ${userId} is not the seller ${bid.ticket.sellerId}`);
            return res.status(403).json({ error: 'Only the seller can accept offers' });
        }
        if (bid.ticket.status !== 'AVAILABLE') {
            console.log(`Ticket ${bid.ticketId} is not available, status: ${bid.ticket.status}`);
            return res.status(400).json({ error: 'Ticket is no longer available' });
        }
        if (bid.status !== 'PENDING') {
            console.log(`Bid ${bidId} is not pending, status: ${bid.status}`);
            return res.status(400).json({ error: 'Offer has already been processed' });
        }
        console.log('Starting transaction...');
        const result = await database_1.prisma.$transaction(async (tx) => {
            console.log('Updating bid status to ACCEPTED...');
            const updatedBid = await tx.bid.update({
                where: { id: bidId },
                data: { status: 'ACCEPTED' },
            });
            console.log('Updating ticket to SOLD...');
            const updatedTicket = await tx.ticket.update({
                where: { id: bid.ticketId },
                data: {
                    status: 'SOLD',
                    buyerId: bid.bidderId,
                },
                include: {
                    event: true,
                    seller: true,
                    buyer: true,
                },
            });
            console.log('Rejecting other pending bids...');
            await tx.bid.updateMany({
                where: {
                    ticketId: bid.ticketId,
                    id: { not: bidId },
                    status: 'PENDING',
                },
                data: { status: 'REJECTED' },
            });
            console.log('Creating/updating purchase record...');
            await tx.purchase.upsert({
                where: {
                    ticketId: bid.ticketId,
                },
                update: {
                    buyerId: bid.bidderId,
                    amount: bid.amount,
                    status: 'COMPLETED',
                    updatedAt: new Date(),
                },
                create: {
                    ticketId: bid.ticketId,
                    buyerId: bid.bidderId,
                    amount: bid.amount,
                    status: 'COMPLETED',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            console.log('Transaction completed successfully');
            console.log('Updated ticket:', {
                id: updatedTicket.id,
                status: updatedTicket.status,
                buyerId: updatedTicket.buyerId,
                sellerId: updatedTicket.sellerId
            });
            return { updatedBid, updatedTicket };
        });
        console.log('Sending success response');
        return res.json({
            success: true,
            data: result,
            message: 'Offer accepted successfully',
            buyerNotification: `Congratulations! Your offer of ₹${bid.amount} for ${bid.ticket.event.title} has been accepted. Check your "My Tickets" page to view your purchased ticket.`,
        });
    }
    catch (error) {
        console.error('Accept offer error:', error);
        return res.status(500).json({ error: 'Failed to accept offer' });
    }
});
router.put('/:bidId/reject', auth_1.authenticateToken, async (req, res) => {
    try {
        const { bidId } = req.params;
        const userId = req.user.id;
        const bid = await database_1.prisma.bid.findUnique({
            where: { id: bidId },
            include: {
                ticket: true,
            },
        });
        if (!bid) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        if (bid.ticket.sellerId !== userId) {
            return res.status(403).json({ error: 'Only the seller can reject offers' });
        }
        if (bid.status !== 'PENDING') {
            return res.status(400).json({ error: 'Offer has already been processed' });
        }
        const updatedBid = await database_1.prisma.bid.update({
            where: { id: bidId },
            data: { status: 'REJECTED' },
        });
        return res.json({
            success: true,
            data: updatedBid,
            message: 'Offer rejected successfully',
        });
    }
    catch (error) {
        console.error('Reject offer error:', error);
        return res.status(500).json({ error: 'Failed to reject offer' });
    }
});
exports.default = router;
//# sourceMappingURL=bids.js.map