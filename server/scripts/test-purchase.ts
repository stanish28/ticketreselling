import { prisma } from '../src/config/database';

async function testPurchaseFlow() {
  try {
    console.log('Testing ticket purchase flow...\n');

    // Check if there are any tickets
    const allTickets = await prisma.ticket.findMany({
      include: {
        event: true,
        seller: true,
        buyer: true,
        purchase: true,
      },
    });

    console.log(`Total tickets in database: ${allTickets.length}`);

    if (allTickets.length === 0) {
      console.log('No tickets found. Please create some tickets first.');
      return;
    }

    // Check available tickets
    const availableTickets = allTickets.filter(ticket => ticket.status === 'AVAILABLE');
    console.log(`Available tickets: ${availableTickets.length}`);

    // Check sold tickets
    const soldTickets = allTickets.filter(ticket => ticket.status === 'SOLD');
    console.log(`Sold tickets: ${soldTickets.length}`);

    // Check purchases
    const purchases = await prisma.purchase.findMany({
      include: {
        ticket: true,
        buyer: true,
      },
    });
    console.log(`Total purchases: ${purchases.length}`);

    // Show details of sold tickets
    if (soldTickets.length > 0) {
      console.log('\nSold tickets details:');
      soldTickets.forEach((ticket, index) => {
        console.log(`${index + 1}. Ticket ID: ${ticket.id}`);
        console.log(`   Event: ${ticket.event.title}`);
        console.log(`   Price: $${ticket.price}`);
        console.log(`   Seller: ${ticket.seller.name} (${ticket.seller.email})`);
        console.log(`   Buyer: ${ticket.buyer?.name || 'N/A'} (${ticket.buyer?.email || 'N/A'})`);
        console.log(`   Status: ${ticket.status}`);
        console.log(`   Has purchase record: ${ticket.purchase ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

    // Show details of purchases
    if (purchases.length > 0) {
      console.log('Purchase records:');
      purchases.forEach((purchase, index) => {
        console.log(`${index + 1}. Purchase ID: ${purchase.id}`);
        console.log(`   Ticket ID: ${purchase.ticketId}`);
        console.log(`   Buyer: ${purchase.buyer.name} (${purchase.buyer.email})`);
        console.log(`   Amount: $${purchase.amount}`);
        console.log(`   Status: ${purchase.status}`);
        console.log(`   Created: ${purchase.createdAt}`);
        console.log('');
      });
    }

    // Check for any inconsistencies
    const inconsistencies: string[] = [];
    
    // Check if sold tickets have buyers
    soldTickets.forEach(ticket => {
      if (!ticket.buyerId) {
        inconsistencies.push(`Sold ticket ${ticket.id} has no buyerId`);
      }
      if (!ticket.purchase) {
        inconsistencies.push(`Sold ticket ${ticket.id} has no purchase record`);
      }
    });

    // Check if purchases have corresponding sold tickets
    purchases.forEach(purchase => {
      const ticket = allTickets.find(t => t.id === purchase.ticketId);
      if (!ticket) {
        inconsistencies.push(`Purchase ${purchase.id} references non-existent ticket ${purchase.ticketId}`);
      } else if (ticket.status !== 'SOLD') {
        inconsistencies.push(`Purchase ${purchase.id} references ticket ${purchase.ticketId} with status ${ticket.status} instead of SOLD`);
      }
    });

    if (inconsistencies.length > 0) {
      console.log('⚠️  Inconsistencies found:');
      inconsistencies.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ No inconsistencies found in the purchase flow!');
    }

  } catch (error) {
    console.error('Error testing purchase flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPurchaseFlow(); 