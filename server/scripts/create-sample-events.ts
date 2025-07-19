import { prisma } from '../src/config/database';

async function createSampleEvents() {
  try {
    // Check if events already exist
    const existingEvents = await prisma.event.count();
    if (existingEvents > 0) {
      console.log(`${existingEvents} events already exist in the database`);
      return;
    }

    const sampleEvents = [
      {
        title: 'Garba Night 2024',
        description: 'Join us for an unforgettable evening of traditional Garba dance, music, and celebration. Experience the vibrant culture of Gujarat with live performances and authentic food.',
        venue: 'Mumbai Convention Center',
        date: new Date('2024-10-15T19:00:00Z'),
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
        category: 'Cultural',
        capacity: 500
      },
      {
        title: 'Rock Music Festival',
        description: 'The biggest rock music festival of the year featuring top international and local artists. Get ready for an electrifying night of rock and roll!',
        venue: 'Bangalore Palace Grounds',
        date: new Date('2024-11-20T18:00:00Z'),
        image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
        category: 'Music',
        capacity: 2000
      },
      {
        title: 'Comedy Night Special',
        description: 'Laugh your heart out with India\'s top comedians. A night filled with humor, wit, and endless entertainment.',
        venue: 'Delhi Comedy Club',
        date: new Date('2024-12-05T20:00:00Z'),
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        category: 'Comedy',
        capacity: 300
      },
      {
        title: 'Tech Conference 2024',
        description: 'Join industry leaders and innovators for the most anticipated tech conference. Learn about the latest trends in technology and network with professionals.',
        venue: 'Hyderabad International Convention Center',
        date: new Date('2024-11-10T09:00:00Z'),
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
        category: 'Technology',
        capacity: 1000
      },
      {
        title: 'Bollywood Night',
        description: 'Experience the magic of Bollywood with live performances, dance competitions, and celebrity appearances. A night to remember!',
        venue: 'Chennai Grand Hotel',
        date: new Date('2024-12-25T19:30:00Z'),
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
        category: 'Entertainment',
        capacity: 800
      },
      {
        title: 'Food Festival',
        description: 'Taste the best cuisines from around the world. From street food to gourmet dishes, this festival has it all!',
        venue: 'Kolkata Food Street',
        date: new Date('2024-10-30T12:00:00Z'),
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
        category: 'Food',
        capacity: 1500
      }
    ];

    console.log('Creating sample events...');
    
    for (const eventData of sampleEvents) {
      const event = await prisma.event.create({
        data: eventData
      });
      console.log(`Created event: ${event.title}`);
      
      // Create some sample tickets for each event
      const ticketPrices = [999, 1499, 799, 1299, 899, 699];
      const randomPrice = ticketPrices[Math.floor(Math.random() * ticketPrices.length)];
      
      await prisma.ticket.create({
        data: {
          eventId: event.id,
          sellerId: '1', // Assuming admin user ID is 1
          price: randomPrice,
          status: 'AVAILABLE',
          listingType: 'DIRECT_SALE',
          section: 'General',
          row: 'A',
          seat: '1'
        }
      });
      
      console.log(`Created ticket for ${event.title} at ₹${randomPrice}`);
    }

    console.log('Sample events and tickets created successfully!');
  } catch (error) {
    console.error('Error creating sample events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleEvents(); 