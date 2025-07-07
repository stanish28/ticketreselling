import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { AuthenticatedRequest, CreateTicketRequest } from '../types';
import { processPayment } from '../utils/payment';
import { generateQRCodeSync } from '../utils/qrCode';
import { sendPurchaseConfirmationEmail, sendSaleNotificationEmail } from '../utils/email';

const router = express.Router();

// Get user's purchased tickets
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const tickets = await prisma.ticket.findMany({
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

    // Transform the data to include purchase date and QR code
    const transformedTickets = tickets.map(ticket => ({
      ...ticket,
      purchasedAt: ticket.purchase?.createdAt || ticket.updatedAt,
      qrCode: `TICKET:${ticket.id}:${Date.now()}`, // Generate QR code data
    }));

    res.json({
      success: true,
      data: transformedTickets,
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch user tickets' });
  }
});

// Get user's active listings
router.get('/my-listings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const listings = await prisma.ticket.findMany({
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
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
});

// Get all tickets
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, eventId, status, listingType, minPrice, maxPrice, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      status: 'AVAILABLE', // Only show available tickets
    };
    if (eventId) where.eventId = eventId;
    if (listingType) where.listingType = listingType;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (search) {
      where.event = {
        OR: [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { venue: { contains: search as string, mode: 'insensitive' } }
        ]
      };
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
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
      prisma.ticket.count({ where })
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
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
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
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// List new ticket
router.post('/', [
  authenticateToken,
  body('eventId').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('listingType').isIn(['DIRECT_SALE', 'AUCTION']),
  body('endTime').optional().isISO8601()
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const ticketData: CreateTicketRequest = req.body;
    const userId = req.user!.id;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: ticketData.eventId }
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const ticket = await prisma.ticket.create({
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
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to list ticket' });
  }
});

// Purchase ticket
router.post('/:id/purchase', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Purchase endpoint called');
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { cardNumber, expiryDate, cvv } = req.body;

    console.log('Purchase request:', { id, userId, cardNumber: cardNumber ? 'provided' : 'missing' });

    // Validate payment data (in a real app, you'd validate with a payment processor)
    if (!cardNumber || !expiryDate || !cvv) {
      console.log('Payment validation failed');
      return res.status(400).json({ error: 'Payment information is required' });
    }

    // Get the ticket with event and seller info
    const ticket = await prisma.ticket.findUnique({
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
    // Process payment (dummy implementation)
    const paymentResult = await processPayment({
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
    // Update ticket status and create purchase record
    const updatedTicket = await prisma.ticket.update({
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
    // Create purchase record (use upsert to handle unique constraint)
    await prisma.purchase.upsert({
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
    // Generate QR code for the ticket
    const qrCodeData = generateQRCodeSync(updatedTicket.id);

    console.log('Sending email notifications...');
    // Send email notification to buyer (don't fail purchase if email fails)
    if (updatedTicket.buyer) {
      try {
        await sendPurchaseConfirmationEmail({
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
      } catch (emailError) {
        console.error('Failed to send purchase confirmation email:', emailError);
        // Don't fail the purchase if email fails
      }
    }

    // Send email notification to seller (don't fail purchase if email fails)
    try {
      await sendSaleNotificationEmail({
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
    } catch (emailError) {
      console.error('Failed to send sale notification email:', emailError);
      // Don't fail the purchase if email fails
    }

    console.log('Sending success response...');
    return res.json({
      message: 'Ticket purchased successfully',
      data: {
        ...updatedTicket,
        qrCode: qrCodeData,
      },
    });
  } catch (error: any) {
    console.error('Purchase error:', error);
    return res.status(500).json({ error: 'Failed to purchase ticket' });
  }
});

// Update ticket
router.put('/:id', [
  authenticateToken,
  body('price').optional().isFloat({ min: 0 }),
  body('section').optional().trim(),
  body('row').optional().trim(),
  body('seat').optional().trim()
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;

    // Check if ticket exists and belongs to user
    const ticket = await prisma.ticket.findUnique({
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

    const updatedTicket = await prisma.ticket.update({
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
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Delete ticket
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const ticket = await prisma.ticket.findUnique({
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

    await prisma.ticket.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

// Relist a ticket for resale by the owner
router.put('/:id/resell', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { price, listingType } = req.body;

    // Find the ticket and ensure the user is the owner (buyer)
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (ticket.buyerId !== userId) {
      return res.status(403).json({ error: 'You are not the owner of this ticket' });
    }

    // Use a transaction to update ticket and clear all previous bids
    const result = await prisma.$transaction(async (tx) => {
      // Clear all previous bids for this ticket
      await tx.bid.deleteMany({
        where: { ticketId: id },
      });

      // Update the ticket
      const updatedTicket = await tx.ticket.update({
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

      return updatedTicket;
    });

    const updatedTicket = result;

    return res.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket relisted for sale',
    });
  } catch (error) {
    console.error('Resell ticket error:', error);
    return res.status(500).json({ error: 'Failed to relist ticket' });
  }
});

// Cancel a listing and return ticket to user's purchased tickets
router.put('/:id/cancel-listing', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Find the ticket and ensure the user is the seller
    const ticket = await prisma.ticket.findUnique({
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

    // Check if there are any pending bids
    const pendingBids = await prisma.bid.findMany({
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

    // Update the ticket to return it to the user's purchased tickets
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: 'SOLD',
        sellerId: userId, // Keep the same user as seller since they're the original owner
        buyerId: userId,  // Set as buyer to indicate they own it
        listingType: 'DIRECT_SALE', // Reset to default listing type
      },
      include: {
        event: true,
        buyer: true,
      },
    });

    // Delete any existing bids for this ticket
    await prisma.bid.deleteMany({
      where: { ticketId: id },
    });

    return res.json({
      success: true,
      data: updatedTicket,
      message: 'Listing cancelled successfully. Ticket returned to your purchased tickets.',
    });
  } catch (error) {
    console.error('Cancel listing error:', error);
    return res.status(500).json({ error: 'Failed to cancel listing' });
  }
});

export default router; 