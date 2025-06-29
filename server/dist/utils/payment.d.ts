interface PaymentData {
    amount: number;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}
interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
}
export declare const processPayment: (paymentData: PaymentData) => Promise<PaymentResult>;
export {};
//# sourceMappingURL=payment.d.ts.map