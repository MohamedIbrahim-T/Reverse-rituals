import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard, MapPin, Phone, User, ArrowRight, ShieldCheck,
  LocateFixed, Navigation, CheckCircle2, Loader2, Search, ArrowLeft,
  Package, Truck, Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Fetch user profile and auto-fill user details
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        // Auto-fill name, email, phone from profile (always)
        setFormData(prev => ({
          ...prev,
          fullName: data.name || user.name || prev.fullName,
          phone: data.phone || prev.phone,
        }));

        // Store saved address for "Use Saved Address" button
        if (data.shippingAddress?.address) {
          setSavedAddressFromDB(data.shippingAddress);
          // Auto-fill form with saved address
          setFormData({
            fullName: data.shippingAddress.fullName || data.name || user.name || '',
            address: data.shippingAddress.address || '',
            state: data.shippingAddress.state || '',
            city: data.shippingAddress.city || '',
            zipCode: data.shippingAddress.zipCode || '',
            phone: data.shippingAddress.phone || data.phone || '',
            altPhone: data.shippingAddress.altPhone || '',
          });
        }
      } catch (error) {
        console.log('Could not fetch user profile');
      }
      setIsCheckingAuth(false);
    };

    fetchUserProfile();
  }, [user?.token]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    state: '',
    city: '',
    zipCode: '',
    phone: '',
    altPhone: '',
  });

  // State for saved address from DB
  const [savedAddressFromDB, setSavedAddressFromDB] = useState(null);

  // State/City/Loading states
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const alertShownRef = React.useRef(false);

  // If user has saved address in DB, show button
  const hasSavedAddress = savedAddressFromDB?.address;

  const handleUseSavedAddress = () => {
    if (savedAddressFromDB) {
      setFormData({
        fullName: savedAddressFromDB.fullName || user.name || '',
        address: savedAddressFromDB.address || '',
        state: savedAddressFromDB.state || '',
        city: savedAddressFromDB.city || '',
        zipCode: savedAddressFromDB.zipCode || '',
        phone: savedAddressFromDB.phone || user.phone || '',
      });
      toast.success('Address loaded from saved');
    }
  };

  const handleSaveAddress = async () => {
    if (!user || !user.token) {
      toast.error('Please login to save address');
      return;
    }
    if (!formData.fullName || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.phone) {
      toast.error('Please fill all address fields');
      return;
    }
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(`${API_URL}/api/users/profile`, {
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone,
        }
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Address saved!');
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    }
  };

  const displayItems = cartItems;

  const getShippingCharge = (state) => {
    if (!state) return 0;
    const freeStates = ['tamil nadu', 'tn', 'pondicherry', 'puducherry', 'py'];
    const extra49States = ['karnataka', 'andhra pradesh', 'telangana'];

    const lowerState = state.toLowerCase().trim();

    if (freeStates.includes(lowerState)) return 0;
    if (extra49States.includes(lowerState)) return 49;
    return 99;
  };

  const shippingCharge = getShippingCharge(formData.state);
  const finalTotal = cartTotal + shippingCharge;

  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const { data } = await axios.post('https://countriesnow.space/api/v0.1/countries/states', { country: "India" });
        if (data && !data.error) {
          setStates(data.data.states.map(s => s.name));
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) { setCities([]); return; }
      setLoadingCities(true);
      try {
        const { data } = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', {
          country: "India", state: formData.state
        });
        if (data && !data.error) setCities(data.data);
      } catch (error) { console.error("Error fetching cities:", error); }
      finally { setLoadingCities(false); }
    };
    fetchCities();
  }, [formData.state]);

  const handlePincodeChange = async (e) => {
    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData({ ...formData, zipCode: code });

    if (code.length === 6) {
      setIsFetchingPincode(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const { data } = await axios.get(`${API_URL}/api/pincode/${code}`);
        if (data && data[0].Status === "Success") {
          const postoffice = data[0].PostOffice[0];
          setFormData({
            ...formData,
            state: postoffice.State === "Delhi" ? "National Capital Territory of Delhi" : postoffice.State,
            city: postoffice.District || postoffice.Name,
            zipCode: code
          });
          toast.success(`Detected: ${postoffice.District}, ${postoffice.State}`);
        }
      } catch (error) { console.error("Pincode API error:", error); }
      finally { setIsFetchingPincode(false); }
    }
  };

  const detectLocation = () => {
    setIsLocating(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const API_KEY = "pk.23868e37dd6c553082504b74192359c2";

          // 🔥 STEP 1: Get address from LocationIQ
          const locRes = await fetch(
            `https://us1.locationiq.com/v1/reverse.php?key=${API_KEY}&lat=${latitude}&lon=${longitude}&format=json`
          );
          const locData = await locRes.json();

          if (locData.error) throw new Error(locData.error);

          const addr = locData.address || {};

          // 🔥 STEP 2: Extract pincode
          const pincode = addr.postcode || "";

          let finalCity = "";
          let finalState = "";

          // 🔥 STEP 3: Verify using PINCODE API (VERY IMPORTANT)
          if (pincode) {
            try {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
              const pinRes = await fetch(`${API_URL}/api/pincode/${pincode}`);
              const pinData = await pinRes.json();

              if (pinData[0].Status === "Success") {
                const post = pinData[0].PostOffice[0];
                finalCity = post.District;
                finalState = post.State;
              }
            } catch (err) {
              console.log("Pincode fallback failed");
            }
          }

          // 🔥 STEP 4: Clean wrong values
          const blacklist = ["Puduchcheri"];

          const clean = (val) => {
            if (!val) return null;
            return blacklist.includes(val) ? null : val;
          };

          // 🔥 STEP 5: Smart address builder
          const addressParts = [
            clean(addr.house_number),
            clean(addr.road),
            clean(addr.suburb || addr.neighbourhood || addr.residential),
            clean(addr.hamlet || addr.village),
            clean(addr.town || addr.city),
          ].filter(Boolean);

          const finalAddress = addressParts.join(", ");

          // 🔥 STEP 6: Final fallback system
          setFormData((prev) => ({
            ...prev,
            address: finalAddress || locData.display_name || "",
            city:
              finalCity ||
              addr.city ||
              addr.town ||
              addr.village ||
              "Pudukkottai",
            state: finalState || addr.state || "Tamil Nadu",
            zipCode: pincode,
          }));

          toast.success("Location detected accurately!");
        } catch (error) {
          console.error(error);
          toast.error("Failed to detect location");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        toast.error("Location permission denied");
        setIsLocating(false);
      }
    );
  };
  useEffect(() => {
    if (!authLoading) {
      setIsCheckingAuth(false);
    }
  }, [authLoading, user, navigate]);



  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue = 'Payment in progress! Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isProcessing]);

  useEffect(() => {
    if (isProcessing) {
      const handlePopState = (e) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        toast.warning('Please complete the payment first before leaving the page!');
      };
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isProcessing]);

  useEffect(() => {
    // If cart is empty, redirect to cart
    if (cartItems.length === 0 && !isCheckingAuth) {
      navigate('/cart');
    }
  }, [cartItems, navigate, isCheckingAuth]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Redirect to order success page after successful payment
  useEffect(() => {
    if (paymentSuccess) {
      const phone = formData.phone;
      navigate(`/order-success?phone=${encodeURIComponent(phone)}`, { replace: true });
    }
  }, [paymentSuccess, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) { toast.error("Please agree to the terms"); return; }

    setIsProcessing(true);

    const res = await loadRazorpay();
    if (!res) {
      toast.error('Razorpay failed to load');
      setIsProcessing(false);
      return;
    }

    try {
      const orderConfig = { headers: { 'Content-Type': 'application/json', Authorization: user ? `Bearer ${user.token}` : undefined } };

      let order, razorpayOrder;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      // Always create new order from cart
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id,
          qty: Number(item.qty) || 1
        })),
        shippingAddress: {
          fullName: formData.fullName || '',
          address: formData.address || '',
          city: formData.city || '',
          state: formData.state || '',
          zipCode: formData.zipCode || '',
          country: 'India',
          phone: formData.phone || '',
          altPhone: formData.altPhone || '',
email: user?.email || formData.email || ''
        },
        paymentMethod: 'Razorpay',
        shippingCharge: shippingCharge
      };
      const { data } = await axios.post(`${API_URL}/api/orders`, orderData, orderConfig);
      order = data.order;
      razorpayOrder = data.razorpayOrder;

      const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SZN5DY7IbG1LzA';

      const options = {
        key: RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Reverse Rituals',
        description: 'Payment for your hair transformation',
        order_id: razorpayOrder.id,
        handler: async (response) => {

          setIsProcessing(true);
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            console.log('Verifying payment for order:', order._id);

            const verifyRes = await axios.post(`${API_URL}/api/orders/verify`, { ...response, orderId: order._id });
            console.log('Verify response:', verifyRes.data);

            if (verifyRes.data.message === "Payment verified successfully" || verifyRes.data.order?.isPaid) {
              toast.success('Payment Successful!');
              clearCart();
              localStorage.removeItem('repay_order');
              localStorage.setItem('latestOrder', JSON.stringify({
                ...order,
                isPaid: true,
                shippingAddress: order.shippingAddress,
                totalPrice: order.totalPrice,
                orderItems: order.orderItems
              }));
              setPaymentSuccess(true);
              return;
            } else {
              console.log('Verify failed:', verifyRes.data.message);
              toast.error(verifyRes.data.message || 'Verification failed');
            }
          } catch (err) {
            console.error('Verify error:', err);
            toast.error('Payment verification failed: ' + (err.response?.data?.message || err.message));
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        },
        prefill: { name: formData.fullName, email: user?.email || '', contact: formData.phone },
        theme: { color: '#064e3b' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
      setIsProcessing(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'address') {
      value = value.replace(/(^|\s)([a-z])/g, (match, space, letter) => space + letter.toUpperCase());
    }
    setFormData({ ...formData, [name]: value });
  };

  return (
    authLoading || isCheckingAuth ? (
      <div className="min-h-screen bg-[#fdfbf7] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#064e3b]/60 font-medium">Preparing your ritual...</p>
        </div>
      </div>
    ) : (
      <div className="min-h-screen bg-[#fdfbf7] pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <Link to="/cart" className="inline-flex items-center gap-2 text-[#064e3b]/50 hover:text-[#064e3b] mb-6 font-bold text-xs uppercase tracking-[0.2em] transition-colors">
              <ArrowLeft size={14} /> Back to selection
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-[#c5a059] font-black uppercase tracking-[0.4em] text-[10px] mb-3 block">Final Step</span>
                <h1 className="text-3xl md:text-6xl font-black text-[#064e3b] leading-tight">Secure <span className="text-[#c5a059]">Checkout</span></h1>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#064e3b]/5 shadow-sm">
                   <Lock size={14} className="text-green-600" />
                   <span className="text-[10px] font-black text-[#064e3b] uppercase tracking-widest">SSL Encrypted</span>
                 </div>
                 <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#064e3b]/5 shadow-sm">
                   <ShieldCheck size={14} className="text-[#c5a059]" />
                   <span className="text-[10px] font-black text-[#064e3b] uppercase tracking-widest">Verified</span>
                 </div>
              </div>
            </div>
          </div>

          <form id="checkout-form" onSubmit={handlePayment}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Form Fields */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-8">
                {/* Contact Info */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-[#064e3b]/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#064e3b]/5 rounded-bl-[3rem]"></div>
                  
                  <h3 className="text-xl font-black text-[#064e3b] mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#064e3b] text-white rounded-xl flex items-center justify-center">
                      <User size={20} />
                    </div>
                    Contact Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest ml-1">Full Name</label>
                      <input type="text" required name="fullName" value={formData.fullName} onChange={handleChange}
                        className="w-full px-6 py-4 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-2xl focus:outline-none focus:border-[#c5a059] font-medium text-[#064e3b] transition-all" placeholder="Enter your full name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest ml-1">Email {user ? '(Linked)' : '(Optional)'}</label>
                      {user?.email ? (
                        <div className="w-full px-6 py-4 bg-gray-100 border border-transparent rounded-2xl text-[#064e3b]/40 font-medium flex items-center gap-2">
                          {user.email} <CheckCircle2 size={14} className="text-green-500" />
                        </div>
                      ) : (
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange}
                          className="w-full px-6 py-4 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-2xl focus:outline-none focus:border-[#c5a059] font-medium text-[#064e3b] transition-all" placeholder="your@email.com" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest ml-1">Primary Phone</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#064e3b]/40 font-bold">+91</span>
                        <input type="tel" required name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="w-full pl-16 pr-6 py-4 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-2xl focus:outline-none focus:border-[#c5a059] font-medium text-[#064e3b] transition-all" placeholder="00000 00000" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest ml-1">Alternate Phone</label>
                      <input type="tel" name="altPhone" value={formData.altPhone || ''} onChange={(e) => setFormData({ ...formData, altPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full px-6 py-4 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-2xl focus:outline-none focus:border-[#c5a059] font-medium text-[#064e3b] transition-all" placeholder="Secondary number" />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-[#064e3b]/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c5a059]/5 rounded-bl-[3rem]"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <h3 className="text-xl font-black text-[#064e3b] flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#c5a059] text-white rounded-xl flex items-center justify-center">
                        <MapPin size={20} />
                      </div>
                      Shipping Address
                    </h3>
                    <button type="button" onClick={detectLocation} disabled={isLocating}
                      className="px-6 py-3 bg-[#064e3b]/5 text-[#064e3b] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#064e3b] hover:text-white transition-all flex items-center gap-3 active:scale-95">
                      {isLocating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                      {isLocating ? 'Detecting...' : 'Auto Detect'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest ml-1">Street & House Details</label>
                      <textarea required name="address" value={formData.address} onChange={handleChange} rows={3}
                        className="w-full px-6 py-4 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-2xl focus:outline-none focus:border-[#c5a059] font-medium text-[#064e3b] transition-all resize-none" placeholder="Door No, Floor, Building Name, Street Name" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest ml-1">Pincode</label>
                        <div className="relative">
                          {isFetchingPincode && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c5a059] animate-spin" />}
                          <input type="text" required name="zipCode" value={formData.zipCode} onChange={handlePincodeChange} maxLength={6}
                            className="w-full px-6 py-4 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-2xl focus:outline-none focus:border-[#c5a059] font-bold text-[#064e3b] tracking-[0.2em] transition-all" placeholder="600001" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest ml-1">State</label>
                        <select required name="state" value={formData.state} onChange={handleChange}
                          className="w-full px-6 py-4 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-2xl focus:outline-none focus:border-[#c5a059] font-medium text-[#064e3b] transition-all appearance-none cursor-pointer">
                          <option value="">Select State</option>
                          {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-widest ml-1">City / District</label>
                        <input type="text" required name="city" value={formData.city} onChange={handleChange}
                          className="w-full px-6 py-4 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-2xl focus:outline-none focus:border-[#c5a059] font-medium text-[#064e3b] transition-all" placeholder="Enter city" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-4 p-6 bg-white rounded-3xl border border-[#064e3b]/5 shadow-sm">
                  <div className="relative flex items-center">
                    <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-6 h-6 rounded-lg accent-[#064e3b] cursor-pointer" />
                  </div>
                  <label htmlFor="terms" className="text-xs text-[#064e3b]/60 leading-relaxed font-medium">
                    I agree to the <span className="text-[#064e3b] font-black underline cursor-pointer">Terms of Service</span> and acknowledge the <span className="text-[#064e3b] font-black underline cursor-pointer">Privacy Policy</span>. By checking this, I confirm my order details are correct.
                  </label>
                </div>

                  </div>
                </div>
              </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-5 sticky top-28">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-[#064e3b]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-bl-[5rem]"></div>
                
                <h3 className="text-lg md:text-2xl font-black text-[#064e3b] mb-6 md:mb-8 flex items-center gap-3 relative">
                  <Package size={24} className="text-[#c5a059]" /> 
                  Selection Summary
                </h3>

                <div className="space-y-4 mb-8 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#064e3b]/10 relative">
                  {displayItems.map((item, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx} 
                      className="flex items-center gap-4 p-4 bg-[#fdfbf7] rounded-2xl border border-[#064e3b]/5 group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#064e3b]/10 shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[#064e3b] text-sm truncate">{item.name}</p>
                        <p className="text-[#064e3b]/40 text-[10px] font-black uppercase tracking-widest mt-1">Quantity: {item.qty} Rituals</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#064e3b] text-sm block">₹{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-[#064e3b]/10 relative">
                  <div className="flex justify-between text-[#064e3b]/60">
                    <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                    <span className="font-black text-[#064e3b]">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#064e3b]/60">
                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Truck size={14} className="text-[#c5a059]" /> Shipping Fee
                    </span>
                    <span className={`font-black ${shippingCharge === 0 ? 'text-green-600' : 'text-[#064e3b]'}`}>
                      {shippingCharge === 0 ? 'COMPLIMENTARY' : `₹${shippingCharge}`}
                    </span>
                  </div>
                  
                  {formData.state && (
                    <div className={`p-3 rounded-xl text-[10px] font-black text-center uppercase tracking-widest ${shippingCharge === 0 ? 'bg-green-50 text-green-600' : 'bg-[#c5a059]/10 text-[#c5a059]'}`}>
                      {shippingCharge === 0 ? 'Free Shipping Active for your location' : `₹${shippingCharge} Shipping for ${formData.state}`}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t border-[#064e3b]/10 mb-8">
                    <div>
                      <span className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.3em] block mb-1">Final Amount</span>
                      <p className="text-[9px] text-[#064e3b]/30 font-bold uppercase tracking-widest">Incl. all taxes & rituals</p>
                    </div>
                    <span className="text-2xl md:text-4xl font-black text-[#c5a059] tracking-tighter">₹{finalTotal.toLocaleString()}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-5 md:py-6 bg-[#064e3b] text-white rounded-2xl font-black text-base md:text-xl hover:bg-[#c5a059] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-[#064e3b]/30 active:scale-95 disabled:opacity-70 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
                    {isProcessing ? (
                      <><Loader2 size={24} className="animate-spin" /> Verifying...</>
                    ) : (
                      <><CreditCard size={24} /> Pay ₹{finalTotal.toLocaleString()}</>
                    )}
                  </button>
                </div>

                <div className="mt-10 pt-10 border-t border-[#064e3b]/5 text-center">
                   <div className="flex items-center justify-center gap-2 mb-6">
                      <ShieldCheck size={16} className="text-[#c5a059]" />
                      <span className="text-[9px] font-black text-[#064e3b]/40 uppercase tracking-[0.3em]">Encrypted Checkout</span>
                   </div>
                   <div className="flex items-center justify-center gap-4 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                      <img src={new URL('../assets/GPAY.jpeg', import.meta.url).href} alt="GPay" className="h-5" />
                      <img src={new URL('../assets/PAYTYM.jpeg', import.meta.url).href} alt="Paytm" className="h-5" />
                      <img src={new URL('../assets/PHONEPE.png', import.meta.url).href} alt="PhonePe" className="h-5" />
                   </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default CheckoutPage;