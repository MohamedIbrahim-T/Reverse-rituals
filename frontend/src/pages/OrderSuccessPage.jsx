import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Phone, ArrowRight, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      const latestOrderStr = localStorage.getItem('latestOrder');
      if (latestOrderStr) {
        try {
          const order = JSON.parse(latestOrderStr);
          setLatestOrder(order);
        } catch (e) {
          console.log('Error parsing latest order:', e);
        }
      }
      setLoading(false);
    };

    fetchLatestOrder();
  }, []);

  const getOrderStatus = (order) => {
    if (!order.isPaid) return 'Unpaid';
    if (order.status) return order.status;
    if (order.isDelivered) return 'Delivered';
    return 'Packing & Processing';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-500 text-white';
      case 'Shipped': return 'bg-blue-500 text-white';
      case 'Packing & Processing': return 'bg-yellow-500 text-white';
      default: return 'bg-yellow-100 text-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] pt-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const status = latestOrder ? getOrderStatus(latestOrder) : 'Packing & Processing';
  const isUnpaid = latestOrder && !latestOrder.isPaid;

  const handlePayNow = () => {
    if (!latestOrder || !latestOrder.orderItems) return;
    const newItems = latestOrder.orderItems.map(item => ({
      _id: item.product,
      name: item.name,
      price: item.price,
      image: item.image,
      qty: item.qty || 1
    }));
    localStorage.setItem('cartItems', JSON.stringify(newItems));
    localStorage.setItem('repay_order', latestOrder._id);
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/checkout';
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#064e3b]/5 text-center"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isUnpaid ? 'bg-red-100' : 'bg-green-100'}`}>
            <CheckCircle size={40} className={isUnpaid ? 'text-red-600' : 'text-green-600'} />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-[#064e3b] mb-4">
            {isUnpaid ? 'Order Created - Payment Pending!' : 'Order Placed Successfully!'}
          </h1>

          <p className="text-gray-500 mb-8 text-lg">
            {isUnpaid 
              ? 'Please complete your payment to process your order.' 
              : 'Thank you for your purchase. Your order is being processed.'}
          </p>

          {isUnpaid && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-600 font-medium text-sm">
                ⚠️ Your order is pending payment. Please complete the payment to track your order.
              </p>
              <button
                onClick={handlePayNow}
                className="mt-3 inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-full font-medium text-sm hover:bg-red-700 transition-all"
              >
                Pay Now
              </button>
            </div>
          )}

          {latestOrder && (
            <div className="bg-[#fdfbf7] rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500">Order ID</span>
                <span className="font-bold text-[#064e3b]">#{latestOrder._id?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-bold text-[#c5a059] text-xl">₹{latestOrder.totalPrice}</span>
              </div>
              {latestOrder.estimatedDelivery && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Expected Delivery</span>
                  <span className="font-medium text-[#064e3b]">
                    {new Date(latestOrder.estimatedDelivery).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="bg-[#064e3b]/5 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#064e3b] rounded-full flex items-center justify-center flex-shrink-0">
                <Phone size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[#064e3b] text-lg mb-2">Track Your Order</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Use your phone number to track your order status anytime.
                </p>
                <Link
                  to={`/track-order?phone=${encodeURIComponent(phone)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#064e3b] text-white rounded-full font-medium text-sm hover:bg-[#053d2f] transition-all"
                >
                  Track Order <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#064e3b] text-white rounded-full font-medium hover:bg-[#c5a059] transition-all"
            >
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
            {phone && (
              <Link
                to={`/track-order?phone=${encodeURIComponent(phone)}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#064e3b] text-[#064e3b] rounded-full font-medium hover:bg-[#064e3b] hover:text-white transition-all"
              >
                <Package size={18} /> View Order Status
              </Link>
            )}
          </div>
        </motion.div>

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-[#064e3b]/5">
          <h3 className="font-bold text-[#064e3b] mb-4 flex items-center gap-2">
            <Truck size={20} className="text-[#c5a059]" /> Order Status Timeline
          </h3>
          {status === 'Unpaid' ? (
            <div className="text-center py-4">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-600">
                Payment Pending - Please pay to track order
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#064e3b] text-white">
                  <CheckCircle size={16} />
                </div>
                <span className="text-xs mt-2 text-[#064e3b] font-medium">Order Placed</span>
              </div>

              <div className={`h-1 flex-1 mx-2 ${['Packing & Processing', 'Shipped', 'Delivered'].includes(status) ? 'bg-[#064e3b]' : 'bg-gray-200'}`}></div>

              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['Packing & Processing', 'Shipped', 'Delivered'].includes(status) ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <Package size={16} />
                </div>
                <span className="text-xs mt-2 text-gray-500">Packing</span>
              </div>

              <div className={`h-1 flex-1 mx-2 ${['Shipped', 'Delivered'].includes(status) ? 'bg-[#064e3b]' : 'bg-gray-200'}`}></div>

              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['Shipped', 'Delivered'].includes(status) ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <Truck size={16} />
                </div>
                <span className="text-xs mt-2 text-gray-500">Shipped</span>
              </div>

              <div className={`h-1 flex-1 mx-2 ${status === 'Delivered' ? 'bg-[#064e3b]' : 'bg-gray-200'}`}></div>

              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status === 'Delivered' ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <CheckCircle size={16} />
                </div>
                <span className="text-xs mt-2 text-gray-500">Delivered</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;