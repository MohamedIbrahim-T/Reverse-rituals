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

const getLocalISODate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
      startDate.setHours(0, 0, 0, 0);
    } else if (filter === 'last30days') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
    }

    const totalVisitorsList = await Visit.distinct('sessionId', { createdAt: { $gte: startDate } });
    const totalVisitors = totalVisitorsList.length;

    const loggedInVisitorsList = await Visit.distinct('sessionId', { createdAt: { $gte: startDate }, isLoggedIn: true });
    const loggedInVisitors = loggedInVisitorsList.length;

    const guestVisitors = Math.max(0, totalVisitors - loggedInVisitors);
    
    const newSignups = await User.countDocuments({ createdAt: { $gte: startDate }, isAdmin: false });
    
    const paidOrders = await Order.countDocuments({
      $or: [
        { paidAt: { $gte: startDate } },
        { createdAt: { $gte: startDate }, isPaid: true }
      ],
      isPaid: true
    });

    const unpaidOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
      isPaid: false
    });

    const uniqueMembers = await Order.distinct('shippingAddress.phone', {
      createdAt: { $gte: startDate }
    });
    const membersOrdered = uniqueMembers.length;

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
      unpaidOrders: unpaidOrders || 0,
      membersOrdered: membersOrdered || 0,
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
    startDate.setHours(0, 0, 0, 0);
    
    const allVisits = await Visit.find({
      createdAt: { $gte: startDate },
      action: { $ne: 'cart_abandon' }
    }).lean();

    const dailySessions = {};
    allVisits.forEach(v => {
      const dateKey = getLocalISODate(v.createdAt);
      if (!dailySessions[dateKey]) {
        dailySessions[dateKey] = { sessions: new Set(), loggedInSessions: new Set(), guestSessions: new Set() };
      }
      if (v.sessionId) {
        dailySessions[dateKey].sessions.add(v.sessionId);
        if (v.isLoggedIn) {
          dailySessions[dateKey].loggedInSessions.add(v.sessionId);
        } else {
          dailySessions[dateKey].guestSessions.add(v.sessionId);
        }
      }
    });

    const result = Object.keys(dailySessions).sort().map(date => ({
      _id: date,
      count: dailySessions[date].sessions.size,
      loggedIn: dailySessions[date].loggedInSessions.size,
      guest: dailySessions[date].guestSessions.size
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
    startDate.setHours(0, 0, 0, 0);
    
    const allOrders = await Order.find({
      $or: [
        { paidAt: { $gte: startDate } },
        { createdAt: { $gte: startDate }, isPaid: true }
      ],
      isPaid: true
    }).lean();

    const dailyData = {};
    allOrders.forEach(o => {
      const targetDate = o.paidAt ? new Date(o.paidAt) : new Date(o.createdAt);
      const dateKey = getLocalISODate(targetDate);
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