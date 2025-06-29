interface TicketData {
    id: string;
    price: number;
    event: {
        title: string;
        venue: string;
        date: Date;
    };
    seller: {
        name: string;
        email: string;
    };
    buyer?: {
        name: string;
        email: string;
    };
}
interface EmailData {
    to: string;
    ticket: TicketData;
    qrCodeData?: string;
}
export declare const sendPurchaseConfirmationEmail: (emailData: EmailData) => Promise<void>;
export declare const sendSaleNotificationEmail: (emailData: EmailData) => Promise<void>;
export {};
//# sourceMappingURL=email.d.ts.map