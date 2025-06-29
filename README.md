# FastPass - Ticket Marketplace

A comprehensive ticket marketplace application similar to Ticketmaster with advanced features including bidding, QR code generation, and admin dashboard.

## Features

### Core Features
- **Ticket Listing**: Users can list tickets for events (add new events if not available)
- **Ticket Purchase**: Direct purchase with dummy payment processing
- **Bidding System**: Users can place bids on tickets with real-time updates
- **QR Code Generation**: Automatic QR code generation 24 hours before events
- **Email Notifications**: QR codes sent to ticket holders via email
- **Admin Dashboard**: Complete admin panel for managing events, tickets, and users

### User Features
- User registration and authentication
- Browse events and tickets
- Place bids on tickets
- Purchase tickets directly
- View booking history
- Receive QR codes via email

### Admin Features
- Manage all events and tickets
- View and edit user information
- Monitor bidding activities
- Generate reports
- Manage ticket inventory

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Real-time**: Socket.io for live bidding
- **Email**: Nodemailer
- **QR Codes**: qrcode library

## Quick Start

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up Database**
   ```bash
   npm run db:setup
   npm run db:migrate
   ```

3. **Start Development Servers**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Dashboard: http://localhost:3000/admin

## Environment Variables

Create `.env` files in both `server/` and `client/` directories:

### Server (.env)
```
DATABASE_URL="postgresql://username:password@localhost:5432/fastpass"
JWT_SECRET="your-jwt-secret"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-email-password"
PORT=5000
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Project Structure

```
fastpass/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
└── prisma/               # Database schema and migrations
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (admin)
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - List new ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Bidding
- `POST /api/tickets/:id/bid` - Place bid
- `GET /api/tickets/:id/bids` - Get ticket bids
- `GET /api/bids/my` - Get user's bids

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/events` - Get all events with stats

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 