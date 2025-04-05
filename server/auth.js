import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const mongoUri = process.env.MONGODB_URI;
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
  const { name, building, floor, flat, phone, password } = req.body;

  try {
    const client = await MongoClient.connect(mongoUri);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Check if phone number already exists
    const existingUser = await collection.findOne({ phone });
    if (existingUser) {
      client.close();
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate user code
    const code = `${building}${flat}`;

    // Create new user
    const newUser = {
      name,
      building,
      floor,
      flat,
      phone,
      password: hashedPassword,
      code
    };

    await collection.insertOne(newUser);
    client.close();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
    const client = await MongoClient.connect(mongoUri);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Find user by phone
    const user = await collection.findOne({ phone });
    if (!user) {
      client.close();
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      client.close();
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

    client.close();
    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile endpoint
router.put('/user/profile', verifyToken, async (req, res) => {
  const { name, building, floor, flat, phone } = req.body;

  try {
    const client = await MongoClient.connect(mongoUri);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Check if phone number is taken by another user
    const existingUser = await collection.findOne({
      phone,
      _id: { $ne: ObjectId(req.userId) }
    });

    if (existingUser) {
      client.close();
      return res.status(400).json({ message: 'Phone number already taken' });
    }

    // Generate new code
    const code = `${building}${flat}`;

    // Update user
    const result = await collection.findOneAndUpdate(
      { _id: ObjectId(req.userId) },
      {
        $set: {
          name,
          building,
          floor,
          flat,
          phone,
          code
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      client.close();
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.value;

    client.close();
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update password endpoint
router.put('/user/password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const client = await MongoClient.connect(mongoUri);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Find user
    const user = await collection.findOne({ _id: ObjectId(req.userId) });
    if (!user) {
      client.close();
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      client.close();
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await collection.updateOne(
      { _id: ObjectId(req.userId) },
      { $set: { password: hashedPassword } }
    );

    client.close();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 