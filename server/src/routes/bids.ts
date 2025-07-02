import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Get bids for a ticket
router.get('/ticket/:ticketId', async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    const bids = await prisma.bid.findMany({
      where: { ticketId },
      orderBy: { amount: 'desc' },
    });

    res.json({
      success: true,
      data: bids,
    });
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
});

// Place a bid on a ticket
router.post('/:ticketId', [
  authenticateToken,
  body('amount').isFloat({ min: 0 }),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ticketId } = req.params;
    const { amount } = req.body;
    const userId = req.user!.id;

    // Get the ticket
    const ticket = await prisma.ticket.findUnique({
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

    // Check if auction has ended
    if (ticket.endTime && new Date() > ticket.endTime) {
      return res.status(400).json({ error: 'Auction has ended' });
    }

    // Get the highest bid
    const highestBid = await prisma.bid.findFirst({
      where: { ticketId },
      orderBy: { amount: 'desc' },
    });

    // Check if user already has a bid on this ticket
    const existingUserBid = await prisma.bid.findFirst({
      where: {
        ticketId,
        bidderId: userId,
        status: 'PENDING',
      },
    });

    // Calculate minimum bid amount (10% higher than current highest bid)
    const currentHighestAmount = highestBid?.amount || 0;
    const minBidAmount = Math.max(1, currentHighestAmount * 1.1); // At least 10% higher

    if (amount < minBidAmount) {
      return res.status(400).json({ 
        error: `Bid must be at least ₹${minBidAmount.toFixed(2)} (10% higher than current highest bid)` 
      });
    }

    let bid;
    let message;

    if (existingUserBid) {
      // Update existing bid
      bid = await prisma.bid.update({
        where: { id: existingUserBid.id },
        data: { amount },
      });
      message = 'Bid updated successfully';
    } else {
      // Create new bid
      bid = await prisma.bid.create({
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
  } catch (error) {
    console.error('Place bid error:', error);
    return res.status(500).json({ error: 'Failed to place bid' });
  }
});

// Get user's bids
router.get('/user/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const bids = await prisma.bid.findMany({
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
  } catch (error) {
    console.error('Get user bids error:', error);
    res.status(500).json({ error: 'Failed to fetch user bids' });
  }
});

// Accept an offer (seller only)
router.put('/:bidId/accept', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bidId } = req.params;
    const userId = req.user!.id;

    console.log(`Accepting offer ${bidId} for user ${userId}`);

    // Get the bid with ticket and bidder info
    const bid = await prisma.bid.findUnique({
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

    // Check if user is the seller
    if (bid.ticket.sellerId !== userId) {
      console.log(`User ${userId} is not the seller ${bid.ticket.sellerId}`);
      return res.status(403).json({ error: 'Only the seller can accept offers' });
    }

    // Check if ticket is still available
    if (bid.ticket.status !== 'AVAILABLE') {
      console.log(`Ticket ${bid.ticketId} is not available, status: ${bid.ticket.status}`);
      return res.status(400).json({ error: 'Ticket is no longer available' });
    }

    // Check if bid is still pending
    if (bid.status !== 'PENDING') {
      console.log(`Bid ${bidId} is not pending, status: ${bid.status}`);
      return res.status(400).json({ error: 'Offer has already been processed' });
    }

    console.log('Starting transaction...');

    // Use transaction to update bid status and ticket
    const result = await prisma.$transaction(async (tx) => {
      console.log('Updating bid status to ACCEPTED...');
      // Update bid status to accepted
      const updatedBid = await tx.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      });

      console.log('Updating ticket to SOLD...');
      // Update ticket to sold
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
      // Reject all other pending bids for this ticket
      await tx.bid.updateMany({
        where: {
          ticketId: bid.ticketId,
          id: { not: bidId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      console.log('Creating/updating purchase record...');
      // Create purchase record
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
  } catch (error) {
    console.error('Accept offer error:', error);
    return res.status(500).json({ error: 'Failed to accept offer' });
  }
});

// Reject an offer (seller only)
router.put('/:bidId/reject', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bidId } = req.params;
    const userId = req.user!.id;

    // Get the bid with ticket info
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        ticket: true,
      },
    });

    if (!bid) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Check if user is the seller
    if (bid.ticket.sellerId !== userId) {
      return res.status(403).json({ error: 'Only the seller can reject offers' });
    }

    // Check if bid is still pending
    if (bid.status !== 'PENDING') {
      return res.status(400).json({ error: 'Offer has already been processed' });
    }

    // Update bid status to rejected
    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'REJECTED' },
    });

    return res.json({
      success: true,
      data: updatedBid,
      message: 'Offer rejected successfully',
    });
  } catch (error) {
    console.error('Reject offer error:', error);
    return res.status(500).json({ error: 'Failed to reject offer' });
  }
});

export default router; 