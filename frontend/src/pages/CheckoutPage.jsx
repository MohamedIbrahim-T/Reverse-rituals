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
    if (!authLoading && !user) {
      navigate('/login?redirect=/checkout');
    } else if (!authLoading && user) {
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

  // Redirect to orders page after successful payment
  useEffect(() => {
    if (paymentSuccess) {
      navigate('/orders', { replace: true });
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
          email: user?.email || ''
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
          <p className="text-[#064e3b]/60">Please wait...</p>
        </div>
      </div>
    ) : (
      <div className="min-h-screen bg-[#fdfbf7] pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Link to="/cart" className="inline-flex items-center gap-2 text-[#064e3b]/50 hover:text-[#064e3b] mb-6 font-medium text-sm">
            <ArrowLeft size={16} /> Back to Cart
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[#c5a059] font-bold uppercase tracking-[0.3em] text-xs mb-2 block">Complete Purchase</span>
              <h1 className="text-3xl md:text-5xl font-black text-[#064e3b]">Secure <span className="text-[#c5a059]">Checkout</span></h1>
            </div>
            <div className="flex items-center gap-2 text-[#064e3b]/50 text-sm">
              <Lock size={16} /> SSL Encrypted
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Contact Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#064e3b]/5">
                  <h3 className="text-lg font-black text-[#064e3b] mb-5 flex items-center gap-2">
                    <User size={20} className="text-[#c5a059]" /> Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-[#064e3b]/60 ml-1 mb-2 block">Full Name</label>
                      <input type="text" required name="fullName" value={formData.fullName} onChange={handleChange}
                        className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" placeholder="Enter your name" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#064e3b]/60 ml-1 mb-2 block">Email</label>
                      <input type="email" value={user?.email || ''} readOnly
                        className="w-full px-5 py-3 bg-[#e8e8e8] border border-[#064e3b]/10 rounded-xl text-[#064e3b]/50 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#064e3b]/60 ml-1 mb-2 block">Phone Number</label>
                      <input type="tel" required name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" placeholder="10-digit number" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#064e3b]/60 ml-1 mb-2 block">Alternate Phone (Optional)</label>
                      <input type="tel" name="altPhone" value={formData.altPhone || ''} onChange={(e) => setFormData({ ...formData, altPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" placeholder="Alternate number" />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#064e3b]/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <h3 className="text-lg font-black text-[#064e3b] flex items-center gap-2">
                      <MapPin size={20} className="text-[#c5a059]" /> Shipping Address
                    </h3>
                    <button type="button" onClick={detectLocation} disabled={isLocating}
                      className="px-4 py-2 bg-[#064e3b]/5 text-[#064e3b] rounded-xl font-bold text-sm hover:bg-[#064e3b] hover:text-white transition-all flex items-center gap-2">
                      {isLocating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                      {isLocating ? '...' : 'Detect'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-[#064e3b]/60 ml-1 mb-2 block">Street Address</label>
                      <textarea required name="address" value={formData.address} onChange={handleChange} rows={2}
                        className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" placeholder="House No, Building, Street, Area" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-sm font-bold text-[#064e3b]/60 ml-1 mb-2 block">Pincode</label>
                        <div className="relative">
                          {isFetchingPincode && <Loader2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5a059] animate-spin" />}
                          <input type="text" required name="zipCode" value={formData.zipCode} onChange={handlePincodeChange} maxLength={6}
                            className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059] pl-10" placeholder="6 digits" />
                        </div>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-sm font-bold text-[#064e3b]/60 ml-1 mb-2 block">State</label>
                        <select required name="state" value={formData.state} onChange={handleChange}
                          className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]">
                          <option value="">Select</option>
                          {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-sm font-bold text-[#064e3b]/60 ml-1 mb-2 block">City</label>
                        <input type="text" required name="city" value={formData.city} onChange={handleChange}
                          className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" placeholder="Enter city" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 p-4 bg-[#fdfbf7] rounded-xl">
                  <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 mt-1 accent-[#064e3b]" />
                  <label htmlFor="terms" className="text-sm text-[#064e3b]/60">
                    I agree to the <span className="text-[#064e3b] font-bold underline">Terms & Conditions</span> and <span className="text-[#064e3b] font-bold underline">Privacy Policy</span>
                  </label>
                </div>

                {/* Save Address Buttons */}
                <div className="flex flex-wrap gap-3">
                  {hasSavedAddress && (
                    <button type="button" onClick={handleUseSavedAddress}
                      className="px-5 py-2.5 bg-[#c5a059]/10 text-[#c5a059] rounded-xl font-bold text-sm hover:bg-[#c5a059] hover:text-white transition-all">
                      Use Saved Address
                    </button>
                  )}
                  <button type="button" onClick={handleSaveAddress}
                    className="px-5 py-2.5 bg-[#064e3b] text-white rounded-xl font-bold text-sm hover:bg-[#053d2f] transition-all">
                    Save Address
                  </button>
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-5 bg-[#064e3b] text-white rounded-2xl font-bold hover:bg-[#c5a059] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <><Loader2 size={24} className="animate-spin" /> Processing Ritual...</>
                  ) : (
                    <><CreditCard size={24} /> Pay ₹{finalTotal.toLocaleString()}</>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#064e3b]/5 sticky top-24">
                <h3 className="text-lg font-black text-[#064e3b] mb-5 flex items-center gap-2">
                  <Package size={20} className="text-[#c5a059]" /> Order Summary
                </h3>

                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {displayItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-[#fdfbf7] rounded-xl">
                      {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#064e3b] text-sm truncate">{item.name}</p>
                        <p className="text-[#064e3b]/40 text-xs">Qty: {item.qty} × ₹{item.price}</p>
                      </div>
                      <span className="font-bold text-[#064e3b] text-sm">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-[#064e3b]/10">
                  <div className="flex justify-between text-[#064e3b]/60">
                    <span>Subtotal</span>
                    <span className="font-bold">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-[#064e3b]/60">
                    <span className="flex items-center gap-2"><Truck size={14} /> Shipping</span>
                    <span className={`font-black ${shippingCharge === 0 ? 'text-green-600' : ''}`}>
                      {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                    </span>
                  </div>
                  {shippingCharge > 0 && formData.state && (
                    <p className="text-[10px] text-[#c5a059] font-medium">
                      Shipping charges for {formData.state}: {shippingCharge === 49 ? '₹49 ' : '₹99 '}
                    </p>
                  )}
                  {shippingCharge === 0 && formData.state && (
                    <p className="text-[10px] text-green-600 font-medium">Free shipping for Tamil Nadu!</p>
                  )}
                  {!formData.state && (
                    <p className="text-[10px] text-[#c5a059] font-medium">Select state to see shipping charges</p>
                  )}

                  <div className="flex justify-between pt-3 border-t border-[#064e3b]/10">
                    <span className="font-bold text-[#064e3b]">Total</span>
                    <span className="text-xl font-black text-[#c5a059]">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#c5a059]/5 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="text-[#c5a059] mt-1" size={20} />
                  <div>
                    <p className="font-bold text-[#064e3b] text-sm">Secure Payment</p>
                    <p className="text-[#064e3b]/40 text-xs">Your payment is secured by Razorpay</p>
                  </div>
                </div>

                {/* Payment Method Logos */}
                <div className="mt-4 pt-4 border-t border-[#064e3b]/10">
                  <p className="text-center text-[#064e3b]/40 text-xs mb-3">Accepting all UPI apps</p>
                  <div className="flex items-center justify-center gap-3">
                    <img src="/GPAY.jpeg" alt="Google Pay" className="h-6 w-auto" />
                    <img src="/PAYTYM.jpeg" alt="Paytm" className="h-6 w-auto" />
                    <img src="/PHONEPE.png" alt="PhonePe" className="h-6 w-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default CheckoutPage;