export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  banned?: boolean;
  _count?: {
    ticketsSold: number;
    purchases: number;
    bids: number;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  date: string;
  image?: string;
  category: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tickets: number;
  };
  tickets?: Ticket[];
}

export type ListingType = 'DIRECT_SALE' | 'AUCTION';

export interface Ticket {
  id: string;
  price: number;
  section?: string;
  row?: string;
  seat?: string;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'EXPIRED';
  listingType: ListingType;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  eventId: string;
  sellerId: string;
  buyerId?: string;
  event?: Event;
  seller?: User;
  buyer?: User;
  bids?: Bid[];
  _count?: {
    bids: number;
  };
}

export interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  ticketId: string;
  bidderId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  bidder?: User;
}

export interface Purchase {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
  ticketId: string;
  buyerId: string;
  ticket?: Ticket;
  buyer?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  users?: T[];
  events?: T[];
  tickets?: T[];
  purchases?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  recentPurchases: Purchase[];
  topEvents: Event[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  phone?: string;
  password: string;
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
  listingType: ListingType;
  endTime?: string;
}

export interface PlaceBidRequest {
  amount: number;
}

export interface PurchaseTicketRequest {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
} 