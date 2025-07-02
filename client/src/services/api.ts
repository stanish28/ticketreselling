import axios from 'axios';
import {
  ApiResponse,
  User,
  Event,
  Ticket,
  Bid,
  Purchase,
  DashboardStats,
  LoginRequest,
  RegisterRequest,
  CreateEventRequest,
  CreateTicketRequest,
  PlaceBidRequest,
  PurchaseTicketRequest,
  PaginatedResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> =>
    api.post('/auth/register', data).then(res => res.data),

  login: (data: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> =>
    api.post('/auth/login', data).then(res => res.data),

  getCurrentUser: (): Promise<ApiResponse<User>> =>
    api.get('/auth/me').then(res => res.data),

  verifyEmail: (token: string): Promise<ApiResponse<{ message: string }>> =>
    api.get(`/auth/verify-email?token=${token}`).then(res => res.data),

  resendVerification: (email: string): Promise<ApiResponse<{ message: string }>> =>
    api.post('/auth/resend-verification', { email }).then(res => res.data),
};

// Events API
export const eventsAPI = {
  getAll: (params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<ApiResponse<PaginatedResponse<Event>>> =>
    api.get('/events', { params }).then(res => res.data),

  getById: (id: string): Promise<ApiResponse<Event>> =>
    api.get(`/events/${id}`).then(res => res.data),

  create: (data: CreateEventRequest): Promise<ApiResponse<Event>> =>
    api.post('/events', data).then(res => res.data),

  update: (id: string, data: Partial<CreateEventRequest>): Promise<ApiResponse<Event>> =>
    api.put(`/events/${id}`, data).then(res => res.data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/events/${id}`).then(res => res.data),

  getCategories: (): Promise<ApiResponse<string[]>> =>
    api.get('/events/categories').then(res => res.data),
};

// Tickets API
export const ticketsAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string; eventId?: string }): Promise<ApiResponse<PaginatedResponse<Ticket>>> =>
    api.get('/tickets', { params }).then(res => res.data),

  getById: (id: string): Promise<ApiResponse<Ticket>> =>
    api.get(`/tickets/${id}`).then(res => res.data),

  create: (data: CreateTicketRequest): Promise<ApiResponse<Ticket>> =>
    api.post('/tickets', data).then(res => res.data),

  update: (id: string, data: Partial<CreateTicketRequest>): Promise<ApiResponse<Ticket>> =>
    api.put(`/tickets/${id}`, data).then(res => res.data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/tickets/${id}`).then(res => res.data),

  purchase: (id: string, data: PurchaseTicketRequest): Promise<ApiResponse<Purchase>> =>
    api.post(`/tickets/${id}/purchase`, data).then(res => res.data),

  getMyTickets: (): Promise<ApiResponse<Ticket[]>> =>
    api.get('/tickets/my').then(res => res.data),

  getMyListings: (): Promise<ApiResponse<Ticket[]>> =>
    api.get('/tickets/my-listings').then(res => res.data),
};

// Bids API
export const bidsAPI = {
  placeBid: (ticketId: string, data: PlaceBidRequest): Promise<ApiResponse<Bid>> =>
    api.post(`/bids/${ticketId}`, data).then(res => res.data),

  getAuctionStatus: (ticketId: string): Promise<ApiResponse<any>> =>
    api.get(`/bids/ticket/${ticketId}`).then(res => res.data),

  getMyBids: (): Promise<ApiResponse<Bid[]>> =>
    api.get('/bids/my-bids').then(res => res.data),

  acceptOffer: (bidId: string): Promise<ApiResponse<any>> =>
    api.put(`/bids/${bidId}/accept`).then(res => res.data),

  rejectOffer: (bidId: string): Promise<ApiResponse<any>> =>
    api.put(`/bids/${bidId}/reject`).then(res => res.data),
};

// Admin API
export const adminAPI = {
  getDashboard: (): Promise<ApiResponse<DashboardStats>> =>
    api.get('/admin/dashboard').then(res => res.data),

  getUsers: (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<PaginatedResponse<User>>> =>
    api.get('/admin/users', { params }).then(res => res.data),

  updateUser: (id: string, data: Partial<User>): Promise<ApiResponse<User>> =>
    api.put(`/admin/users/${id}`, data).then(res => res.data),

  deleteUser: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/users/${id}`).then(res => res.data),

  getEvents: (params?: { page?: number; limit?: number; category?: string }): Promise<ApiResponse<PaginatedResponse<Event>>> =>
    api.get('/admin/events', { params }).then(res => res.data),

  createEvent: (data: CreateEventRequest): Promise<ApiResponse<Event>> =>
    api.post('/admin/events', data).then(res => res.data),

  updateEvent: (id: string, data: Partial<CreateEventRequest>): Promise<ApiResponse<Event>> =>
    api.put(`/admin/events/${id}`, data).then(res => res.data),

  deleteEvent: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/events/${id}`).then(res => res.data),

  getTickets: (params?: { page?: number; limit?: number; status?: string; eventId?: string }): Promise<ApiResponse<PaginatedResponse<Ticket>>> =>
    api.get('/admin/tickets', { params }).then(res => res.data),

  updateTicket: (id: string, data: Partial<CreateTicketRequest>): Promise<ApiResponse<Ticket>> =>
    api.put(`/admin/tickets/${id}`, data).then(res => res.data),

  deleteTicket: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/tickets/${id}`).then(res => res.data),

  getPurchases: (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<PaginatedResponse<Purchase>>> =>
    api.get('/admin/purchases', { params }).then(res => res.data),

  getRevenueAnalytics: (params?: { period?: string }): Promise<ApiResponse<any>> =>
    api.get('/admin/analytics/revenue', { params }).then(res => res.data),
};

export default api; 