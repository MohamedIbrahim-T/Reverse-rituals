import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (authLoading) return;

      if (!user) {
        navigate('/login');
        return;
      }

      const latestOrderStr = localStorage.getItem('latestOrder');
      let latestOrder = null;
      if (latestOrderStr) {
        try {
          latestOrder = JSON.parse(latestOrderStr);
        } catch (e) {
          console.log('Error parsing latest order:', e);
        }
      }

      if (!user.token) {
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${API_URL}/api/orders/myorders`, config);

        if (latestOrder) {
          const merged = [latestOrder, ...data.filter(o => o._id !== latestOrder._id)];
          setOrders(merged);
        } else {
          setOrders(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        if (latestOrder) {
          setOrders([latestOrder]);
        }
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchOrders();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const getOrderStatus = (order) => {
    if (order.status) return order.status;
    if (order.isDelivered) return 'Delivered';
    if (order.isPaid) return 'Shipped';
    return 'Pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-500 text-white';
      case 'Shipped':
        return 'bg-blue-500 text-white';
      case 'Packing & Processing':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-yellow-100 text-yellow-600';
    }
  };

  const handleBuyAgain = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) {
      toast.error('No items in this order');
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const newItems = [...existingCart];

    order.orderItems.forEach(item => {
      const itemId = item.product;
      const existingItem = newItems.find(x => x._id === itemId);

      if (existingItem) {
        existingItem.qty += item.qty || 1;
      } else {
        newItems.push({
          _id: itemId,
          name: item.name,
          price: item.price,
          image: item.image,
          qty: item.qty || 1
        });
      }
    });

    localStorage.setItem('cartItems', JSON.stringify(newItems));
    window.dispatchEvent(new Event('storage'));
    navigate('/cart', { state: { message: 'Items added to cart!' } });
  };

  const handlePayNow = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) {
      toast.error('No items in this order');
      return;
    }

    const newItems = order.orderItems.map(item => ({
      _id: item.product,
      name: item.name,
      price: item.price,
      image: item.image,
      qty: item.qty || 1
    }));

    localStorage.setItem('cartItems', JSON.stringify(newItems));
    localStorage.setItem('repay_order', order._id);
    window.dispatchEvent(new Event('storage'));
    navigate('/checkout');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fdfbf7] pt-24 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] pt-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#064e3b]">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">Track your orders</p>
          </div>
          <Link to="/" className="flex items-center gap-2 text-[#c5a059] font-medium text-sm hover:underline">
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#064e3b] mb-2">No orders yet</h3>
            <p className="text-gray-500 text-sm mb-6">Start shopping to see your orders here</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#064e3b] text-white rounded-full font-medium text-sm hover:bg-[#c5a059] transition-colors">
              Browse Products
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const status = getOrderStatus(order);
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="bg-[#f8fdf9] px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {/* <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(status)}`}>
                      {status}
                    </span> */}
                  </div>

                  <div className="p-6">
                    {!order.isPaid ? (
                      <div className="text-center py-4">
                        <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-600">
                          Payment Pending
                        </span>
                        <p className="text-sm text-gray-500 mt-2">Please complete your payment to track order status</p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <p className="text-xs font-medium text-gray-400 mb-3">Order Status</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.isPaid ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <CheckCircle size={14} />
                            </div>
                            <span className={`text-[10px] mt-1 ${order.isPaid ? 'text-[#064e3b] font-medium' : 'text-gray-400'}`}>Paid</span>
                          </div>

                          <div className={`h-0.5 w-8 ${order.isPaid ? 'bg-[#064e3b]' : 'bg-gray-200'}`}></div>

                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['Packing & Processing', 'Shipped', 'Delivered'].includes(status) ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <Package size={14} />
                            </div>
                            <span className={`text-[10px] mt-1 ${['Packing & Processing', 'Shipped', 'Delivered'].includes(status) ? 'text-[#064e3b] font-medium' : 'text-gray-400'}`}>Packing & Processing</span>
                          </div>

                          <div className={`h-0.5 w-8 ${['Shipped', 'Delivered'].includes(status) ? 'bg-[#064e3b]' : 'bg-gray-200'}`}></div>

                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['Shipped', 'Delivered'].includes(status) ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <Truck size={14} />
                            </div>
                            <span className={`text-[10px] mt-1 ${['Shipped', 'Delivered'].includes(status) ? 'text-[#064e3b] font-medium' : 'text-gray-400'}`}>Shipped</span>
                          </div>

                          <div className={`h-0.5 w-8 ${status === 'Delivered' ? 'bg-[#064e3b]' : 'bg-gray-200'}`}></div>

                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'Delivered' ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <CheckCircle size={14} />
                            </div>
                            <span className={`text-[10px] mt-1 ${status === 'Delivered' ? 'text-[#064e3b] font-medium' : 'text-gray-400'}`}>Delivered</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible sm:w-24">
                        {order.orderItems.slice(0, 3).map((item, i) => (
                          <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#f5f5f5] overflow-hidden flex-shrink-0 hover:opacity-80 transition">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="grow space-y-4">
                        <div>
                          <h3 className="font-semibold text-[#064e3b]">
                            {order.orderItems.map(item => item.name).join(', ')}
                          </h3>
                          <p className="text-sm text-gray-500">{order.orderItems.length} item(s)</p>
                        </div>

                        {order.estimatedDelivery && status !== 'Delivered' && order.isPaid && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Expected Delivery Date:</span>
                            <span className="font-medium text-[#c5a059]">
                              {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium text-[#064e3b]">Total: </span>
                            <span className="font-bold text-[#c5a059]">₹{order.totalPrice}</span>
                          </div>
                          {!order.isPaid && (
                            <button
                              onClick={() => handlePayNow(order)}
                              className="flex items-center gap-2 px-4 py-2 bg-[#c5a059] text-white rounded-full text-sm font-medium hover:bg-[#064e3b] transition-colors"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {order.shippingAddress && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-3 text-sm text-gray-500">
                        <MapPin size={20} className="text-[#c5a059] mt-0.5" />
                        <div>
                          <span className="font-medium text-[#064e3b]">Shipping: </span>
                          {order.shippingAddress.fullName}, {order.shippingAddress.address} {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;