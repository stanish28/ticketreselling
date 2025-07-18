import { Request } from 'express';
import { UserRole } from '@prisma/client';
export interface User {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    password: string;
    role: UserRole;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthenticatedRequest extends Request {
    user?: User;
    userEmailVerified?: boolean;
}
export interface CreateEventRequest {
    title: string;
    description: string;
    venue: string;
    date: string;
    image?: string;
    category: string;
    capacity: number;
}
export interface CreateTicketRequest {
    eventId: string;
    price: number;
    section?: string;
    row?: string;
    seat?: string;
    listingType: 'DIRECT_SALE' | 'AUCTION';
    endTime?: string;
}
export interface PlaceBidRequest {
    amount: number;
}
export interface RegisterRequest {
    email: string;
    name: string;
    phone?: string;
    password: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface UpdateUserRequest {
    name?: string;
    phone?: string;
    email?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface BidWithUser {
    id: string;
    amount: number;
    createdAt: Date;
    bidder: {
        id: string;
        name: string;
        email: string;
    };
}
export interface TicketWithDetails {
    id: string;
    price: number;
    section?: string;
    row?: string;
    seat?: string;
    status: string;
    listingType: string;
    endTime?: Date;
    createdAt: Date;
    event: {
        id: string;
        title: string;
        venue: string;
        date: Date;
        image?: string;
    };
    seller: {
        id: string;
        name: string;
        email: string;
    };
    buyer?: {
        id: string;
        name: string;
        email: string;
    };
    bids: BidWithUser[];
    _count: {
        bids: number;
    };
}
export interface DashboardStats {
    totalUsers: number;
    totalEvents: number;
    totalTickets: number;
    totalRevenue: number;
    recentPurchases: any[];
    topEvents: any[];
}
//# sourceMappingURL=index.d.ts.map