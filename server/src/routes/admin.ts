import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';
import { AuthenticatedRequest, DashboardStats } from '../types';
import { Response } from 'express';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get dashboard stats
router.get('/dashboard', async (req: AuthenticatedRequest, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalTickets,
      totalRevenue,
      recentPurchases,
      topEvents
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.ticket.count(),
      prisma.purchase.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.purchase.findMany({
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
      prisma.event.findMany({
        take: 5,
        orderBy: { date: 'asc' },
        include: {
          _count: {
            select: { tickets: true }
          }
        }
      })
    ]);

    const stats: DashboardStats = {
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
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get all users
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
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
      prisma.user.count({ where })
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
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user
router.put('/users/:id', [
  body('name').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
  body('role').optional().isIn(['USER', 'ADMIN'])
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    const updatedUser = await prisma.user.update({
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
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting the last admin
    if (existingUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' }
      });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Ban or unban a user
router.patch('/users/:id/ban', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { banned } = req.body;

    if (typeof banned !== 'boolean') {
      res.status(400).json({ error: 'Missing or invalid banned value' });
      return;
    }

    // Prevent admin from banning themselves
    if (req.user && req.user.id === id) {
      res.status(400).json({ error: 'You cannot ban/unban yourself' });
      return;
    }

    // Prevent banning other admins
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (user.role === 'ADMIN') {
      res.status(403).json({ error: 'Cannot ban/unban another admin' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { banned }
    });

    res.json({ success: true, user: updated, message: banned ? 'User banned' : 'User unbanned' });
    return;
  } catch (error) {
    console.error('Ban/unban user error:', error);
    res.status(500).json({ error: 'Failed to update user ban status' });
    return;
  }
});

// Create event
router.post('/events', [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('venue').notEmpty().trim(),
  body('date').isISO8601(),
  body('category').notEmpty().trim(),
  body('capacity').isInt({ min: 1 }),
  body('image').optional().isURL()
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = req.body;

    const newEvent = await prisma.event.create({
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
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/events/:id', [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('venue').optional().trim().isLength({ min: 1 }),
  body('date').optional().isISO8601(),
  body('category').optional().trim().isLength({ min: 1 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('image').optional().isURL()
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Update event
    const updatedEvent = await prisma.event.update({
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
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/events/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
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

    // Check if event has tickets
    if (existingEvent._count.tickets > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete event with existing tickets. Please delete all tickets first.' 
      });
    }

    // Delete event
    await prisma.event.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get all events with stats
router.get('/events', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (category) where.category = category;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
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
      prisma.event.count({ where })
    ]);

    // Calculate revenue for each event
    const eventsWithRevenue = events.map((event: any) => ({
      ...event,
      revenue: event.tickets.reduce((sum: number, ticket: any) => sum + ticket.price, 0)
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
  } catch (error) {
    console.error('Get admin events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
    return;
  }
});

// Get all tickets with details
router.get('/tickets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, eventId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (eventId) where.eventId = eventId;

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
    console.error('Get admin tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
    return;
  }
});

// Update ticket
router.put('/tickets/:id', [
  body('price').optional().isFloat({ min: 0 }),
  body('section').optional().trim(),
  body('row').optional().trim(),
  body('seat').optional().trim(),
  body('status').optional().isIn(['AVAILABLE', 'SOLD', 'RESERVED', 'EXPIRED']),
  body('listingType').optional().isIn(['DIRECT_SALE', 'AUCTION'])
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!existingTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update ticket
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
  } catch (error) {
    console.error('Update ticket error:', error);
    return res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Delete ticket
router.delete('/tickets/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!existingTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Delete related records first (bids and purchases)
    await prisma.$transaction(async (tx) => {
      // Delete all bids for this ticket
      await tx.bid.deleteMany({
        where: { ticketId: id }
      });

      // Delete purchase record for this ticket
      await tx.purchase.deleteMany({
        where: { ticketId: id }
      });

      // Finally delete the ticket
      await tx.ticket.delete({
        where: { id }
      });
    });

    return res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    return res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

// Get all purchases
router.get('/purchases', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
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
      prisma.purchase.count({ where })
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
  } catch (error) {
    console.error('Get purchases error:', error);
    return res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenue = await prisma.purchase.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate
        }
      },
      _sum: { amount: true },
      _count: true
    });

    const dailyRevenue = await prisma.purchase.groupBy({
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
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
    return;
  }
});

export default router; 