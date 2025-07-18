"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCodeForTicket = exports.generateAndSendQRCodes = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const database_1 = require("../config/database");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const generateAndSendQRCodes = async () => {
    try {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tickets = await database_1.prisma.ticket.findMany({
            where: {
                status: 'SOLD',
                event: {
                    date: {
                        gte: now,
                        lte: tomorrow
                    }
                },
                buyerId: {
                    not: null
                }
            },
            include: {
                event: {
                    select: {
                        title: true,
                        venue: true,
                        date: true
                    }
                },
                buyer: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        console.log(`Found ${tickets.length} tickets to generate QR codes for`);
        for (const ticket of tickets) {
            try {
                if (!ticket.buyer)
                    continue;
                const qrData = {
                    ticketId: ticket.id,
                    eventTitle: ticket.event.title,
                    eventVenue: ticket.event.venue,
                    eventDate: ticket.event.date,
                    buyerName: ticket.buyer.name,
                    buyerEmail: ticket.buyer.email,
                    section: ticket.section,
                    row: ticket.row,
                    seat: ticket.seat,
                    timestamp: new Date().toISOString()
                };
                const qrCodeDataURL = await qrcode_1.default.toDataURL(JSON.stringify(qrData), {
                    type: 'image/png',
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                await sendQRCodeEmail(ticket.buyer.email, ticket.buyer.name, qrCodeDataURL, ticket);
                console.log(`QR code sent for ticket ${ticket.id} to ${ticket.buyer.email}`);
            }
            catch (error) {
                console.error(`Failed to generate/send QR code for ticket ${ticket.id}:`, error);
            }
        }
    }
    catch (error) {
        console.error('QR code generation service error:', error);
        throw error;
    }
};
exports.generateAndSendQRCodes = generateAndSendQRCodes;
const sendQRCodeEmail = async (email, name, qrCodeDataURL, ticket) => {
    const eventDate = new Date(ticket.event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `🎫 Your QR Code for ${ticket.event.title}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎫 LayLow-India Ticket</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your QR code is ready!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">Event Details</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">${ticket.event.title}</h3>
            <p style="color: #666; margin: 5px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
            <p style="color: #666; margin: 5px 0;"><strong>📍 Venue:</strong> ${ticket.event.venue}</p>
            ${ticket.section ? `<p style="color: #666; margin: 5px 0;"><strong>🎭 Section:</strong> ${ticket.section}</p>` : ''}
            ${ticket.row ? `<p style="color: #666; margin: 5px 0;"><strong>📋 Row:</strong> ${ticket.row}</p>` : ''}
            ${ticket.seat ? `<p style="color: #666; margin: 5px 0;"><strong>💺 Seat:</strong> ${ticket.seat}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 20px;">Your QR Code</h3>
            <img src="${qrCodeDataURL}" alt="QR Code" style="max-width: 200px; border: 2px solid #ddd; border-radius: 8px; padding: 10px; background: white;">
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              📱 Present this QR code at the venue entrance
            </p>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
            <h4 style="color: #333; margin-top: 0;">📋 Important Information</h4>
            <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
              <li>Please arrive at least 30 minutes before the event</li>
              <li>Have your QR code ready on your phone or printed</li>
              <li>Valid ID may be required for verification</li>
              <li>This QR code is unique to your ticket</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Thank you for using LayLow-India!</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `
    };
    await transporter.sendMail(mailOptions);
};
const generateQRCodeForTicket = async (ticketId) => {
    try {
        const ticket = await database_1.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                event: {
                    select: {
                        title: true,
                        venue: true,
                        date: true
                    }
                },
                buyer: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!ticket || !ticket.buyer) {
            throw new Error('Ticket not found or no buyer assigned');
        }
        const qrData = {
            ticketId: ticket.id,
            eventTitle: ticket.event.title,
            eventVenue: ticket.event.venue,
            eventDate: ticket.event.date,
            buyerName: ticket.buyer.name,
            buyerEmail: ticket.buyer.email,
            section: ticket.section,
            row: ticket.row,
            seat: ticket.seat,
            timestamp: new Date().toISOString()
        };
        const qrCodeDataURL = await qrcode_1.default.toDataURL(JSON.stringify(qrData), {
            type: 'image/png',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return qrCodeDataURL;
    }
    catch (error) {
        console.error('Generate QR code error:', error);
        throw error;
    }
};
exports.generateQRCodeForTicket = generateQRCodeForTicket;
//# sourceMappingURL=qrCodeService.js.map