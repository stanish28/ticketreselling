import QRCode from 'qrcode';

export const generateQRCode = async (ticketId: string): Promise<string> => {
  try {
    // Generate QR code data as a URL that can be used to verify the ticket
    const qrData = JSON.stringify({
      ticketId,
      timestamp: Date.now(),
      type: 'ticket'
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Return a fallback QR code or throw error
    throw new Error('Failed to generate QR code');
  }
};

export const generateQRCodeSync = (ticketId: string): string => {
  // For now, return a simple text representation
  // In a real app, you might want to use a synchronous QR library or pre-generate codes
  return `TICKET:${ticketId}:${Date.now()}`;
}; 