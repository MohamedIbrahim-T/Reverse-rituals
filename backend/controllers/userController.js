const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Load Brevo email module
let emailModule = null;
try {
  emailModule = require('../config/email');
  console.log('Email module loaded in userController');
} catch (e) {
  console.log('Email module not available');
}

// Send email helper (using Brevo SMTP)
const sendEmail = async (to, subject, html) => {
  try {
    if (!emailModule || !emailModule.sendEmail) {
      console.log('Email module not available');
      return false;
    }
    emailModule.sendEmail(to, subject, html);
    console.log('Email sent to:', to);
    return true;
  } catch (error) {
    console.log('Email send failed:', error.message);
    return false;
  }
};

// Send password reset email (using new template)
const sendPasswordResetEmail = async (to, name, otp) => {
  try {
    if (!emailModule || !emailModule.sendPasswordResetEmail) {
      console.log('Email module not available');
      return false;
    }
    return await emailModule.sendPasswordResetEmail(to, name, otp);
  } catch (error) {
    console.log('Password reset email failed:', error.message);
    return false;
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  
  if (!user) {
    res.status(404).json({ message: 'User not found with this email' });
    return;
  }
  
  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  
  // Store OTP with 10 minute expiry
  otpStore.set(email, {
    otp,
    expires: Date.now() + 10 * 60 * 1000
  });
  
  // Send OTP via email using new template
  const emailSent = await sendPasswordResetEmail(email, user.name, otp);
  
  if (emailSent) {
    res.json({ message: 'OTP sent to your email' });
  } else {
    res.status(500).json({ message: 'Failed to send OTP. Please check your email.' });
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  const stored = otpStore.get(email);
  
  if (!stored) {
    res.status(400).json({ message: 'No OTP requested for this email' });
    return;
  }
  
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    res.status(400).json({ message: 'OTP expired. Please request new OTP' });
    return;
  }
  
  if (stored.otp !== otp) {
    res.status(400).json({ message: 'Invalid OTP' });
    return;
  }
  
  const user = await User.findOne({ email });
  
  if (user) {
    user.password = newPassword;
    await user.save();
    otpStore.delete(email);
    res.json({ message: 'Password reset successful' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      shippingAddress: user.shippingAddress,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      shippingAddress: user.shippingAddress,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
    isAdmin: isAdmin || false,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      shippingAddress: user.shippingAddress,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Make user admin
// @route   PUT /api/users/:id/admin
// @access  Private/Admin
const makeUserAdmin = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isAdmin = true;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.shippingAddress) {
      user.shippingAddress = req.body.shippingAddress;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      shippingAddress: updatedUser.shippingAddress,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  authUser,
  getUserProfile,
  registerUser,
  makeUserAdmin,
  updateUserProfile,
  forgotPassword,
  resetPassword,
};
