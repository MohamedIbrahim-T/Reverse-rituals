import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag, Package, Truck, CheckCircle, Trash2, Edit3, Plus, X,
  DollarSign, Users, BarChart3, Calendar, Search, Home, Settings,
  LogOut, Bell, Menu, ChevronRight, Image, CreditCard, MapPin, Phone, Mail, Download, FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [exportDate, setExportDate] = useState('');
  const [exportFromDate, setExportFromDate] = useState('');
  const [exportToDate, setExportToDate] = useState('');
  const [formData, setFormData] = useState({
    name: '', price: '', description: '', image: '', category: '', countInStock: '',
  });

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      // Fetch products from backend only (no frontend fallback)
      let productsRes = { data: [] };
      try {
        productsRes = await axios.get(`${API_URL}/api/products`);
      } catch (err) {
        console.log('Products fetch error:', err.message);
      }

      setProducts(productsRes.data || []);

      // Try to get orders if user is logged in
      let ordersRes = { data: [] };
      if (user?.token) {
        try {
          ordersRes = await axios.get(`${API_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        } catch (err) {
          console.log('Orders fetch error:', err.message);
        }
      }
      setOrders(ordersRes.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setProducts([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(`${API_URL}/api/orders/${id}/deliver`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Order marked as delivered!');
      fetchData();
    } catch (error) {
      console.error('Deliver error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        await axios.delete(`${API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        toast.success('Order deleted!');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const handlePacking & Processing = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(`${API_URL}/api/orders/${id}/status`, { status: 'Packing & Processing' }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Order marked as Packing & Processing!');
      fetchData();
    } catch (error) {
      console.error('Packing & Processing error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleShipping = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(`${API_URL}/api/orders/${id}/status`, { status: 'Shipped' }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Order marked as Shipped!');
      fetchData();
    } catch (error) {
      console.error('Shipping error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

const downloadThermalBill = async (order) => {
    const html2pdf = (await import('html2pdf.js')).default;

    const thermal = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin:0;padding:20px;font-family:monospace;font-size:12px;color:#000000;width:4in;background:#fff;">
      <div style="width:3.6in;margin:0 auto;color:#000000;">
        <!-- HEADER -->
        <div style="text-align:center;border-bottom:1px dashed #000000;padding-bottom:10px;margin-bottom:10px;">
          <div style="font-size:16px;font-weight:bold;color:#000000;">REVERSE RITUALS</div>
          <div style="font-size:11px;color:#000000;">Natural Hair Care Products</div>
        </div>
        
        <!-- ORDER INFO -->
        <div style="margin-bottom:10px;color:#000000;">
          <div><b>Order:</b> #${order._id.toString().slice(-8).toUpperCase()}</div>
          <div><b>Date:</b> ${new Date(order.createdAt).toLocaleDateString('en-IN')} ${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        
        <div style="border-top:1px dashed #000000;border-bottom:1px dashed #000000;padding:8px 0;margin:8px 0;">
          <div style="font-weight:bold;color:#000000;">DELIVER TO:</div>
        </div>
        
        <!-- CUSTOMER -->
        <div style="margin-bottom:10px;color:#000000;">
          <div style="font-weight:bold;">${order.shippingAddress.fullName}</div>
          <div>${order.shippingAddress.address}</div>
          <div>${order.shippingAddress.city}, ${order.shippingAddress.state}</div>
          <div>PIN: ${order.shippingAddress.zipCode}</div>
          <div>Phone: ${order.shippingAddress.phone}</div>
          ${order.shippingAddress.altPhone ? `<div>Alt Phone: ${order.shippingAddress.altPhone}</div>` : ''}
        </div>
        
        <div style="border-top:1px dashed #000000;padding:8px 0;margin:8px 0;">
          <div style="font-weight:bold;color:#000000;">ITEMS (${order.orderItems.length}):</div>
        </div>
        
        <!-- ITEMS (NO PRICE) -->
        <div style="margin-bottom:10px;color:#000000;">
          ${order.orderItems.map(item => `
            <div style="display:flex;justify-content:space-between;padding:3px 0;">
              <span>${item.name}</span>
              <span>x${item.qty}</span>
            </div>
          `).join('')}
        </div>
        
        <div style="border-top:1px dashed #000000;margin:10px 0;padding-top:10px;">
          <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:bold;color:#000000;">
            <span>Total Items:</span>
            <span>${order.orderItems.reduce((sum, item) => sum + item.qty, 0)}</span>
          </div>
        </div>
        
        <div style="border-top:1px dashed #000000;margin-top:10px;padding-top:10px;text-align:center;font-size:10px;color:#000000;">
          <div>Thank you for your order!</div>
          <div>support@reverserituals.com</div>
        </div>
      </div>
    </body>
    </html>
    `;

    const element = document.createElement('div');
    element.innerHTML = thermal;

    const opt = {
      margin: 0,
      filename: `bill-${order._id.toString().slice(-8).toUpperCase()}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: [4, 6], orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  const downloadAllThermalBills = async () => {
    const html2pdf = (await import('html2pdf.js')).default;

    let filtered = orders;

    if (exportDate) {
      filtered = orders.filter(
        o => new Date(o.createdAt).toDateString() === new Date(exportDate).toDateString()
      );
    } else if (exportFromDate && exportToDate) {
      const from = new Date(exportFromDate);
      const to = new Date(exportToDate);
      to.setHours(23, 59, 59, 999);
      filtered = orders.filter(o => new Date(o.createdAt) >= from && new Date(o.createdAt) <= to);
    }

    // Filter only PAID orders
    const paidOrders = filtered.filter(o => o.isPaid);

    if (paidOrders.length === 0) {
      toast.error('No PAID orders found for selected date');
      return;
    }

    let allBills = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:20px;font-family:monospace;font-size:12px;color:#000000;background:#fff;">`;

    paidOrders.forEach(order => {
      allBills += `
      <div style="width:3.6in;min-height:5in;margin:0 auto;page-break-after:always;padding-bottom:25px;color:#000000;">
        
        <div style="text-align:center;border-bottom:1px dashed #000000;padding-bottom:10px;margin-bottom:10px;">
          <div style="font-size:16px;font-weight:bold;color:#000000;">REVERSE RITUALS</div>
          <div style="font-size:11px;color:#000000;">Natural Hair Care Products</div>
        </div>
        
        <div style="margin-bottom:8px;color:#000000;">
          <b>Order:</b> #${order._id.toString().slice(-8).toUpperCase()} | <b>Date:</b> ${new Date(order.createdAt).toLocaleDateString('en-IN')}
        </div>
        
        <div style="border-top:1px dashed #000000;border-bottom:1px dashed #000000;padding:6px 0;margin:6px 0;">
          <b style="color:#000000;">DELIVER TO:</b>
        </div>
        
        <div style="margin-bottom:8px;font-size:11px;color:#000000;">
          <b>${order.shippingAddress.fullName}</b><br/>
          ${order.shippingAddress.address}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br/>
          📞 ${order.shippingAddress.phone}
          ${order.shippingAddress.altPhone ? `<br/>Alt: ${order.shippingAddress.altPhone}` : ''}
        </div>
        
        <div style="border-top:1px dashed #000000;padding:6px 0;margin:6px 0;">
          <b style="color:#000000;">ITEMS (${order.orderItems.length}):</b>
        </div>
        
        ${order.orderItems.map(item => `
          <div style="display:flex;justify-content:space-between;padding:2px 0;font-size:11px;color:#000000;">
            <span>${item.name}</span>
            <span>x${item.qty}</span>
          </div>
        `).join('')}
        
        <div style="border-top:1px dashed #000000;margin-top:8px;padding-top:6px;font-size:11px;color:#000000;">
          <b>Total Items:</b> ${order.orderItems.reduce((sum, item) => sum + item.qty, 0)}
        </div>
        
        <div style="border-top:1px dashed #000000;margin-top:8px;padding-top:8px;text-align:center;font-size:10px;color:#000000;">
          Thank you! | support@reverserituals.com
        </div>
      </div>`;
    });

    allBills += '</body></html>';

    const element = document.createElement('div');
    element.innerHTML = allBills;

    const opt = {
      margin: 0,
      filename: `bills-${new Date().toISOString().slice(0, 10)}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: [4, 6], orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
    toast.success(`${paidOrders.length} PAID bills generated`);
  };

  const handleBulkStatusChange = async (status) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      let filtered = orders;

      if (exportDate) {
        filtered = orders.filter(
          o => new Date(o.createdAt).toDateString() === new Date(exportDate).toDateString()
        );
      } else if (exportFromDate && exportToDate) {
        const from = new Date(exportFromDate);
        const to = new Date(exportToDate);
        to.setHours(23, 59, 59, 999);
        filtered = orders.filter(
          o => new Date(o.createdAt) >= from && new Date(o.createdAt) <= to
        );
      }

      if (filtered.length === 0) {
        toast.error('No orders for selected date');
        return;
      }

      await Promise.all(
        filtered.map(order => {
          if (status === 'Delivered') {
            return axios.put(`${API_URL}/api/orders/${order._id}/deliver`, {}, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
          } else {
            return axios.put(
              `${API_URL}/api/orders/${order._id}/status`,
              { status: status },
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
          }
        })
      );

      toast.success(`Updated ${filtered.length} orders`);
      fetchData();
    } catch (error) {
      toast.error('Bulk update failed');
    }
  };

  const downloadInvoice = async (order) => {
    const html2pdf = (await import('html2pdf.js')).default;

    const printContent = `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; background: #fff;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #064e3b;">
      <div style="font-size: 28px; font-weight: bold; color: #064e3b;">Reverse Rituals</div>
      <div style="font-size: 24px; color: #333; font-weight: bold;">INVOICE</div>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; width: 48%;">
        <h4 style="margin: 0 0 10px; color: #064e3b; font-size: 14px; text-transform: uppercase;">Order Details</h4>
        <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Order ID:</strong> ${order._id.toString().slice(-8).toUpperCase()}</p>
        <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Status:</strong> <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${order.isPaid ? '#dcfce7' : '#fee2e2'}; color: ${order.isPaid ? '#166534' : '#991b1b'};">${order.isPaid ? 'PAID' : 'UNPAID'}</span></p>
      </div>
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; width: 48%;">
        <h4 style="margin: 0 0 10px; color: #064e3b; font-size: 14px; text-transform: uppercase;">Payment Info</h4>
        <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Method:</strong> ${order.paymentMethod || 'Razorpay'}</p>
        <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Payment ID:</strong> ${order.paymentResult?.razorpay_payment_id || 'N/A'}</p>
      </div>
    </div>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <h4 style="margin: 0 0 15px; color: #064e3b; font-size: 14px; text-transform: uppercase;">Customer Details</h4>
      <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Name:</strong> ${order.shippingAddress?.fullName || 'N/A'}</p>
      <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Address:</strong> ${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.zipCode || ''}</p>
      <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}${order.shippingAddress?.altPhone ? ', ' + order.shippingAddress.altPhone : ''}</p>
      <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Email:</strong> ${order.shippingAddress?.email || 'N/A'}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr>
          <th style="background: #064e3b; color: white; padding: 12px; text-align: left; font-size: 13px;">Product</th>
          <th style="background: #064e3b; color: white; padding: 12px; text-align: left; font-size: 13px;">Qty</th>
          <th style="background: #064e3b; color: white; padding: 12px; text-align: left; font-size: 13px;">Price</th>
          <th style="background: #064e3b; color: white; padding: 12px; text-align: left; font-size: 13px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.orderItems.map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px;">${item.qty}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px;">₹${item.price}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px;">₹${item.price * item.qty}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="text-align: right; padding: 20px; background: #f0fdf4; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px; color: #666;">Grand Total</p>
      <p style="font-size: 24px; font-weight: bold; color: #064e3b;">₹${order.totalPrice}</p>
    </div>

    <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee;">
      <p>Thank you for your order!</p>
      <p>Reverse Rituals - Natural Hair Care Products</p>
      <p>support@reverserituals.com</p>
    </div>
  </div>`;

    const element = document.createElement('div');
    element.innerHTML = printContent;

    const opt = {
      margin: 0,
      filename: `label-${order._id}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: 'in',
        format: [4, 10], // IMPORTANT: bigger height → no blank cut issue
        orientation: 'portrait'
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        await axios.delete(`${API_URL}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        toast.success('Product deleted!');
        fetchData();
      } catch (error) {
        toast.error('Deletion failed');
      }
    }
  };

  const exportOrdersToExcel = () => {
    let filtered = orders;

    // Filter by single date
    if (exportDate) {
      const selectedDate = new Date(exportDate).toDateString();
      filtered = orders.filter(order => new Date(order.createdAt).toDateString() === selectedDate);
    }

    // Filter by date range
    if (exportFromDate && exportToDate) {
      const fromDate = new Date(exportFromDate);
      const toDate = new Date(exportToDate);
      toDate.setHours(23, 59, 59, 999); // Include full end day
      filtered = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }

    if (filtered.length === 0) {
      toast.error('No orders found for selected date range');
      return;
    }

    const csvContent = [
      ['Order ID', 'Date', 'Time', 'Customer Name', 'Address', 'City', 'State', 'Pincode', 'Phone', 'Alt Phone', 'Email', 'Products', 'Total', 'Payment', 'Delivery Status'],
      ...filtered.map(order => [
        order._id.toString().slice(-8).toUpperCase(),
        new Date(order.createdAt).toLocaleDateString('en-IN'),
        new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        order.shippingAddress.fullName,
        order.shippingAddress.address,
        order.shippingAddress.city,
        order.shippingAddress.state,
        order.shippingAddress.zipCode,
        order.shippingAddress.phone,
        order.shippingAddress.altPhone || '',
        order.shippingAddress.email || '',
        order.orderItems.map(item => `${item.name} (x${item.qty})`).join(', '),
        order.totalPrice,
        order.isPaid ? 'Paid' : 'Unpaid',
        order.isDelivered ? 'Delivered' : (order.isPaid ? 'Shipped' : 'Packing & Processing'),
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    let fileName = 'all-orders.csv';
    if (exportDate) {
      fileName = `orders-${exportDate}.csv`;
    } else if (exportFromDate && exportToDate) {
      fileName = `orders-${exportFromDate}-to-${exportToDate}.csv`;
    }
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} orders!`);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (editingProduct) {
        await axios.put(`${API_URL}/api/products/${editingProduct._id}`, formData, config);
        toast.success('Product updated!');
      } else {
        await axios.post(`${API_URL}/api/products`, formData, config);
        toast.success('Product created!');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', description: '', image: '', category: '', countInStock: '' });
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, price: product.price, description: product.description,
      image: product.image, category: product.category, countInStock: product.countInStock,
    });
    setIsModalOpen(true);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => !o.isDelivered).length;
  const deliveredOrders = orders.filter(o => o.isDelivered).length;
  const lowStockProducts = products.filter(p => p.countInStock < 5).length;

  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = 
      order.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Date filter - single date
    if (exportDate) {
      const matchesDate = new Date(order.createdAt).toDateString() === new Date(exportDate).toDateString();
      return matchesSearch && matchesDate;
    }
    
    // Date filter - date range
    if (exportFromDate && exportToDate) {
      const from = new Date(exportFromDate);
      const to = new Date(exportToDate);
      to.setHours(23, 59, 59, 999);
      const matchesDateRange = new Date(order.createdAt) >= from && new Date(order.createdAt) <= to;
      return matchesSearch && matchesDateRange;
    }
    
    return matchesSearch;
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Overview' },
    { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders', badge: orders.length },
    { id: 'products', icon: <Package size={20} />, label: 'Products', badge: products.length },
    { id: 'customers', icon: <Users size={20} />, label: 'Customers' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#064e3b]/10 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#064e3b]/50 font-medium">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#064e3b]/10 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[#064e3b]/5 rounded-xl">
          <Menu size={24} className="text-[#064e3b]" />
        </button>
        <h1 className="text-lg font-black text-[#064e3b]">Admin</h1>
        <div className="w-9 h-9 bg-[#c5a059] rounded-full flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.charAt(0)}
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-[#064e3b]">Admin</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2"><X size={24} className="text-[#064e3b]/50" /></button>
              </div>
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === item.id ? 'bg-[#064e3b] text-white' : 'text-[#064e3b]/60 hover:bg-[#064e3b]/5'
                      }`}
                  >
                    {item.icon}
                    {item.label}
                    {item.badge && (
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${activeTab === item.id ? 'bg-white/20' : 'bg-[#064e3b]/10'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-4 px-5 py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all mt-4">
                <LogOut size={20} /> Logout
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-[#064e3b]/10 flex-col">
        <div className="p-8">
          <h2 className="text-3xl font-black text-[#064e3b]">Admin</h2>
          <p className="text-[#064e3b]/40 text-sm mt-1">Dashboard</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-[#064e3b] text-white shadow-lg shadow-[#064e3b]/20' : 'text-[#064e3b]/60 hover:bg-[#064e3b]/5'
                }`}
            >
              {item.icon}
              {item.label}
              {item.badge && (
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${activeTab === item.id ? 'bg-white/20' : 'bg-[#064e3b]/10'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#064e3b]/10">
          <div className="flex items-center gap-4 p-4 bg-[#fdfbf7] rounded-2xl mb-4">
            <div className="w-12 h-12 bg-[#c5a059] rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#064e3b] truncate">{user?.name}</p>
              <p className="text-[#064e3b]/40 text-sm truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-5 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 pt-20 lg:pt-0">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
            {[
              { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: 'bg-green-500' },
              { title: 'Total Orders', value: orders.length, icon: <ShoppingBag size={24} />, color: 'bg-blue-500' },
              { title: 'Pending', value: pendingOrders, icon: <Truck size={24} />, color: 'bg-yellow-500' },
              { title: 'Products', value: products.length, icon: <Package size={24} />, color: 'bg-purple-500' },
            ].map((stat, idx) => (
              <motion.div
                key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[1.5rem] p-5 lg:p-8 border border-[#064e3b]/5 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-[#064e3b]/40 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                <p className="text-2xl lg:text-3xl font-black text-[#064e3b]">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Delivered', value: deliveredOrders, color: 'bg-green-500', percent: orders.length ? (deliveredOrders / orders.length) * 100 : 0 },
              { label: 'Pending', value: pendingOrders, color: 'bg-yellow-500', percent: orders.length ? (pendingOrders / orders.length) * 100 : 0 },
              { label: 'Low Stock', value: lowStockProducts, color: 'bg-red-500', percent: products.length ? (lowStockProducts / products.length) * 100 : 0 },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-[1.5rem] p-5 border border-[#064e3b]/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#064e3b]/60">{item.label}</span>
                  <span className="text-xl font-black text-[#064e3b]">{item.value}</span>
                </div>
                <div className="h-2 bg-[#064e3b]/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#064e3b]/30" size={20} />
            <input
              type="text" placeholder={activeTab === 'products' ? 'Search products...' : 'Search orders...'}
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-[#064e3b]/10 rounded-2xl focus:outline-none focus:border-[#c5a059] text-[#064e3b] placeholder-[#064e3b]/30"
            />
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#064e3b]">
                {activeTab === 'dashboard' && 'Overview'}
                {activeTab === 'orders' && 'Orders'}
                {activeTab === 'products' && 'Products'}
                {activeTab === 'customers' && 'Customers'}
                {activeTab === 'settings' && 'Settings'}
              </h3>
              <p className="text-[#064e3b]/40 text-sm">
                {activeTab === 'dashboard' && 'Your store at a glance'}
                {activeTab === 'orders' && 'Manage customer orders'}
                {activeTab === 'products' && 'Manage product inventory'}
                {activeTab === 'customers' && 'View customer details'}
                {activeTab === 'settings' && 'Configure your store'}
              </p>
            </div>
            {activeTab === 'products' && (
              <button
                onClick={() => { setEditingProduct(null); setFormData({ name: '', price: '', description: '', image: '', category: '', countInStock: '' }); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-[#064e3b] text-white rounded-xl sm:rounded-2xl font-bold hover:bg-[#c5a059] transition-all text-sm"
              >
                <Plus size={18} /> <span className="hidden sm:inline">Add Product</span>
              </button>
            )}
          </div>

          {/* Content */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-[2rem] p-6 border border-[#064e3b]/5">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-[#064e3b]">Recent Orders</h4>
                  <button onClick={() => setActiveTab('orders')} className="text-[#c5a059] text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order._id} className="flex items-center gap-4 p-4 bg-[#fdfbf7] rounded-2xl hover:shadow-md transition-all cursor-pointer">
                      <div className="w-12 h-12 bg-[#064e3b]/10 rounded-xl flex items-center justify-center">
                        <ShoppingBag size={20} className="text-[#064e3b]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#064e3b] truncate">{order.shippingAddress.fullName}</p>
                        <p className="text-[#064e3b]/40 text-sm">{order.orderItems.length} items • ₹{order.totalPrice}</p>
                      </div>
                      <div>
                        {order.isDelivered ? (
                          <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">Delivered</span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-bold">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Products */}
              <div className="bg-white rounded-[2rem] p-6 border border-[#064e3b]/5">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-[#064e3b]">Low Stock Alert</h4>
                  <button onClick={() => setActiveTab('products')} className="text-[#c5a059] text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {products.filter(p => p.countInStock < 10).slice(0, 4).map((product) => (
                    <div key={product._id} className="flex items-center gap-4 p-4 bg-[#fdfbf7] rounded-2xl hover:shadow-md transition-all cursor-pointer">
                      <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#064e3b] truncate">{product.name}</p>
                        <p className="text-[#064e3b]/40 text-sm">₹{product.price}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${product.countInStock < 5 ? 'text-red-500' : 'text-yellow-500'}`}>
                          {product.countInStock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              {/* Export Section */}
              <div className="bg-white rounded-xl p-4 mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={20} className="text-[#064e3b]" />
                    <span className="font-bold text-[#064e3b]">Filter & Export</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(exportDate || exportFromDate || exportToDate) && (
                      <span className="text-xs text-[#c5a059] font-medium">
                        {filteredOrders.length} orders found
                      </span>
                    )}
                    <button
                      onClick={() => { setExportDate(''); setExportFromDate(''); setExportToDate(''); }}
                      className="px-3 py-1.5 text-xs text-[#064e3b]/40 hover:text-[#064e3b] border border-[#064e3b]/10 rounded-lg"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Single Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#064e3b]/60">Single Date</label>
                    <input
                      type="date"
                      value={exportDate}
                      onChange={(e) => { setExportDate(e.target.value); setExportFromDate(''); setExportToDate(''); }}
                      className="px-3 py-2 border border-[#064e3b]/10 rounded-lg text-sm focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  {/* From Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#064e3b]/60">From Date</label>
                    <input
                      type="date"
                      value={exportFromDate}
                      onChange={(e) => { setExportFromDate(e.target.value); setExportDate(''); }}
                      className="px-3 py-2 border border-[#064e3b]/10 rounded-lg text-sm focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  {/* To Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#064e3b]/60">To Date</label>
                    <input
                      type="date"
                      value={exportToDate}
                      onChange={(e) => { setExportToDate(e.target.value); setExportDate(''); }}
                      className="px-3 py-2 border border-[#064e3b]/10 rounded-lg text-sm focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-[#064e3b]/60">Actions</label>
                    <div className="flex gap-2">
                      <button
                        onClick={exportOrdersToExcel}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#064e3b] text-white rounded-lg text-sm font-medium hover:bg-[#064e3b]/90"
                      >
                        <Download size={14} /> CSV
                      </button>
                      <button
                        onClick={downloadAllThermalBills}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#c5a059] text-white rounded-lg text-sm font-medium hover:bg-[#c5a059]/90"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bulk Actions */}
                {(exportDate || (exportFromDate && exportToDate)) && (
                  <div className="mt-4 pt-4 border-t border-[#064e3b]/10">
                    <p className="text-xs font-medium text-[#064e3b]/60 mb-2">Bulk Update (Filtered Orders)</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleBulkStatusChange('Packing & Processing')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600"
                      >
                        Packing & Processing
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('Shipped')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                      >
                        Shipping
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('Delivered')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
                      >
                        Delivered
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {filteredOrders.map((order) => (
                <motion.div
                  key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-[#064e3b]/5 overflow-hidden"
                >
                  <div
                    className="p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:bg-[#fdfbf7]/50 transition-all"
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#064e3b]/10 rounded-xl flex items-center justify-center">
                        <ShoppingBag size={18} className="text-[#064e3b]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#064e3b] text-sm sm:text-base">{order.shippingAddress.fullName}</p>
                        <p className="text-[#064e3b]/40 text-xs sm:text-sm">#{order._id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="text-right">
                        <p className="font-black text-[#c5a059] text-sm sm:text-lg">₹{order.totalPrice}</p>
                        <p className="text-[#064e3b]/40 text-xs sm:text-sm">{order.orderItems.length} items</p>
                      </div>
                      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        {order.isPaid ? (
                          <span className="px-2 sm:px-4 py-1 sm:py-2 bg-green-100 text-green-600 rounded-full text-xs sm:text-sm font-bold">Paid</span>
                        ) : (
                          <span className="px-2 sm:px-4 py-1 sm:py-2 bg-red-100 text-red-600 rounded-full text-xs sm:text-sm font-bold">Unpaid</span>
                        )}
                        <select
                          value={order.status || 'Pending'}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (newStatus === 'Delivered') {
                              handleDeliver(order._id);
                            } else if (newStatus === 'Packing & Processing') {
                              handlePacking & Processing(order._id);
                            } else if (newStatus === 'Shipped') {
                              handleShipping(order._id);
                            }
                          }}
                          className={`px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer border-0 ${
                            (order.status || 'Pending') === 'Delivered' ? 'bg-green-500 text-white' :
                            (order.status || 'Pending') === 'Shipped' ? 'bg-blue-500 text-white' :
                            (order.status || 'Pending') === 'Packing & Processing' ? 'bg-yellow-500 text-white' :
                            'bg-yellow-100 text-yellow-600'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Packing & Processing">Packing & Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        {order.estimatedDelivery && (order.status || 'Pending') !== 'Delivered' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                            Est: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order._id); }}
                          className="px-2 sm:px-4 py-1 sm:py-2 bg-red-100 text-red-600 rounded-full text-xs sm:text-sm font-bold hover:bg-red-200 transition-all"
                          title="Delete Order"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <ChevronRight size={18} className={`text-[#064e3b]/30 transition-transform hidden sm:flex ${expandedOrder === order._id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedOrder === order._id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-[#064e3b]/5">
                        <div className="p-5 lg:p-6 bg-[#fdfbf7]/50">
                          <div className="flex justify-end gap-2 mb-4">
                            <button
                              onClick={() => downloadThermalBill(order)}
                              className="flex items-center gap-2 px-4 py-2 bg-[#c5a059] text-white rounded-lg font-bold text-sm hover:bg-[#c5a059]/90"
                            >
                              <Download size={16} /> Thermal
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="text-sm font-bold text-[#064e3b]/40 uppercase tracking-wider mb-3">Shipping Address</h5>
                              <div className="space-y-2 text-[#064e3b]">
                                <p className="font-bold">{order.shippingAddress.fullName}</p>
                                <p className="text-sm">{order.shippingAddress.address}</p>
                                <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                                <p className="text-sm">{order.shippingAddress.country}</p>
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-[#064e3b]/40 uppercase tracking-wider mb-3">Order Items</h5>
                              <div className="grid grid-cols-2 gap-3">
                                {order.orderItems.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-xl">
                                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-[#064e3b] truncate">{item.name}</p>
                                      <p className="text-xs text-[#064e3b]/40">₹{item.price} × {item.qty}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-[#064e3b]/5">
                  <ShoppingBag size={48} className="mx-auto text-[#064e3b]/20 mb-4" />
                  <p className="text-[#064e3b]/40">No orders found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {/* Add Product Card */}
              <button
                onClick={() => { setEditingProduct(null); setFormData({ name: '', price: '', description: '', image: '', category: '', countInStock: '' }); setIsModalOpen(true); }}
                className="bg-white rounded-2xl sm:rounded-[2rem] border-2 border-dashed border-[#064e3b]/20 flex flex-col items-center justify-center gap-2 sm:gap-4 p-4 sm:p-8 min-h-[160px] sm:min-h-[200px] lg:min-h-[300px] hover:border-[#c5a059] hover:bg-[#fdfbf7]/50 transition-all group"
              >
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[#064e3b]/5 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-[#c5a059] group-hover:text-white transition-all">
                  <Plus size={20} className="sm:size-8" />
                </div>
                <span className="font-bold text-[#064e3b]/50 group-hover:text-[#064e3b] text-xs sm:text-sm">Add New</span>
              </button>

              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl sm:rounded-[2rem] border border-[#064e3b]/5 overflow-hidden group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-bold text-[#064e3b]">{product.category}</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-5">
                    <h4 className="font-bold text-[#064e3b] mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base line-clamp-1">{product.name}</h4>
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <span className="text-sm sm:text-lg lg:text-xl font-black text-[#c5a059]">₹{product.price}</span>
                      <span className={`text-[10px] sm:text-xs lg:text-sm font-bold ${product.countInStock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                        {product.countInStock}
                      </span>
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <button onClick={() => openEditModal(product)} className="flex-1 py-2 sm:py-3 bg-[#064e3b]/5 text-[#064e3b] rounded-lg sm:rounded-xl font-bold hover:bg-[#064e3b] hover:text-white transition-all flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs lg:text-sm">
                        <Edit3 size={12} className="sm:size-4" /> <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button onClick={() => handleDeleteProduct(product._id)} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-50 text-red-500 rounded-lg sm:rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                        <Trash2 size={12} className="sm:size-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="bg-white rounded-[2rem] border border-[#064e3b]/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-[#fdfbf7]">
                    <tr>
                      <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Customer</th>
                      <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Orders</th>
                      <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Total Spent</th>
                      <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#064e3b]/5">
                    {orders.reduce((acc, order) => {
                      const existing = acc.find(c => c.email === order.shippingAddress.email);
                      if (existing) {
                        existing.orders += 1;
                        existing.spent += order.totalPrice;
                      } else {
                        acc.push({ email: order.shippingAddress.email, name: order.shippingAddress.fullName, orders: 1, spent: order.totalPrice });
                      }
                      return acc;
                    }, []).slice(0, 10).map((customer, idx) => (
                      <tr key={idx} className="hover:bg-[#fdfbf7]/50 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#c5a059] rounded-full flex items-center justify-center text-white font-bold">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#064e3b]">{customer.name}</p>
                              <p className="text-sm text-[#064e3b]/40">{customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5"><span className="font-bold text-[#064e3b]">{customer.orders}</span></td>
                        <td className="p-5"><span className="font-bold text-[#c5a059]">₹{customer.spent}</span></td>
                        <td className="p-5"><span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] p-8 border border-[#064e3b]/5">
                <h4 className="text-xl font-black text-[#064e3b] mb-6">Store Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Store Name</label>
                    <input type="text" defaultValue="Reverse Rituals" className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Email</label>
                    <input type="email" defaultValue={user?.email} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                  <button className="px-6 py-3 bg-[#064e3b] text-white rounded-xl font-bold hover:bg-[#c5a059] transition-all">Save Changes</button>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-8 border border-[#064e3b]/5">
                <h4 className="text-xl font-black text-[#064e3b] mb-6">Account</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#fdfbf7] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#c5a059] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#064e3b]">{user?.name}</p>
                        <p className="text-sm text-[#064e3b]/40">Admin</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { logout(); navigate('/'); }} className="w-full py-3 border border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">Logout</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[2rem] p-6 lg:p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b]">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#064e3b]/30 hover:text-[#064e3b]"><X size={28} /></button>
              </div>
              <form onSubmit={handleProductSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Product Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Category</label>
                    <input type="text" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Price (₹)</label>
                    <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Stock</label>
                    <input type="number" required value={formData.countInStock} onChange={(e) => setFormData({ ...formData, countInStock: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Image URL</label>
                  <input type="text" required value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Description</label>
                  <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059] resize-none"></textarea>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-[#064e3b]/10 rounded-xl font-bold text-[#064e3b] hover:bg-[#064e3b]/5 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-[#064e3b] text-white rounded-xl font-bold hover:bg-[#c5a059] transition-all">{editingProduct ? 'Save' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;