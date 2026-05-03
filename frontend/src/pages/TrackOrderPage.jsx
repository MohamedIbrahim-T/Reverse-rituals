import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, MapPin, Phone, Search, ShoppingBag, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TrackOrderPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';
  
  const [phone, setPhone] = useState(initialPhone);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialPhone) {
      handleSearch(initialPhone);
    }
  }, [initialPhone]);

  const handleSearch = async (phoneNumber = phone) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
    
    if (cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const { data } = await axios.get(`${API_URL}/api/orders/by-phone?phone=${cleanPhone}`);
      setOrders(data);
      
      if (data.length === 0) {
        toast.info('No orders found for this phone number');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ phone: phone });
    handleSearch();
  };

  const getOrderStatus = (order) => {
    if (!order.isPaid) return 'Unpaid';
    if (order.status) return order.status;
    if (order.isDelivered) return 'Delivered';
    return 'Packing & Processing';
  };

  const getStatusSteps = (status) => {
    if (status === 'Unpaid') {
      return { currentStep: 0, totalSteps: 4 };
    }
    const steps = ['Packing & Processing', 'Shipped', 'Delivered'];
    return {
      currentStep: steps.indexOf(status) + 1,
      totalSteps: steps.length + 1
    };
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-[#064e3b] mb-4">
            Track Your <span className="text-[#c5a059]">Order</span>
          </h1>
          <p className="text-gray-500">
            Enter your phone number to view your order status
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#064e3b]/5 mb-8"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit phone number"
                className="w-full pl-12 pr-4 py-4 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059] text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-[#064e3b] text-white rounded-xl font-bold hover:bg-[#053d2f] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search size={20} /> Track
                </>
              )}
            </button>
          </form>
        </motion.div>

        {hasSearched && !loading && orders.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#064e3b]">
                Your Orders ({orders.length})
              </h2>
              <Link to="/" className="flex items-center gap-2 text-[#c5a059] font-medium text-sm hover:underline">
                <ShoppingBag size={18} />
                Continue Shopping
              </Link>
            </div>

            {orders.map((order, index) => {
              const status = getOrderStatus(order);
              const { currentStep } = getStatusSteps(status);
              
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
                      <span className="text-xs font-semibold text-gray-400 uppercase">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                      ${status === 'Unpaid' ? 'bg-red-500 text-white' :
                        status === 'Delivered' ? 'bg-green-500 text-white' : 
                        status === 'Shipped' ? 'bg-blue-500 text-white' : 
                        'bg-yellow-500 text-white'}`}>
                      {status}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <p className="text-xs font-medium text-gray-400 mb-3">Order Status</p>
                      {status === 'Unpaid' ? (
                        <div className="text-center py-2">
                          <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-600">
                            Payment Pending - Please Pay to Track Order
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.isPaid ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <CheckCircle size={14} />
                            </div>
                            <span className={`text-[10px] mt-1 ${order.isPaid ? 'text-[#064e3b] font-medium' : 'text-gray-400'}`}>Paid</span>
                          </div>

                          <div className={`h-0.5 w-8 ${order.isPaid ? 'bg-[#064e3b]' : 'bg-gray-200'}`}></div>

                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <Package size={14} />
                            </div>
                            <span className={`text-[10px] mt-1 ${currentStep >= 1 ? 'text-[#064e3b] font-medium' : 'text-gray-400'}`}>Packing</span>
                          </div>

                          <div className={`h-0.5 w-8 ${currentStep >= 2 ? 'bg-[#064e3b]' : 'bg-gray-200'}`}></div>

                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <Truck size={14} />
                            </div>
                            <span className={`text-[10px] mt-1 ${currentStep >= 2 ? 'text-[#064e3b] font-medium' : 'text-gray-400'}`}>Shipped</span>
                          </div>

                          <div className={`h-0.5 w-8 ${currentStep >= 3 ? 'bg-[#064e3b]' : 'bg-gray-200'}`}></div>

                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <CheckCircle size={14} />
                            </div>
                            <span className={`text-[10px] mt-1 ${currentStep >= 3 ? 'text-[#064e3b] font-medium' : 'text-gray-400'}`}>Delivered</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible sm:w-24">
                        {order.orderItems.slice(0, 3).map((item, i) => (
                          <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#f5f5f5] overflow-hidden flex-shrink-0">
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
                            <span className="text-gray-500">Expected:</span>
                            <span className="font-medium text-[#c5a059]">
                              {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
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
                              onClick={() => {
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
                                window.location.href = '/checkout';
                              }}
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

        {hasSearched && !loading && orders.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#064e3b] mb-2">No orders found</h3>
            <p className="text-gray-500 text-sm mb-6">
              We couldn't find any orders for this phone number. Make sure you entered the correct number used during checkout.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#064e3b] text-white rounded-full font-medium text-sm hover:bg-[#c5a059] transition-colors">
              Browse Products
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;