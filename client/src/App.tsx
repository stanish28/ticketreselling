import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.tsx';
import HomePage from './pages/HomePage.tsx';
import EventsPage from './pages/EventsPage.tsx';
import EventDetailPage from './pages/EventDetailPage.tsx';
import TicketDetailPage from './pages/TicketDetailPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import MyTicketsPage from './pages/MyTicketsPage.tsx';
import MyBidsPage from './pages/MyBidsPage.tsx';
import MyListingsPage from './pages/MyListingsPage.tsx';
import AdminDashboard from './pages/admin/Dashboard.tsx';
import AdminEventsPage from './pages/AdminEventsPage.tsx';
import AdminEventTicketsPage from './pages/AdminEventTicketsPage.tsx';
import AdminUsers from './pages/admin/Users.tsx';
import AdminTickets from './pages/admin/Tickets.tsx';
import CreateEventPage from './pages/CreateEventPage.tsx';
import PrivateRoute from './components/auth/ProtectedRoute.tsx';
import AdminRoute from './components/auth/AdminRoute.tsx';
import { Toaster } from 'react-hot-toast';
import SellTicketPage from './pages/SellTicketPage.tsx';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Private Routes */}
          <Route path="/my-tickets" element={<PrivateRoute><MyTicketsPage /></PrivateRoute>} />
          <Route path="/my-bids" element={<PrivateRoute><MyBidsPage /></PrivateRoute>} />
          <Route path="/my-listings" element={<PrivateRoute><MyListingsPage /></PrivateRoute>} />
          <Route path="/sell-ticket" element={<PrivateRoute><SellTicketPage /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
          <Route path="/admin/events/create" element={<AdminRoute><CreateEventPage /></AdminRoute>} />
          <Route path="/admin/events/:eventId/tickets" element={<AdminRoute><AdminEventTicketsPage /></AdminRoute>} />
          <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App; 