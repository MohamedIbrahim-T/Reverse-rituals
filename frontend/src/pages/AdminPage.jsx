import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag, Package, Truck, CheckCircle, Trash2, Edit3, Plus, X,
  DollarSign, Users, BarChart3, Calendar, Search, Home, Settings,
  LogOut, Bell, Menu, ChevronRight, Image, CreditCard, MapPin, Phone, Mail, Download, FileSpreadsheet, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import html2pdf from 'html2pdf.js';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import ImageUpload from '../components/ImageUpload';
import ReviewsSection from './ReviewsSection';

const AdminPage = () => {
  const { user, logout, loading: authLoading } = useAuth();
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
  const [exportProduct, setExportProduct] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '', price: '', description: '', image: '', category: '', countInStock: '', images: '', stockStatus: 'in_stock',
  });
  const [updatingStockStatus, setUpdatingStockStatus] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [thermalGenerating, setThermalGenerating] = useState(null);

  const [analyticsStats, setAnalyticsStats] = useState({
    totalVisitors: 0,
    loggedInVisitors: 0,
    guestVisitors: 0,
    newSignups: 0,
    paidOrders: 0,
    conversionRate: 0
  });
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerFormData, setCustomerFormData] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [editingOrderAddress, setEditingOrderAddress] = useState(null);
  const [orderAddressForm, setOrderAddressForm] = useState({ fullName: '', address: '', city: '', state: '', zipCode: '', country: '', phone: '', altPhone: '' });
  const [visitsGraph, setVisitsGraph] = useState([]);
  const [ordersGraph, setOrdersGraph] = useState([]);
  const [analyticsFilter, setAnalyticsFilter] = useState('');
  const [graphDays, setGraphDays] = useState(30);

  const fetchAnalytics = async (filter = '') => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const statsRes = await axios.get(`${API_URL}/api/analytics/admin/stats?filter=${filter}`, config);
      const visitsRes = await axios.get(`${API_URL}/api/analytics/admin/visits-graph?days=${graphDays}`, config);
      const ordersRes = await axios.get(`${API_URL}/api/analytics/admin/orders-graph?days=${graphDays}`, config);

      setAnalyticsStats(statsRes.data);
      setVisitsGraph(visitsRes.data);
      setOrdersGraph(ordersRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics' && user?.token) {
      fetchAnalytics(analyticsFilter);
    }
  }, [activeTab, analyticsFilter, user?.token, graphDays]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !user.isAdmin) {
        navigate('/login');
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      let productsRes = { data: [] };
      try {
        productsRes = await axios.get(`${API_URL}/api/products`);
      } catch (err) {
        console.log('Products fetch error:', err.message);
      }

      setProducts(productsRes.data || []);

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

      let usersRes = { data: [] };
      if (user?.token && user.isAdmin) {
        try {
          usersRes = await axios.get(`${API_URL}/api/users/all`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        } catch (err) {
          console.log('Users fetch error:', err.message);
        }
      }
      setCustomers(usersRes.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setProducts([]);
      setOrders([]);
      setCustomers([]);
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

  const handlePacking = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(`${API_URL}/api/orders/${id}/status`, { status: 'Packing & Processing' }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Order marked as Packing & Processing!');
      fetchData();
    } catch (error) {
      console.error('Packing error:', error.response?.data || error.message);
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

  const generateBillHTML = (order) => {
    const targetDate = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt);
    const dateStr = targetDate ? `${targetDate.toLocaleDateString('en-IN')} ${targetDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'N/A';
    const orderId = order.orderId || order._id?.toString().slice(-8).toUpperCase() || 'N/A';
    const fullName = order.shippingAddress?.fullName || 'N/A';
    const address = order.shippingAddress?.address || '';
    const cityStateZip = `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.zipCode || ''}`;
    const phone = order.shippingAddress?.phone || '';
    const altPhone = order.shippingAddress?.altPhone ? `Alt: ${order.shippingAddress.altPhone}` : '';

    const cleanedAddress = address
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .map(part => part.endsWith(',') ? part.slice(0, -1).trim() : part)
      .filter(part => part.length > 0)
      .join(', ');

    let itemsHTML = '';
    order.orderItems?.forEach(item => {
      itemsHTML += `
        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
          <span style="flex: 1; padding-right: 8px; word-break: break-word;">${item.name || 'Item'}</span>
          <span style="font-weight: 600; white-space: nowrap;">x${item.qty || 0}</span>
        </div>
      `;
    });

    const totalItems = order.orderItems?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;

    return `
      <div style="width: 384px; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000; background: #fff; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 16px;">
          <h1 style="font-size: 26px; font-weight: 800; margin: 0; color: #000; letter-spacing: -0.5px;">REVERSE RITUALS</h1>
          <p style="font-size: 13px; margin: 4px 0 0; color: #444; font-weight: 500;">Natural Hair Care Products</p>
        </div>
        <div style="border-top: 1.5px solid #000; margin: 14px 0;"></div>
        <div style="font-size: 14px; margin-bottom: 14px; line-height: 1.5;">
          <div style="display: flex; justify-content: space-between;">
            <span><strong style="color: #000;">Order:</strong> #${orderId}</span>
          </div>
          <div><strong style="color: #000;">Date:</strong> ${dateStr}</div>
        </div>
        <div style="border-top: 1px dashed #888; margin: 14px 0;"></div>
        <div style="margin-bottom: 18px;">
          <div style="font-size: 14px; font-weight: 700; margin-bottom: 6px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Deliver To:</div>
          <div style="font-size: 17px; font-weight: 700; color: #000; margin-bottom: 6px;">${fullName}</div>
          <div style="font-size: 15px; line-height: 1.5; color: #111; margin-bottom: 6px; word-wrap: break-word;">${cleanedAddress}</div>
          <div style="font-size: 15px; color: #111; margin-bottom: 8px;">${cityStateZip}</div>
          <div style="font-size: 14px; color: #000; font-weight: 600;">Phone: ${phone}</div>
          ${altPhone ? `<div style="font-size: 14px; color: #000; font-weight: 600; margin-top: 2px;">${altPhone}</div>` : ''}
        </div>
        <div style="border-top: 1px dashed #888; margin: 14px 0;"></div>
        <div style="margin-bottom: 18px;">
          <div style="font-size: 14px; font-weight: 700; margin-bottom: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Items (${order.orderItems?.length || 0}):</div>
          ${itemsHTML}
        </div>
        <div style="border-top: 1.5px solid #000; margin: 14px 0;"></div>
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; margin-bottom: 24px; color: #000;">
          <span>Total Items:</span>
          <span>${totalItems}</span>
        </div>
        <div style="text-align: center; font-size: 13px; color: #444; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 16px; line-height: 1.6;">
          <p style="margin: 0 0 4px; font-weight: 600; color: #000;">Thank you for your order!</p>
          <p style="margin: 0 0 12px; color: #555;">reverserituals@gmail.com</p>
          <div style="background: #f8f9fa; border: 1px solid #222; padding: 10px; border-radius: 6px;">
            <p style="margin: 0; font-size: 12px; font-weight: 700; color: #000;">If customer not answering call,</p>
            <p style="margin: 2px 0 0; font-size: 13px; font-weight: 800; color: #000;">Please Call: 7358422064</p>
          </div>
        </div>
      </div>
    `;
  };

  const downloadThermalBill = async (order) => {
    setThermalGenerating(order._id);
    try {
      const container = document.createElement('div');
      container.innerHTML = generateBillHTML(order);

      const safeBillId = (order.orderId || order._id.toString().slice(-8)).replace(/\//g, '-').toUpperCase();
      const filename = `bill-${safeBillId}-${new Date().toISOString().slice(0, 10)}.pdf`;

      const opt = {
        margin: [0.2, 0.1, 0.2, 0.1],
        filename,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: [4, 6], orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(container).save();
      toast.success('Bill downloaded successfully');
    } catch (err) {
      console.error('Thermal bill error:', err);
      toast.error('Failed to generate thermal bill');
    } finally {
      setThermalGenerating(null);
    }
  };

  const downloadAllThermalBills = async () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders found for selected filters');
      return;
    }

    try {
      const wrapper = document.createElement('div');

      filteredOrders.forEach((order, idx) => {
        const orderDiv = document.createElement('div');
        if (idx > 0) {
          orderDiv.style.pageBreakBefore = 'always';
        }
        orderDiv.innerHTML = generateBillHTML(order);
        wrapper.appendChild(orderDiv);
      });

      let filenameDate = new Date().toISOString().slice(0, 10);
      if (exportDate) {
        filenameDate = new Date(exportDate).toISOString().slice(0, 10);
      } else if (exportFromDate) {
        filenameDate = new Date(exportFromDate).toISOString().slice(0, 10);
      }

      const opt = {
        margin: [0.2, 0.1, 0.2, 0.1],
        filename: `bills-${filenameDate}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: [4, 6], orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(wrapper).save();
      toast.success(`${filteredOrders.length} bills generated successfully`);
    } catch (error) {
      console.error('Bulk thermal bill error:', error);
      toast.error('Failed to download bills');
    }
  };

  const handleBulkStatusChange = async (status) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      if (filteredOrders.length === 0) {
        toast.error('No orders to update');
        return;
      }

      await Promise.all(
        filteredOrders.map(order => {
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

      toast.success(`Updated ${filteredOrders.length} orders`);
      fetchData();
    } catch (error) {
      toast.error('Bulk update failed');
    }
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(`${API_URL}/api/users/${editingCustomer._id}`, {
        name: customerFormData.name,
        email: customerFormData.email,
        shippingAddress: {
          phone: customerFormData.phone,
          address: customerFormData.address,
          city: customerFormData.city,
          state: customerFormData.state,
          pincode: customerFormData.pincode,
        }
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Customer updated successfully');
      setEditingCustomer(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update customer');
    }
  };

  const handleSaveOrderAddress = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(`${API_URL}/api/orders/${editingOrderAddress._id}/address`, orderAddressForm, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Address updated successfully');
      setEditingOrderAddress(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update address');
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
        <p style="margin: 5px 0; font-size: 13px; color: #333;"><strong>Order ID:</strong> ${order.orderId || order._id.toString().slice(-8).toUpperCase()}</p>
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
      <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Name:</strong> ${order.shippingAddress?.fullName || 'N/A'}</p>
      <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Address:</strong> ${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.zipCode || ''}</p>
      <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}${order.shippingAddress?.altPhone ? ', ' + order.shippingAddress.altPhone : ''}</p>
      <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Email:</strong> ${order.shippingAddress?.email || 'N/A'}</p>
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
      <p>reverserituals@gmail.com</p>
    </div>
  </div>`;

    const element = document.createElement('div');
    element.innerHTML = printContent;

    const opt = {
      margin: 0,
      filename: `label-${order._id}-${new Date().toISOString().slice(0, 10)}.pdf`,
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

  const handleStockStatusUpdate = async (productId, newStatus) => {
    setUpdatingStockStatus(prev => ({ ...prev, [productId]: true }));
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(`${API_URL}/api/products/${productId}/stock-status`,
        { stockStatus: newStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('Stock status updated!');
      fetchData();
    } catch (error) {
      toast.error('Failed to update stock status');
    } finally {
      setUpdatingStockStatus(prev => ({ ...prev, [productId]: false }));
    }
  };

  const exportOrdersToExcel = () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders found for selected filters');
      return;
    }

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = ['Order ID', 'Date', 'Time', 'Customer Name', 'Address', 'City', 'State', 'Pincode', 'Phone', 'Alt Phone', 'Email', 'Products', 'Total', 'Payment', 'Delivery Status'];

    const rows = filteredOrders.map(order => {
      const targetDate = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt);
      const dateStr = targetDate.toLocaleDateString('en-IN');
      const timeStr = targetDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const productsStr = order.orderItems?.map(item => `${item.name} (x${item.qty})`).join(', ') || '';

      return [
        order.orderId || order._id.toString().slice(-8).toUpperCase(),
        dateStr,
        timeStr,
        order.shippingAddress?.fullName || 'N/A',
        order.shippingAddress?.address || 'N/A',
        order.shippingAddress?.city || 'N/A',
        order.shippingAddress?.state || 'N/A',
        order.shippingAddress?.zipCode || 'N/A',
        order.shippingAddress?.phone || 'N/A',
        order.shippingAddress?.altPhone || '',
        order.shippingAddress?.email || '',
        productsStr,
        order.totalPrice || 0,
        order.isPaid ? 'Paid' : 'UNPAID',
        order.status || 'Pending'
      ].map(escapeCSV).join(',');
    });

    const csvContent = [headers.map(escapeCSV).join(','), ...rows].join('\n');

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
    toast.success(`Exported ${filteredOrders.length} orders!`);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const submitData = {
        ...formData,
        countInStock: parseInt(formData.countInStock) || 0,
        price: parseFloat(formData.price) || 0,
        images: formData.images ? formData.images.split(',').map(img => img.trim()).filter(img => img) : [],
      };
      if (editingProduct) {
        await axios.put(`${API_URL}/api/products/${editingProduct._id}`, submitData, config);
        toast.success('Product updated!');
      } else {
        await axios.post(`${API_URL}/api/products`, submitData, config);
        toast.success('Product created!');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', description: '', image: '', category: '', countInStock: '', images: '', stockStatus: 'in_stock' });
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
      images: product.images ? product.images.join(',') : '',
      stockStatus: product.stockStatus || 'in_stock',
    });
    setIsModalOpen(true);
  };

  const paidOrders = orders.filter(o => o.isPaid);
  const unpaidOrders = orders.filter(o => !o.isPaid);
  const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const totalOrders = paidOrders.length;
  const pendingOrders = unpaidOrders.length;
  const deliveredOrders = paidOrders.filter(o => o.isDelivered).length;
  const lowStockProducts = products.filter(p => p.countInStock < 5).length;

  const filteredOrders = orders.filter(order => {
    const fullName = order.shippingAddress?.fullName || '';
    const orderIdStr = order.orderId || order._id || '';
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderIdStr.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesProduct = true;
    if (exportProduct) {
      const selectedProduct = products.find(p => p._id === exportProduct);
      matchesProduct = order.orderItems?.some(item => {
        if (!item) return false;
        const itemProductId = item.product || item._id;
        const itemProductIdStr = String(itemProductId);
        const exportProdIdStr = String(exportProduct);
        const matchesId = itemProductIdStr === exportProdIdStr ||
          itemProductIdStr.includes(exportProdIdStr) ||
          exportProdIdStr.includes(itemProductIdStr);
        const matchesName = selectedProduct && item.name &&
          item.name.toLowerCase().includes(selectedProduct.name.toLowerCase());
        return matchesId || matchesName;
      });
    }

    let matchesStatus = true;
    if (exportStatus === 'paid') matchesStatus = order.isPaid;
    if (exportStatus === 'unpaid') matchesStatus = !order.isPaid;

    const targetDate = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const orderDateStr = `${year}-${month}-${day}`;

    if (exportDate) {
      const matchesDate = orderDateStr === exportDate;
      return matchesSearch && matchesDate && matchesProduct && matchesStatus;
    }

    if (exportFromDate || exportToDate) {
      const from = exportFromDate || '0000-01-01';
      const to = exportToDate || '9999-12-31';
      const matchesDateRange = orderDateStr >= from && orderDateStr <= to;
      return matchesSearch && matchesDateRange && matchesProduct && matchesStatus;
    }

    return matchesSearch && matchesProduct && matchesStatus;
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Overview' },
    { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders', badge: paidOrders.length },
    { id: 'products', icon: <Package size={20} />, label: 'Products', badge: products.length },
    { id: 'reviews', icon: <MessageSquare size={20} />, label: 'Reviews' },
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
              { title: 'Total Orders Paid', value: totalOrders, icon: <ShoppingBag size={24} />, color: 'bg-blue-500' },
              { title: 'Unpaid', value: unpaidOrders.length, icon: <Truck size={24} />, color: 'bg-yellow-500' },
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
              { label: 'Delivered', value: deliveredOrders, color: 'bg-green-500', percent: totalOrders ? (deliveredOrders / totalOrders) * 100 : 0 },
              { label: 'Unpaid', value: pendingOrders, color: 'bg-yellow-500', percent: 100 },
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
                {activeTab === 'analytics' && 'Analytics Dashboard'}
                {activeTab === 'orders' && 'Orders'}
                {activeTab === 'products' && 'Products'}
                {activeTab === 'customers' && 'Customers'}
                {activeTab === 'settings' && 'Configure your store'}
              </h3>
              <p className="text-[#064e3b]/40 text-sm">
                {activeTab === 'dashboard' && 'Your store at a glance'}
                {activeTab === 'analytics' && 'Track visits and conversions'}
                {activeTab === 'orders' && 'Manage customer orders'}
                {activeTab === 'products' && 'Manage product inventory'}
                {activeTab === 'customers' && 'View customer details'}
                {activeTab === 'settings' && 'Configure your store'}
              </p>
            </div>
            {activeTab === 'products' && (
              <button
                onClick={() => { setEditingProduct(null); setFormData({ name: '', price: '', description: '', image: '', category: '', countInStock: '', images: '', stockStatus: 'in_stock' }); setIsModalOpen(true); }}
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

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex gap-2">
                  <button onClick={() => { setAnalyticsFilter(''); setGraphDays(30); }} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${analyticsFilter === '' ? 'bg-[#064e3b] text-white' : 'bg-white border border-[#064e3b]/10 text-[#064e3b]'}`}>All Time</button>
                  <button onClick={() => { setAnalyticsFilter('today'); setGraphDays(1); }} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${analyticsFilter === 'today' ? 'bg-[#064e3b] text-white' : 'bg-white border border-[#064e3b]/10 text-[#064e3b]'}`}>Today</button>
                  <button onClick={() => { setAnalyticsFilter('last7days'); setGraphDays(7); }} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${analyticsFilter === 'last7days' ? 'bg-[#064e3b] text-white' : 'bg-white border border-[#064e3b]/10 text-[#064e3b]'}`}>Last 7 Days</button>
                  <button onClick={() => { setAnalyticsFilter('last30days'); setGraphDays(30); }} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${analyticsFilter === 'last30days' ? 'bg-[#064e3b] text-white' : 'bg-white border border-[#064e3b]/10 text-[#064e3b]'}`}>Last 30 Days</button>
                </div>
                <span className="text-xs font-medium text-[#c5a059] bg-[#c5a059]/10 px-3 py-1 rounded-full">
                  {analyticsFilter === '' ? 'All Time' : analyticsFilter === 'today' ? 'Today' : analyticsFilter === 'last7days' ? 'Last 7 Days' : 'Last 30 Days'}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6">
                <div className="bg-white rounded-[1.5rem] p-5 lg:p-6 border border-[#064e3b]/5 shadow-sm">
                  <p className="text-[#064e3b]/40 text-xs font-bold uppercase tracking-wider mb-2">Total Visits</p>
                  <p className="text-2xl lg:text-3xl font-black text-[#064e3b]">{analyticsStats.totalVisitors}</p>
                  <p className="text-xs text-[#064e3b]/40 mt-1">All visitors</p>
                </div>
                <div className="bg-white rounded-[1.5rem] p-5 lg:p-6 border border-[#064e3b]/5 shadow-sm">
                  <p className="text-[#064e3b]/40 text-xs font-bold uppercase tracking-wider mb-2">Logged In</p>
                  <p className="text-2xl lg:text-3xl font-black text-purple-600">{analyticsStats.loggedInVisitors}</p>
                  <p className="text-xs text-[#064e3b]/40 mt-1">Returning users</p>
                </div>
                <div className="bg-white rounded-[1.5rem] p-5 lg:p-6 border border-[#064e3b]/5 shadow-sm">
                  <p className="text-[#064e3b]/40 text-xs font-bold uppercase tracking-wider mb-2">Guest</p>
                  <p className="text-2xl lg:text-3xl font-black text-blue-600">{analyticsStats.guestVisitors}</p>
                  <p className="text-xs text-[#064e3b]/40 mt-1">New visitors</p>
                </div>
                <div className="bg-white rounded-[1.5rem] p-5 lg:p-6 border border-[#064e3b]/5 shadow-sm">
                  <p className="text-[#064e3b]/40 text-xs font-bold uppercase tracking-wider mb-2">New Signups</p>
                  <p className="text-2xl lg:text-3xl font-black text-pink-600">{analyticsStats.newSignups}</p>
                  <p className="text-xs text-[#064e3b]/40 mt-1">Registered users</p>
                </div>
                <div className="bg-white rounded-[1.5rem] p-5 lg:p-6 border border-[#064e3b]/5 shadow-sm">
                  <p className="text-[#064e3b]/40 text-xs font-bold uppercase tracking-wider mb-2">Paid Orders</p>
                  <p className="text-2xl lg:text-3xl font-black text-green-600">{analyticsStats.paidOrders}</p>
                  <p className="text-xs text-[#064e3b]/40 mt-1">Completed</p>
                </div>
              </div>

              <div className="bg-white rounded-[1.5rem] p-5 lg:p-6 border border-[#064e3b]/5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#064e3b]/60 text-sm font-bold">Conversion Rate</p>
                  <p className="text-[#064e3b] text-xl font-black">{Math.min(analyticsStats.conversionRate, 100)}%</p>
                </div>
                <div className="h-3 bg-[#064e3b]/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#064e3b] to-green-500 rounded-full transition-all" style={{ width: `${Math.min(analyticsStats.conversionRate, 100)}%` }}></div>
                </div>
                <p className="text-xs text-[#064e3b]/40 mt-2">Visits → Paid Orders</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] p-6 border border-[#064e3b]/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-[#064e3b]">Daily Visitors</h4>
                    <div className="flex gap-1">
                      <button onClick={() => setGraphDays(7)} className={`px-2 py-1 rounded text-xs font-bold ${graphDays === 7 ? 'bg-[#064e3b] text-white' : 'bg-[#064e3b]/10 text-[#064e3b]'}`}>7D</button>
                      <button onClick={() => setGraphDays(15)} className={`px-2 py-1 rounded text-xs font-bold ${graphDays === 15 ? 'bg-[#064e3b] text-white' : 'bg-[#064e3b]/10 text-[#064e3b]'}`}>15D</button>
                      <button onClick={() => setGraphDays(30)} className={`px-2 py-1 rounded text-xs font-bold ${graphDays === 30 ? 'bg-[#064e3b] text-white' : 'bg-[#064e3b]/10 text-[#064e3b]'}`}>30D</button>
                    </div>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={visitsGraph} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#064e3b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#064e3b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                        <XAxis dataKey="_id" stroke="#064e3b" fontSize={9} tickLine={false} tickFormatter={(v) => graphDays <= 7 ? v.slice(5) : graphDays <= 15 ? v.slice(5, 10) : v.slice(8)} />
                        <YAxis stroke="#064e3b" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} labelFormatter={(v) => `Date: ${v}`} />
                        <Area type="monotone" dataKey="count" name="Visitors" stroke="#064e3b" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-[#064e3b]/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-[#064e3b]">Daily Orders</h4>
                    <div className="flex gap-1">
                      <button onClick={() => setGraphDays(7)} className={`px-2 py-1 rounded text-xs font-bold ${graphDays === 7 ? 'bg-[#064e3b] text-white' : 'bg-[#064e3b]/10 text-[#064e3b]'}`}>7D</button>
                      <button onClick={() => setGraphDays(15)} className={`px-2 py-1 rounded text-xs font-bold ${graphDays === 15 ? 'bg-[#064e3b] text-white' : 'bg-[#064e3b]/10 text-[#064e3b]'}`}>15D</button>
                      <button onClick={() => setGraphDays(30)} className={`px-2 py-1 rounded text-xs font-bold ${graphDays === 30 ? 'bg-[#064e3b] text-white' : 'bg-[#064e3b]/10 text-[#064e3b]'}`}>30D</button>
                    </div>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ordersGraph} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="_id" stroke="#064e3b" fontSize={10} tickFormatter={(v) => graphDays <= 7 ? v.slice(5) : graphDays <= 15 ? v.slice(5, 10) : v.slice(8)} />
                        <YAxis stroke="#064e3b" fontSize={11} allowDecimals={false} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} formatter={(value, name) => [name === 'totalRevenue' ? `₹${(value || 0).toLocaleString()}` : value, name === 'totalRevenue' ? 'Revenue' : 'Orders']} labelFormatter={(v) => `Date: ${v}`} />
                        <Legend />
                        <Bar dataKey="count" name="Orders" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
                      onClick={() => { setExportDate(''); setExportFromDate(''); setExportToDate(''); setExportProduct(''); setExportStatus(''); }}
                      className="px-3 py-1.5 text-xs text-[#064e3b]/40 hover:text-[#064e3b] border border-[#064e3b]/10 rounded-lg"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

                  {/* Product Filter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#064e3b]/60">Filter by Product</label>
                    <select
                      value={exportProduct}
                      onChange={(e) => setExportProduct(e.target.value)}
                      className="px-3 py-2 border border-[#064e3b]/10 rounded-lg text-sm focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="">All Products</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>{product.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#064e3b]/60">Payment Status</label>
                    <select
                      value={exportStatus || ''}
                      onChange={(e) => setExportStatus(e.target.value)}
                      className="px-3 py-2 border border-[#064e3b]/10 rounded-lg text-sm focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="">All</option>
                      <option value="paid">Paid Only</option>
                      <option value="unpaid">Unpaid Only</option>
                    </select>
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
                {(exportDate || (exportFromDate && exportToDate) || exportProduct || exportStatus) && (
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
                        <p className="text-[#064e3b]/40 text-xs sm:text-sm">#{order.orderId || order._id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="text-right">
                        <p className="font-black text-[#c5a059] text-sm sm:text-lg">₹{order.totalPrice}</p>
                        <p className="text-[#064e3b]/40 text-xs sm:text-sm">{order.orderItems.length} items</p>
                      </div>
                      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        {order.isPaid ? (
                          <span className="px-2 sm:px-4 py-1 sm:py-2 bg-green-100 text-green-600 rounded-full text-xs sm:text-sm font-black border border-green-200">PAID</span>
                        ) : (
                          <span className="px-2 sm:px-4 py-1 sm:py-2 bg-red-500 text-white rounded-full text-xs sm:text-sm font-black animate-pulse shadow-lg shadow-red-200">UNPAID</span>
                        )}
                        <select
                          value={order.status || 'Pending'}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (newStatus === 'Delivered') {
                              handleDeliver(order._id);
                            } else if (newStatus === 'Packing & Processing') {
                              handlePacking(order._id);
                            } else if (newStatus === 'Shipped') {
                              handleShipping(order._id);
                            }
                          }}
                          className={`px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer border-0 ${(order.status || 'Pending') === 'Delivered' ? 'bg-green-500 text-white' :
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
                              disabled={thermalGenerating === order._id}
                              className="flex items-center gap-2 px-4 py-2 bg-[#c5a059] text-white rounded-lg font-bold text-sm hover:bg-[#c5a059]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {thermalGenerating === order._id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Download size={16} /> Thermal
                                </>
                              )}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-sm font-bold text-[#064e3b]/40 uppercase tracking-wider">Shipping Address</h5>
                                <button
                                  onClick={() => {
                                    setEditingOrderAddress(order);
                                    setOrderAddressForm({
                                      fullName: order.shippingAddress.fullName || '',
                                      address: order.shippingAddress.address || '',
                                      city: order.shippingAddress.city || '',
                                      state: order.shippingAddress.state || '',
                                      zipCode: order.shippingAddress.zipCode || '',
                                      country: order.shippingAddress.country || 'India',
                                      phone: order.shippingAddress.phone || '',
                                      altPhone: order.shippingAddress.altPhone || '',
                                    });
                                  }}
                                  className="p-1.5 text-[#064e3b] hover:text-[#c5a059] transition-colors"
                                >
                                  <Edit3 size={16} />
                                </button>
                              </div>
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
                onClick={() => { setEditingProduct(null); setFormData({ name: '', price: '', description: '', image: '', category: '', countInStock: '', images: '', stockStatus: 'in_stock' }); setIsModalOpen(true); }}
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
                    <div className="absolute top-2 right-2">
                      <select
                        value={product.stockStatus || 'in_stock'}
                        onChange={(e) => handleStockStatusUpdate(product._id, e.target.value)}
                        disabled={updatingStockStatus[product._id]}
                        className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold border-0 cursor-pointer ${(product.stockStatus || 'in_stock') === 'out_of_stock' ? 'bg-red-500 text-white' :
                          (product.stockStatus || 'in_stock') === 'low_stock' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                          }`}
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-3 sm:p-5">
                    <h4 className="font-bold text-[#064e3b] mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base line-clamp-1">{product.name}</h4>
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <span className="text-sm sm:text-lg lg:text-xl font-black text-[#c5a059]">₹{product.price}</span>
                      <span className={`text-[10px] sm:text-xs lg:text-sm font-bold ${product.countInStock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                        {product.countInStock} in stock
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

          {activeTab === 'reviews' && <ReviewsSection />}

          {activeTab === 'customers' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-[#064e3b]/60">{customers.length} total users</span>
              </div>
              <div className="bg-white rounded-[2rem] border border-[#064e3b]/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-[#fdfbf7]">
                      <tr>
                        <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Customer</th>
                        <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Email</th>
                        <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Phone</th>
                        <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Joined</th>
                        <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Orders</th>
                        <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Total Spent</th>
                        <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Status</th>
                        <th className="text-left p-5 text-xs font-bold uppercase tracking-wider text-[#064e3b]/40">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#064e3b]/5">
                      {customers.map((customer, idx) => {
                        const customerOrders = orders.filter(o => o.user === customer._id || o.shippingAddress?.email === customer.email);
                        const totalSpent = customerOrders.filter(o => o.isPaid).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
                        return (
                          <tr key={idx} className="hover:bg-[#fdfbf7]/50 transition-colors">
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#c5a059] rounded-full flex items-center justify-center text-white font-bold">
                                  {customer.name?.charAt(0)}
                                </div>
                                <p className="font-bold text-[#064e3b]">{customer.name}</p>
                              </div>
                            </td>
                            <td className="p-5 text-sm text-[#064e3b]/60">{customer.email}</td>
                            <td className="p-5 text-sm text-[#064e3b]/60">{customer.shippingAddress?.phone || '-'}</td>
                            <td className="p-5 text-sm text-[#064e3b]/60">
                              {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-5"><span className="font-bold text-[#064e3b]">{customerOrders.length}</span></td>
                            <td className="p-5"><span className="font-bold text-[#c5a059]">₹{totalSpent}</span></td>
                            <td className="p-5">
                              {customer.isAdmin ? (
                                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-bold">Admin</span>
                              ) : (
                                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">Customer</span>
                              )}
                            </td>
                            <td className="p-5">
                              {!customer.isAdmin && (
                                <button
                                  onClick={() => {
                                    setEditingCustomer(customer);
                                    setCustomerFormData({
                                      name: customer.name || '',
                                      email: customer.email || '',
                                      phone: customer.shippingAddress?.phone || '',
                                      address: customer.shippingAddress?.address || '',
                                      city: customer.shippingAddress?.city || '',
                                      state: customer.shippingAddress?.state || '',
                                      pincode: customer.shippingAddress?.pincode || '',
                                    });
                                  }}
                                  className="p-2 text-[#064e3b] hover:text-[#c5a059] transition-colors"
                                >
                                  <Edit3 size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Stock Status</label>
                    <select
                      value={formData.stockStatus || 'in_stock'}
                      onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                      className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
                <div>
                  <ImageUpload
                    label="Product Image"
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                  />
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

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {editingCustomer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[2rem] p-6 lg:p-10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b]">Edit Customer</h2>
                <button onClick={() => setEditingCustomer(null)} className="text-[#064e3b]/30 hover:text-[#064e3b]"><X size={28} /></button>
              </div>
              <form onSubmit={handleSaveCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Name</label>
                  <input type="text" required value={customerFormData.name} onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Email</label>
                  <input type="email" required value={customerFormData.email} onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Phone</label>
                  <input type="text" value={customerFormData.phone} onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Address</label>
                  <input type="text" value={customerFormData.address} onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">City</label>
                    <input type="text" value={customerFormData.city} onChange={(e) => setCustomerFormData({ ...customerFormData, city: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">State</label>
                    <input type="text" value={customerFormData.state} onChange={(e) => setCustomerFormData({ ...customerFormData, state: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Pincode</label>
                  <input type="text" value={customerFormData.pincode} onChange={(e) => setCustomerFormData({ ...customerFormData, pincode: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setEditingCustomer(null)} className="flex-1 py-4 border border-[#064e3b]/10 rounded-xl font-bold text-[#064e3b] hover:bg-[#064e3b]/5 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-[#064e3b] text-white rounded-xl font-bold hover:bg-[#c5a059] transition-all">Save</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Order Address Modal */}
      <AnimatePresence>
        {editingOrderAddress && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[2rem] p-6 lg:p-10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-black text-[#064e3b]">Edit Address</h2>
                <button onClick={() => setEditingOrderAddress(null)} className="text-[#064e3b]/30 hover:text-[#064e3b]"><X size={28} /></button>
              </div>
              <form onSubmit={handleSaveOrderAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Full Name</label>
                  <input type="text" required value={orderAddressForm.fullName} onChange={(e) => setOrderAddressForm({ ...orderAddressForm, fullName: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Phone</label>
                  <input type="text" value={orderAddressForm.phone} onChange={(e) => setOrderAddressForm({ ...orderAddressForm, phone: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Alt Phone</label>
                  <input type="text" value={orderAddressForm.altPhone} onChange={(e) => setOrderAddressForm({ ...orderAddressForm, altPhone: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Address</label>
                  <input type="text" required value={orderAddressForm.address} onChange={(e) => setOrderAddressForm({ ...orderAddressForm, address: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">City</label>
                    <input type="text" required value={orderAddressForm.city} onChange={(e) => setOrderAddressForm({ ...orderAddressForm, city: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">State</label>
                    <input type="text" required value={orderAddressForm.state} onChange={(e) => setOrderAddressForm({ ...orderAddressForm, state: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Pincode</label>
                    <input type="text" required value={orderAddressForm.zipCode} onChange={(e) => setOrderAddressForm({ ...orderAddressForm, zipCode: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#064e3b]/40 mb-2">Country</label>
                    <input type="text" required value={orderAddressForm.country} onChange={(e) => setOrderAddressForm({ ...orderAddressForm, country: e.target.value })} className="w-full px-5 py-3 bg-[#fdfbf7] border border-[#064e3b]/10 rounded-xl focus:outline-none focus:border-[#c5a059]" />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setEditingOrderAddress(null)} className="flex-1 py-4 border border-[#064e3b]/10 rounded-xl font-bold text-[#064e3b] hover:bg-[#064e3b]/5 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-[#064e3b] text-white rounded-xl font-bold hover:bg-[#c5a059] transition-all">Save Address</button>
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