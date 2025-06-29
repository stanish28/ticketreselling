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

export const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Dummy validation - in a real app, you'd integrate with Stripe, PayPal, etc.
  if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
    return {
      success: false,
      error: 'Invalid payment information'
    };
  }

  // Simulate payment success (90% success rate for demo)
  const isSuccess = Math.random() > 0.1;

  if (isSuccess) {
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } else {
    return {
      success: false,
      error: 'Payment declined. Please try again.'
    };
  }
}; 