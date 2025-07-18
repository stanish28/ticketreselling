"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSaleNotificationEmail = exports.sendPurchaseConfirmationEmail = void 0;
const sendPurchaseConfirmationEmail = async (emailData) => {
    console.log('Sending purchase confirmation email to:', emailData.to);
    console.log('Ticket:', emailData.ticket.id);
    console.log('Event:', emailData.ticket.event.title);
    console.log('Price:', emailData.ticket.price);
    await new Promise(resolve => setTimeout(resolve, 500));
    const emailContent = `
    Dear ${emailData.ticket.buyer?.name || 'Valued Customer'},
    
    Thank you for your purchase! Your ticket has been confirmed.
    
    Event: ${emailData.ticket.event.title}
    Venue: ${emailData.ticket.event.venue}
    Date: ${emailData.ticket.event.date.toLocaleDateString()}
    Price: $${emailData.ticket.price.toFixed(2)}
    Ticket ID: ${emailData.ticket.id}
    
    Your QR code is attached to this email for entry.
    
    Enjoy the event!
    
    Best regards,
    LayLow-India Team
  `;
    console.log('Email content:', emailContent);
};
exports.sendPurchaseConfirmationEmail = sendPurchaseConfirmationEmail;
const sendSaleNotificationEmail = async (emailData) => {
    console.log('Sending sale notification email to:', emailData.to);
    console.log('Ticket sold:', emailData.ticket.id);
    console.log('Amount:', emailData.ticket.price);
    await new Promise(resolve => setTimeout(resolve, 500));
    const emailContent = `
    Dear ${emailData.ticket.seller.name},
    
    Congratulations! Your ticket has been sold.
    
    Event: ${emailData.ticket.event.title}
    Amount: $${emailData.ticket.price.toFixed(2)}
    Ticket ID: ${emailData.ticket.id}
    
    Payment will be processed and transferred to your account within 3-5 business days.
    
    Thank you for using LayLow-India!
    
    Best regards,
    LayLow-India Team
  `;
    console.log('Email content:', emailContent);
};
exports.sendSaleNotificationEmail = sendSaleNotificationEmail;
//# sourceMappingURL=email.js.map