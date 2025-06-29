"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCodeSync = exports.generateQRCode = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const generateQRCode = async (ticketId) => {
    try {
        const qrData = JSON.stringify({
            ticketId,
            timestamp: Date.now(),
            type: 'ticket'
        });
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(qrData, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return qrCodeDataUrl;
    }
    catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};
exports.generateQRCode = generateQRCode;
const generateQRCodeSync = (ticketId) => {
    return `TICKET:${ticketId}:${Date.now()}`;
};
exports.generateQRCodeSync = generateQRCodeSync;
//# sourceMappingURL=qrCode.js.map