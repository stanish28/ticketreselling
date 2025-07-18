"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
console.log('Starting server...');
console.log('Environment Variables:', JSON.stringify(process.env, null, 2));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const node_cron_1 = __importDefault(require("node-cron"));
const auth_1 = __importDefault(require("./routes/auth"));
const events_1 = __importDefault(require("./routes/events"));
const tickets_1 = __importDefault(require("./routes/tickets"));
const bids_1 = __importDefault(require("./routes/bids"));
const admin_1 = __importDefault(require("./routes/admin"));
const passwordReset_1 = __importDefault(require("./routes/passwordReset"));
const auth_2 = require("./middleware/auth");
const qrCodeService_1 = require("./services/qrCodeService");
const bidService_1 = require("./services/bidService");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
if (!process.env.PORT) {
    throw new Error('PORT env not set!');
}
const PORT = process.env.PORT;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'https://ticketreselling.vercel.app',
        'https://ticketreselling-d1mb24cys-stanish28s-projects.vercel.app',
        'https://*.vercel.app'
    ],
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
if (process.env.NODE_ENV === 'production') {
    app.use(limiter);
}
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/events', events_1.default);
app.use('/api/tickets', tickets_1.default);
app.use('/api/bids', bids_1.default);
app.use('/api/admin', auth_2.authenticateToken, admin_1.default);
app.use('/api/password-reset', passwordReset_1.default);
app.get('/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-bid-room', (ticketId) => {
        socket.join(`ticket-${ticketId}`);
        console.log(`User joined bid room for ticket: ${ticketId}`);
    });
    socket.on('leave-bid-room', (ticketId) => {
        socket.leave(`ticket-${ticketId}`);
        console.log(`User left bid room for ticket: ${ticketId}`);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
app.set('io', io);
node_cron_1.default.schedule('0 */6 * * *', async () => {
    try {
        await (0, qrCodeService_1.generateAndSendQRCodes)();
        console.log('QR code generation job completed');
    }
    catch (error) {
        console.error('QR code generation job failed:', error);
    }
});
node_cron_1.default.schedule('0 * * * *', async () => {
    try {
        await (0, bidService_1.processExpiredBids)(io);
        console.log('Expired bids processing completed');
    }
    catch (error) {
        console.error('Expired bids processing failed:', error);
    }
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
console.log("PORT ENV:", process.env.PORT, "PORT VAR:", PORT);
server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
});
setInterval(() => {
    console.log("Server is alive...");
}, 30000);
//# sourceMappingURL=index.js.map