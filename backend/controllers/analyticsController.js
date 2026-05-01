const Visit = require('../models/Visit');
const User = require('../models/User');
const Order = require('../models/Order');

const trackVisit = async (req, res) => {
  try {
    const { deviceType, page, sessionId, action } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userId = req.user ? req.user._id : null;
    const isLoggedIn = !!userId;

    const visit = new Visit({
      ip,
      user: userId,
      deviceType,
      page: page || '/',
      sessionId,
      action: action || 'view',
      isLoggedIn
    });

    await visit.save();
    res.status(201).json({ success: true, visitId: visit._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const { filter } = req.query;
    
    let startDate = new Date(0);
    
    if (filter === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (filter === 'last7days') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (filter === 'last30days') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const totalVisitors = await Visit.countDocuments({ createdAt: { $gte: startDate } });
    const loggedInVisitors = await Visit.countDocuments({ createdAt: { $gte: startDate }, isLoggedIn: true });
    const guestVisitors = totalVisitors - loggedInVisitors;
    
    const newSignups = await User.countDocuments({ createdAt: { $gte: startDate } });
    
    const paidOrders = await Order.countDocuments({ createdAt: { $gte: startDate }, isPaid: true });

    let conversionRate = 0;
    if (totalVisitors > 0) {
      conversionRate = (paidOrders / totalVisitors) * 100;
      if (conversionRate > 100) conversionRate = 100;
      conversionRate = parseFloat(conversionRate.toFixed(2));
    }

    res.json({
      totalVisitors: totalVisitors || 0,
      loggedInVisitors: loggedInVisitors || 0,
      guestVisitors: guestVisitors || 0,
      newSignups: newSignups || 0,
      paidOrders: paidOrders || 0,
      conversionRate: conversionRate || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVisitsGraph = async (req, res) => {
  try {
    const { days } = req.query;
    const numDays = parseInt(days) || 30;
    const startDate = new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
    
    const allVisits = await Visit.find({
      createdAt: { $gte: startDate },
      action: { $ne: 'cart_abandon' }
    }).lean();

    const dailyData = {};
    allVisits.forEach(v => {
      const dateKey = v.createdAt.toISOString().slice(0, 10);
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { count: 0, loggedIn: 0, guest: 0 };
      }
      dailyData[dateKey].count++;
      if (v.isLoggedIn) {
        dailyData[dateKey].loggedIn++;
      } else {
        dailyData[dateKey].guest++;
      }
    });

    const result = Object.keys(dailyData).sort().map(date => ({
      _id: date,
      ...dailyData[date]
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrdersGraph = async (req, res) => {
  try {
    const { days } = req.query;
    const numDays = parseInt(days) || 30;
    const startDate = new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
    
    const allOrders = await Order.find({
      createdAt: { $gte: startDate },
      isPaid: true
    }).lean();

    const dailyData = {};
    allOrders.forEach(o => {
      const dateKey = o.createdAt.toISOString().slice(0, 10);
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { count: 0, totalRevenue: 0 };
      }
      dailyData[dateKey].count++;
      dailyData[dateKey].totalRevenue += o.totalPrice || 0;
    });

    const result = Object.keys(dailyData).sort().map(date => ({
      _id: date,
      ...dailyData[date]
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  trackVisit,
  getStats,
  getVisitsGraph,
  getOrdersGraph
};