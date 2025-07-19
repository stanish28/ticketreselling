import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function createSampleEvents() {
  try {
    console.log('Creating sample events...');

    // Sample events data
    const sampleEvents = [
      {
        title: 'Ed Sheeran Live in Mumbai',
        description: 'Experience the magic of Ed Sheeran live in concert at the iconic DY Patil Stadium. A night of unforgettable music and memories.',
        venue: 'DY Patil Stadium, Mumbai',
        date: new Date('2025-03-15T19:00:00.000Z'),
        category: 'Concert',
        capacity: 50000,
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'IPL Final 2025',
        description: 'Witness the grand finale of IPL 2025 with the best teams competing for the ultimate trophy.',
        venue: 'Wankhede Stadium, Mumbai',
        date: new Date('2025-05-25T19:30:00.000Z'),
        category: 'Sports',
        capacity: 35000,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Comedy Night with Kapil Sharma',
        description: 'Laugh your heart out with India\'s favorite comedian Kapil Sharma and his talented team.',
        venue: 'NCPA, Mumbai',
        date: new Date('2025-04-10T20:00:00.000Z'),
        category: 'Comedy',
        capacity: 2000,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Tech Conference 2025',
        description: 'Join industry leaders and innovators for the biggest tech conference of the year.',
        venue: 'Bombay Exhibition Centre, Mumbai',
        date: new Date('2025-06-20T09:00:00.000Z'),
        category: 'Conference',
        capacity: 5000,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Bollywood Music Night',
        description: 'A magical evening of Bollywood\'s greatest hits performed by top artists.',
        venue: 'Jio World Garden, Mumbai',
        date: new Date('2025-07-05T18:30:00.000Z'),
        category: 'Music',
        capacity: 8000,
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Food Festival 2025',
        description: 'Taste the best cuisines from around the world at this grand food festival.',
        venue: 'Bandra Kurla Complex, Mumbai',
        date: new Date('2025-08-15T12:00:00.000Z'),
        category: 'Food',
        capacity: 15000,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
      }
    ];

    // Create events
    for (const eventData of sampleEvents) {
      const event = await prisma.event.create({
        data: eventData
      });
      console.log(`Created event: ${event.title}`);

      // Add some sample tickets for each event
      const ticketPrices = [800, 1200, 1800, 2500, 3500];
      for (let i = 0; i < 5; i++) {
        await prisma.ticket.create({
          data: {
            eventId: event.id,
            sellerId: 'cmd8zknph00018p98dtsrh0rk', // Use the admin user ID
            price: ticketPrices[i],
            status: 'AVAILABLE',
            seat: `${i + 1}`,
            ticketType: 'SEATED'
          }
        });
      }
      console.log(`Added 5 tickets for ${event.title}`);
    }

    console.log('Sample events and tickets created successfully!');
  } catch (error) {
    console.error('Error creating sample events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleEvents(); 