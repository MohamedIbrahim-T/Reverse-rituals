const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');

const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  verifyPayment,
  getOrders,
  updateOrderToDelivered,
  updateOrderStatus,
  markOrderAsPaid,
  deleteOrder,
  createPaymentForOrder,
} = require('../controllers/orderController');

const { protect, admin, optionalProtect } = require('../middleware/auth');


// ✅ NORMAL ROUTES
router.get('/myorders', protect, getMyOrders);
router.post('/verify', verifyPayment);
router.put('/fix-paid/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();

    res.json({ message: 'Order marked as paid', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/:id/pay', optionalProtect, createPaymentForOrder);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/mark-paid', protect, admin, markOrderAsPaid);

router.get('/:id', protect, getOrderById);
router.delete('/:id', protect, admin, deleteOrder);



router.post('/', optionalProtect, addOrderItems);
router.get('/', protect, admin, getOrders);



// Export webhook handler for index.js
const webhookHandler = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expected = crypto
      .createHmac('sha256', secret)
      .update(req.body.toString())
      .digest('hex');

    if (signature !== expected) {
      console.log('❌ Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(req.body.toString());

    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;

      const order = await Order.findOne({
        'paymentResult.razorpay_order_id': payment.order_id,
      });

      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          ...order.paymentResult,
          id: payment.id,
          status: 'PAID',
        };

        await order.save();
        console.log('✅ Paid via webhook:', order._id);

        // ✅ SEND EMAIL FROM WEBHOOK
        try {
          const emailModule = require('../config/email');
          const sendOrderEmail = emailModule.sendOrderEmail;
          const User = require('../models/User');
          
          const user = order.user ? await User.findById(order.user) : null;
          const email = user?.email || order.shippingAddress?.email || '';

          await sendOrderEmail({
            orderId: order._id.toString().slice(-8),
            customerName: order.shippingAddress.fullName,
            address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}`,
            email,
            phone: order.shippingAddress.phone,
            altPhone: order.shippingAddress.altPhone,
            items: order.orderItems,
            total: order.totalPrice,
            estimatedDelivery: order.estimatedDelivery,
          });
          console.log('📧 Email sent via webhook to:', email);
        } catch (emailErr) {
          console.log('📧 Webhook email error:', emailErr.message);
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: 'Webhook failed' });
  }
};

module.exports = router;
module.exports.webhook = webhookHandler;