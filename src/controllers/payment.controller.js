const crypto = require('crypto');
const razorpay = require('../config/razorpay');

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency subunit
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({ id: order.id, currency: order.currency, amount: order.amount });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.verifyPayment = (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donorDetails,
    } = req.body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', key_secret).update(body.toString()).digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log('Payment Successful. Saving to database...', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        donor: donorDetails,
        status: 'Success',
        date: new Date().toISOString(),
      });

      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    }

    console.warn('Payment signature verification failed.', { orderId: razorpay_order_id, paymentId: razorpay_payment_id });
    res.status(400).json({ success: false, message: 'Invalid signature' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID || 'dummy_key_id' });
};

