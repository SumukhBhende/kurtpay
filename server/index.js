import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4242;

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Security middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['POST', 'GET'],
  credentials: true
}));

// Parse JSON bodies
app.use(bodyParser.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

let retryCount = 0;
const MAX_RETRIES = 3;

async function connectDB() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    // Configure mongoose
    mongoose.set('strictQuery', true);
    
    // Connect with minimal options
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    
    console.log('Successfully connected to MongoDB Atlas');
    
    // Test the connection
    const db = mongoose.connection;
    console.log('Connected to database:', db.name);
    
    // Set up connection event handlers
    db.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      if (err.name === 'MongoServerError' && err.code === 8000) {
        console.error('Authentication failed. Please check your MongoDB Atlas credentials.');
        console.error('Make sure:');
        console.error('1. Username and password are correct');
        console.error('2. User has access to the database');
        console.error('3. IP address is whitelisted in MongoDB Atlas');
      }
    });
    
    db.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      if (retryCount < MAX_RETRIES) {
        connectDB().catch(err => console.error('Reconnection failed:', err));
      }
    });
    
    db.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
      retryCount = 0; // Reset retry count on successful reconnection
    });
    
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    });
    
    if (error.name === 'MongoServerError' && error.code === 8000) {
      console.error('\nAuthentication failed. Please check:');
      console.error('1. Your MongoDB Atlas username and password are correct');
      console.error('2. The user has the correct permissions');
      console.error('3. Your IP address is whitelisted in MongoDB Atlas');
      console.error('4. The connection string format is correct');
      console.error('\nCurrent connection string format:');
      console.error('mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority');
    }
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff
      console.log(`Retrying connection (${retryCount}/${MAX_RETRIES}) in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB();
    }
    
    throw error;
  }
}

// Connect to MongoDB before starting the server
connectDB()
  .then(() => {
    // Routes
    app.use('/api', authRouter);

    // Create order endpoint
    app.post('/create-order', async (req, res) => {
      try {
        const { amount, currency = 'INR' } = req.body;

        const options = {
          amount: amount * 100, // amount in smallest currency unit (paise)
          currency,
          receipt: `order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
      } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Verify payment endpoint
    app.post('/verify-payment', async (req, res) => {
      const { order_id, payment_id, signature } = req.body;

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${order_id}|${payment_id}`)
        .digest('hex');

      if (expectedSignature === signature) {
        // Payment is successful
        res.json({ success: true, message: 'Payment verified successfully' });
      } else {
        // Payment verification failed
        res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
}); 