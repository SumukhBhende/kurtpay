import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const dbName = 'ktkar';
const collectionName = 'maintron';

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
  console.log('Received registration request:', {
    ...req.body,
    password: req.body.password ? '[HIDDEN]' : undefined
  });

  const { name, building, floor, flat, phone, password } = req.body;

  // Validate required fields
  if (!name || !building || !floor || !flat || !phone || !password) {
    console.error('Missing required fields');
    return res.status(400).json({ 
      message: 'All fields are required',
      missing: Object.entries({ name, building, floor, flat, phone, password })
        .filter(([_, value]) => !value)
        .map(([key]) => key)
    });
  }

  // Validate phone number
  if (phone.length !== 10 || !/^\d+$/.test(phone)) {
    console.error('Invalid phone number format');
    return res.status(400).json({ message: 'Phone number must be 10 digits' });
  }

  try {
    console.log('Attempting to connect to database...');
    const client = req.app.locals.mongoClient;
    if (!client) {
      console.error('MongoDB client is not available');
      return res.status(500).json({ message: 'Database connection error' });
    }

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Check if phone number already exists
    console.log('Checking for existing user with phone:', phone);
    const existingUser = await collection.findOne({ phone });
    if (existingUser) {
      console.log('Phone number already registered:', phone);
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate user code
    const code = `${building}${flat}`;
    console.log('Generated user code:', code);

    // Create new user
    const newUser = {
      name,
      building,
      floor,
      flat,
      phone,
      password: hashedPassword,
      code,
      createdAt: new Date()
    };

    console.log('Attempting to insert new user...');
    const result = await collection.insertOne(newUser);
    console.log('User registered successfully:', result.insertedId);

    res.status(201).json({ 
      success: true,
      message: 'Registration successful',
      userId: result.insertedId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
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
    const client = req.app.locals.mongoClient;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Find user by phone
    const user = await collection.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Update profile endpoint
router.put('/user/profile', verifyToken, async (req, res) => {
  const { name, building, floor, flat, phone } = req.body;

  try {
    const client = req.app.locals.mongoClient;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Check if phone number is taken by another user
    const existingUser = await collection.findOne({
      phone,
      _id: { $ne: new ObjectId(req.userId) }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already taken' });
    }

    // Generate new code
    const code = `${building}${flat}`;

    // Update user
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.userId) },
      {
        $set: {
          name,
          building,
          floor,
          flat,
          phone,
          code,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.value;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Update password endpoint
router.put('/user/password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const client = req.app.locals.mongoClient;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Find user
    const user = await collection.findOne({ _id: new ObjectId(req.userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await collection.updateOne(
      { _id: new ObjectId(req.userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Server error during password update' });
  }
});

export default router; 