import { Server } from 'socket.io';
import { prisma } from '../config/database';

export const processExpiredBids = async (io: Server) => {
  try {
    const now = new Date();

    // Find expired auctions
    const expiredTickets = await prisma.ticket.findMany({
      where: {
        status: 'AVAILABLE',
        listingType: 'AUCTION',
        endTime: {
          lt: now
        }
      },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        event: {
          select: {
            title: true,
            venue: true,
            date: true
          }
        }
      }
    });

    console.log(`Processing ${expiredTickets.length} expired auctions`);

    for (const ticket of expiredTickets) {
      try {
        if (ticket.bids.length > 0) {
          // Auction has bids - sell to highest bidder
          const winningBid = ticket.bids[0];
          
          // Create purchase record
          await prisma.purchase.create({
            data: {
              ticketId: ticket.id,
              buyerId: winningBid.bidderId,
              amount: winningBid.amount,
              status: 'COMPLETED'
            }
          });

          // Update ticket status
          await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
              buyerId: winningBid.bidderId,
              status: 'SOLD'
            }
          });

          // Notify users through socket
          io.to(`ticket-${ticket.id}`).emit('auction-ended', {
            ticketId: ticket.id,
            winner: winningBid.bidder,
            winningAmount: winningBid.amount,
            eventTitle: ticket.event.title
          });

          console.log(`Auction ended for ticket ${ticket.id} - sold to ${winningBid.bidder.name} for $${winningBid.amount}`);
        } else {
          // No bids - mark as expired
          await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
              status: 'EXPIRED'
            }
          });

          console.log(`Auction expired for ticket ${ticket.id} - no bids received`);
        }
      } catch (error) {
        console.error(`Failed to process expired auction for ticket ${ticket.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Process expired bids error:', error);
    throw error;
  }
};

export const getAuctionStatus = async (ticketId: string) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1
        },
        _count: {
          select: { bids: true }
        }
      }
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const currentHighestBid = ticket.bids[0]?.amount || 0;
    const isAuctionEnded = ticket.endTime ? new Date() > ticket.endTime : false;
    const timeLeft = ticket.endTime ? Math.max(0, ticket.endTime.getTime() - Date.now()) : null;

    return {
      ticketId,
      currentHighestBid,
      startingPrice: ticket.price,
      totalBids: ticket._count.bids,
      isAuctionEnded,
      timeLeft,
      endTime: ticket.endTime,
      status: ticket.status
    };
  } catch (error) {
    console.error('Get auction status error:', error);
    throw error;
  }
};

export const validateBid = async (ticketId: string, bidderId: string, amount: number) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1
        }
      }
    });

    if (!ticket) {
      return { valid: false, error: 'Ticket not found' };
    }

    if (ticket.status !== 'AVAILABLE') {
      return { valid: false, error: 'Ticket is not available for bidding' };
    }

    if (ticket.listingType !== 'AUCTION') {
      return { valid: false, error: 'This ticket is not available for bidding' };
    }

    if (ticket.sellerId === bidderId) {
      return { valid: false, error: 'Cannot bid on your own ticket' };
    }

    // Check if auction has ended
    if (ticket.endTime && new Date() > ticket.endTime) {
      return { valid: false, error: 'Auction has ended' };
    }

    // Check if bid is higher than current highest bid or starting price
    const currentHighestBid = ticket.bids[0]?.amount || 0;
    const minimumBid = Math.max(currentHighestBid, ticket.price);

    if (amount <= minimumBid) {
      return { 
        valid: false, 
        error: `Bid must be higher than $${minimumBid}`,
        minimumBid
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Validate bid error:', error);
    return { valid: false, error: 'Failed to validate bid' };
  }
};

export const getBidHistory = async (ticketId: string, page: number = 1, limit: number = 20) => {
  try {
    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where: { ticketId },
        skip,
        take: limit,
        orderBy: { amount: 'desc' },
        include: {
          bidder: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.bid.count({ where: { ticketId } })
    ]);

    return {
      bids,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Get bid history error:', error);
    throw error;
  }
}; 