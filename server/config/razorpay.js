import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_key_id';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'sample_razorpay_secret_key';

export const razorpayInstance = new Razorpay({
  key_id,
  key_secret
});

export const createRazorpayOrder = async (amountInINR, currency = 'INR', receipt = `rcpt_${Date.now()}`) => {
  const amountInPaise = Math.round(amountInINR * 100);
  try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('sample')) {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes: {
          protectedBy: 'Razorpay IntentGuard',
          timestamp: new Date().toISOString()
        }
      });
      return { success: true, order, isMock: false };
    }
  } catch (err) {
    console.warn(`[Razorpay SDK Warning] Official API call failed (${err.message}). Falling back to simulated Razorpay Order structure.`);
  }

  // Simulated Razorpay Order structure matching official payload schema
  return {
    success: true,
    isMock: true,
    order: {
      id: `order_rzp_mock_${Math.random().toString(36).substring(2, 11)}`,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: currency,
      receipt: receipt,
      status: 'created',
      attempts: 0,
      notes: {
        protectedBy: 'Razorpay IntentGuard',
        timestamp: new Date().toISOString()
      },
      created_at: Math.floor(Date.now() / 1000)
    }
  };
};
