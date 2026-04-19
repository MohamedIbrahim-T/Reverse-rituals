const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

console.log('=== ORDER CONTROLLER LOADED ===');

let emailModule = null;
let sendOrderEmail = async () => { console.log('Email function not loaded'); };
try {
  emailModule = require('../config/email');
  sendOrderEmail = emailModule.sendOrderEmail;
  console.log('✅ Email module loaded successfully in orderController');
} catch (e) {
  console.log('❌ Email module not available:', e.message);
}

// @desc    Create new order & Razorpay order
// @route   POST /api/orders
// @access  Public (Guest Checkout) or Private
const addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  try {
    const productIds = orderItems.map(item => item.product);

    if (!productIds.every(id => id && typeof id === 'string' && id.length > 0)) {
      console.log('Invalid product IDs received:', productIds);
      res.status(400).json({ message: 'Invalid product ID format', received: productIds });
      return;
    }

    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== orderItems.length) {
      res.status(400).json({ message: 'One or more products not found' });
      return;
    }

    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    let itemsPrice = 0;
    const orderItemsWithPrices = [];

    for (const item of orderItems) {
      const product = productMap.get(item.product);

      if (!product) {
        res.status(400).json({ message: `Product not found: ${item.product}` });
        return;
      }

      if (product.countInStock < item.qty) {
        res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}`
        });
        return;
      }

      const itemTotal = product.price * item.qty;
      itemsPrice += itemTotal;

      orderItemsWithPrices.push({
        name: product.name,
        qty: item.qty,
        image: product.image,
        price: product.price,
        product: product._id
      });
    }

    const totalPrice = itemsPrice;

    const options = {
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save address to user if logged in
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.shippingAddress = shippingAddress;
        await user.save();
      }
    }

    const order = new Order({
      orderItems: orderItemsWithPrices,
      user: req.user ? req.user._id : null,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice: 0,
      totalPrice,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      paymentResult: {
        razorpay_order_id: razorpayOrder.id,
      },
    });

    const createdOrder = await order.save();
    res.status(201).json({
      order: createdOrder,
      razorpayOrder: razorpayOrder,
    });
  } catch (error) {
    console.error('ORDER ERROR:', error.name, error.message);
    res.status(500).json({
      message: 'Order creation failed',
      error: error.message
    });
  }
};

// @desc    Update existing order for re-payment
// @route   POST /api/orders/:id/pay
// @access  Private
const createPayLinkForOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.isPaid) {
        return res.status(400).json({ message: 'Order is already paid' });
      }

      const options = {
        amount: Math.round(order.totalPrice * 100),
        currency: "INR",
        receipt: `receipt_${order._id}_${Date.now()}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      order.paymentResult = {
        razorpay_order_id: razorpayOrder.id,
      };

      await order.save();

      res.json({
        order,
        razorpayOrder
      });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to create payment link', error: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/orders/verify
// @access  Public
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Missing orderId' });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.isPaid) {
    return res.json({ message: 'Already paid', order });
  }

  try {
    // ✅ 1. VERIFY SIGNATURE (STRICT)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // ✅ 2. VERIFY WITH RAZORPAY API
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      return res.status(400).json({ message: 'Payment not captured' });
    }

    // ✅ 3. MARK PAID
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'PAID',
      razorpay_order_id,
    };

    const updatedOrder = await order.save();

    console.log('✅ Paid via verify:', updatedOrder._id);

    // ✅ 4. SEND EMAIL (ONLY ONCE)
    console.log('📧 Trying to send email for order:', updatedOrder._id);
    try {
      const user = order.user ? await User.findById(order.user) : null;
      const email = user?.email || order.shippingAddress?.email || '';
      console.log('📧 Customer email:', email);

      if (!email) {
        console.log('📧 No customer email, skipping user email');
      }

      const result = await sendOrderEmail({
        orderId: updatedOrder._id.toString().slice(-8),
        customerName: order.shippingAddress.fullName,
        address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}`,
        email,
        phone: order.shippingAddress.phone,
        altPhone: order.shippingAddress.altPhone,
        items: order.orderItems,
        total: order.totalPrice,
        estimatedDelivery: order.estimatedDelivery,
      });
      console.log('📧 Email result:', result);
    } catch (err) {
      console.log('📧 Email error:', err.message);
    }

    res.json({ message: 'Payment verified successfully', order: updatedOrder });

  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create payment for existing unpaid order
// @route   POST /api/orders/:id/pay
// @access  Private
const createPaymentForOrder = async (req, res) => {
  try {
    console.log('Looking for order:', req.params.id);
    let order;
    try {
      order = await Order.findById(req.params.id);
    } catch (e) {
      console.log('Invalid order ID format');
      res.status(400).json({ message: 'Invalid order ID' });
      return;
    }
    console.log('Order found:', order ? 'yes' : 'no', order ? 'totalPrice: ' + order.totalPrice + ', user: ' + order.user : '');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Check if user owns this order (allow if no user on order or user matches)
    const orderUserId = order.user ? order.user.toString() : null;
    const reqUserId = req.user ? req.user._id.toString() : null;

    console.log('Order user ID:', orderUserId, 'Request user ID:', reqUserId);

    // Allow if order has no user, or if user matches
    if (orderUserId && reqUserId && orderUserId !== reqUserId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (order.isPaid) {
      res.status(400).json({ message: 'Order already paid' });
      return;
    }

    if (!order.totalPrice || order.totalPrice <= 0) {
      res.status(400).json({ message: 'Invalid order amount' });
      return;
    }

    const amountInPaise = Math.round(order.totalPrice * 100);
    console.log('Creating Razorpay order with amount:', amountInPaise, 'paise');

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${order._id}_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', razorpayOrder.id);

    order.paymentResult = {
      razorpay_order_id: razorpayOrder.id,
    };

    await order.save();

    res.json({
      order,
      razorpayOrder
    });
  } catch (error) {
    console.error('Payment creation error - full details:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Failed to create payment', error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (status === 'Processing') {
      order.isDelivered = false;
      order.deliveredAt = null;
    } else if (status === 'Shipped') {
      order.isDelivered = false;
    } else if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Mark order as paid manually
// @route   PUT /api/orders/:id/mark-paid
// @access  Private/Admin
const markOrderAsPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: `manual_${Date.now()}`,
      status: 'PAID',
      update_time: new Date().toISOString(),
      email_address: order.shippingAddress?.email || '',
    };
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await order.deleteOne();
    res.json({ message: 'Order deleted' });
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

module.exports = {
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
};
