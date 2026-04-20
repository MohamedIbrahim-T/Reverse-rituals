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
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!user.token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${API_URL}/api/orders/myorders`, config);
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

const handleBuyAgain = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) {
      toast.error('No items in this order');
      return;
    }
    
    // Get existing cart items from localStorage
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
    
    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(newItems));
    
    // Force state update
    window.dispatchEvent(new Event('storage'));
    
    // Navigate to cart with message
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
            {orders.map((order, index) => (
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
                  <div className="flex items-center gap-3">
                    {!order.isPaid ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Processing
                      </span>
                    ) : order.isDelivered ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        Delivered
                      </span>
                    ) : order.isPaid ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Link to={`/product/${order.orderItems[0]?.product}`} className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible sm:w-24">
                      {order.orderItems.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#f5f5f5] overflow-hidden flex-shrink-0 hover:opacity-80 transition">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                          )}
                        </div>
                      ))}
                    </Link>

                    <div className="grow space-y-4">
                      <div>
                        <h3 className="font-semibold text-[#064e3b]">
                          {order.orderItems.map(item => item.name).join(', ')}
                        </h3>
                        <p className="text-sm text-gray-500">{order.orderItems.length} item(s)</p>
                      </div>

                      <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.isPaid ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <CheckCircle size={16} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Payment</p>
                            <p className={`text-xs font-medium ${order.isPaid ? 'text-green-600' : 'text-gray-400'}`}>{order.isPaid ? 'Done' : 'Pending'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.isPaid ? 'bg-[#064e3b]/10 text-[#064e3b]' : 'bg-gray-200 text-gray-400'}`}>
                            <Truck size={16} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Delivery</p>
                            <p className={`text-xs font-medium ${order.isDelivered ? 'text-[#064e3b]' : 'text-gray-400'}`}>
                              {order.isDelivered ? `Shipped ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}` : 'Processing'}
                            </p>
                          </div>
                        </div>
                        {order.estimatedDelivery && !order.isDelivered && order.isPaid && (
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#c5a059]/10 text-[#c5a059]">
                              <Package size={16} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Delivery Date</p>
                              <p className="text-xs font-medium text-[#c5a059]">
                                {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

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
                      <MapPin size={16} className="text-[#c5a059] mt-0.5" />
                      <div>
                        <span className="font-medium text-[#064e3b]">Shipping: </span>
                        {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;