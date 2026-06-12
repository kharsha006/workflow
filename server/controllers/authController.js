const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Check for user email
    console.log(`Login attempt for email: ${email}`);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found!');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Enforce that the selected role matches the user's actual role
    if (role && user.role !== role) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log(`Password match result: ${isMatch}`);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.approvalStatus === 'pending') {
      return res.status(403).json({ message: 'Account is pending HR approval' });
    }
    
    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({ message: 'Account registration was rejected' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password, role, dateOfBirth, panDetails, aadharCard, mobileNumber } = req.body;

  try {
    if (role !== 'Employee' && role !== 'Intern') {
      return res.status(400).json({ message: 'Invalid role for registration' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      dateOfBirth,
      panDetails,
      aadharCard,
      mobileNumber,
      approvalStatus: 'pending',
      status: 'inactive',
      avatar: {
        initials: name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U',
        bg: '#EEF2FF',
        color: '#4F46E5',
      }
    });

    res.status(201).json({
      message: 'Registration successful! Your account is pending HR approval.',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password (generates OTP)
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP and expiration (10 mins)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset OTP - WorkFlow',
        text: message,
        html: `<p>Your password reset OTP is: <strong>${otp}</strong>.</p><p>It is valid for 10 minutes.</p>`,
      });

      res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error(err);
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/resetpassword
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Password reset successful. Please log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  login,
  getMe,
  register,
  forgotPassword,
  resetPassword,
};
