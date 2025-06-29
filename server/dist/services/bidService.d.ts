import { Server } from 'socket.io';
export declare const processExpiredBids: (io: Server) => Promise<void>;
export declare const getAuctionStatus: (ticketId: string) => Promise<{
    ticketId: string;
    currentHighestBid: number;
    startingPrice: number;
    totalBids: number;
    isAuctionEnded: boolean;
    timeLeft: number | null;
    endTime: Date | null;
    status: import(".prisma/client").$Enums.TicketStatus;
}>;
export declare const validateBid: (ticketId: string, bidderId: string, amount: number) => Promise<{
    valid: boolean;
    error: string;
    minimumBid?: undefined;
} | {
    valid: boolean;
    error: string;
    minimumBid: number;
} | {
    valid: boolean;
    error?: undefined;
    minimumBid?: undefined;
}>;
export declare const getBidHistory: (ticketId: string, page?: number, limit?: number) => Promise<{
    bids: ({
        bidder: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.BidStatus;
        ticketId: string;
        amount: number;
        bidderId: string;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
//# sourceMappingURL=bidService.d.ts.map