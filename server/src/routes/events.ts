import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { AuthenticatedRequest, CreateEventRequest } from '../types';

const router = Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, startDate, endDate, minPrice, maxPrice } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { venue: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
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
      prisma.event.findMany({
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
      prisma.event.count({ where })
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
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
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
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event (admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('title').trim().isLength({ min: 3 }),
  body('description').trim().isLength({ min: 10 }),
  body('venue').trim().notEmpty(),
  body('date').isISO8601(),
  body('category').trim().notEmpty(),
  body('capacity').isInt({ min: 1 })
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Create event request body:', req.body); // Debug log
    console.log('User making request:', req.user); // Debug log
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array()); // Debug log
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const eventData: CreateEventRequest = req.body;
    console.log('Processed event data:', eventData); // Debug log

    // Try to create the event with more detailed error handling
    let event;
    try {
      event = await prisma.event.create({
        data: eventData
      });
      console.log('Created event:', event); // Debug log
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: `Database error: ${dbError.message}` });
      return;
    }

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: `Failed to create event: ${error.message}` });
  }
});

// Update event (admin only)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('title').optional().trim().isLength({ min: 3 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('venue').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('category').optional().trim().notEmpty(),
  body('capacity').optional().isInt({ min: 1 })
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (admin only)
router.delete('/:id', [authenticateToken, requireAdmin], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.event.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get event categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.event.findMany({
      select: { category: true },
      distinct: ['category']
    });

    res.json({
      success: true,
      data: categories.map((c: any) => c.category)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router; 