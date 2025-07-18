import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.tsx';
import Footer from './components/layout/Footer.tsx';
import MobileBottomNav from './components/layout/MobileBottomNav.tsx';
import ScrollToTop from './components/common/ScrollToTop.tsx';
import HomePage from './pages/HomePage.tsx';
import EventsPage from './pages/EventsPage.tsx';
import EventDetailPage from './pages/EventDetailPage.tsx';
import TicketDetailPage from './pages/TicketDetailPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import VerifyEmailPage from './pages/VerifyEmailPage.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import MyTicketsPage from './pages/MyTicketsPage.tsx';
import MyBidsPage from './pages/MyBidsPage.tsx';
import UserProfilePage from './pages/UserProfilePage.tsx';
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
import UiTestPage from './pages/UiTestPage.tsx';
import LegalPage from './pages/LegalPage.tsx';
import FAQPage from './pages/FAQPage.tsx';
import FeedbackButton from './components/common/FeedbackButton.tsx';

function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Navbar />
      <main className="pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Private Routes */}
          <Route path="/my-tickets" element={<PrivateRoute><MyTicketsPage /></PrivateRoute>} />
          <Route path="/my-bids" element={<PrivateRoute><MyBidsPage /></PrivateRoute>} />
          <Route path="/sell-ticket" element={<PrivateRoute><SellTicketPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
          <Route path="/admin/events/create" element={<AdminRoute><CreateEventPage /></AdminRoute>} />
          <Route path="/admin/events/:eventId/tickets" element={<AdminRoute><AdminEventTicketsPage /></AdminRoute>} />
          <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />
          <Route path="/ui-test" element={<UiTestPage />} />
        </Routes>
      </main>
      <Footer />
      <MobileBottomNav />
      <FeedbackButton variant="floating" />
    </>
  );
}

export default App; 