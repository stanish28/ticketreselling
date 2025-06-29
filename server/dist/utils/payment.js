"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayment = void 0;
const processPayment = async (paymentData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
        return {
            success: false,
            error: 'Invalid payment information'
        };
    }
    const isSuccess = Math.random() > 0.1;
    if (isSuccess) {
        return {
            success: true,
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }
    else {
        return {
            success: false,
            error: 'Payment declined. Please try again.'
        };
    }
};
exports.processPayment = processPayment;
//# sourceMappingURL=payment.js.map