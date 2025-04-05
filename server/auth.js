import express from 'express';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Register endpoint
router.post('/register', async (req, res) => {
  console.log('\n=== Registration Request ===');
  console.log('Raw request body:', {
    ...req.body,
    password: req.body.password ? '[HIDDEN]' : undefined
  });

  try {
    // Transform building to uppercase before creating user
    const userData = {
      ...req.body,
      building: req.body.building?.toString().trim().toUpperCase(),
      flat: req.body.flat?.toString().trim().toUpperCase(),
      floor: req.body.floor?.toString().trim(),
      name: req.body.name?.toString().trim(),
      phone: req.body.phone?.toString().trim()
    };

    console.log('\nTransformed user data:', {
      ...userData,
      password: userData.password ? '[HIDDEN]' : undefined
    });

    // Create new user
    const user = new User(userData);
    
    // Validate the user data
    const validationError = user.validateSync();
    if (validationError) {
      console.log('\nValidation Errors:');
      const errors = Object.values(validationError.errors).map(err => {
        console.log(`- Field: ${err.path}`);
        console.log(`  Value: ${err.value}`);
        console.log(`  Message: ${err.message}`);
        return {
          field: err.path,
          message: err.message,
          value: err.value
        };
      });
      
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    
    // Additional validation logging
    console.log('\nPre-save validation passed');
    console.log('Generated code:', user.code);
    
    // Save the user
    await user.save();

    console.log('\nUser registered successfully:', {
      userId: user._id,
      code: user.code,
      building: user.building,
      flat: user.flat,
      name: user.name,
      floor: user.floor
    });

    res.status(201).json({ 
      success: true,
      message: 'Registration successful',
      userId: user._id 
    });
  } catch (error) {
    console.error('\nRegistration Error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors
    });
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      console.log('\nValidation Error Details:');
      const errors = Object.values(error.errors).map(err => {
        console.log(`- Field: ${err.path}`);
        console.log(`  Value: ${err.value}`);
        console.log(`  Message: ${err.message}`);
        return {
          field: err.path,
          message: err.message,
          value: err.value
        };
      });
      
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }

    // Handle duplicate key error (unique phone number)
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Phone number already registered',
        errors: [{
          field: 'phone',
          message: 'This phone number is already registered'
        }]
      });
    }

    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Update profile endpoint
router.put('/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    Object.assign(user, req.body);
    await user.save();

    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }

    // Handle duplicate key error (unique phone number)
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Phone number already taken' 
      });
    }

    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Update password endpoint
router.put('/user/password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Server error during password update' });
  }
});

export default router; 