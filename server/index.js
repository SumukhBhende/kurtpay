import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import authRouter from './auth.js';
import { MongoClient } from 'mongodb';

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

let client;
let retryCount = 0;
const MAX_RETRIES = 3;

async function connectDB() {
  try {
    if (!client) {
      console.log('Creating new MongoDB client...');
      client = new MongoClient(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
    }

    console.log('Connecting to local MongoDB...');
    await client.connect();
    
    // Test the connection with explicit database selection
    const db = client.db('ktkar');
    await db.command({ ping: 1 });
    console.log('Successfully connected to local MongoDB');
    
    // Ensure maintron collection exists
    const collections = await db.listCollections({ name: 'maintron' }).toArray();
    if (collections.length === 0) {
      console.log('Creating maintron collection...');
      await db.createCollection('maintron');
      console.log('Successfully created maintron collection');
    } else {
      console.log('Successfully accessed maintron collection');
    }
    
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    });
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to local MongoDB. Please make sure MongoDB is running on your machine.');
      console.error('Try running: mongod --dbpath /path/to/data/db');
    }
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      return connectDB();
    }
    
    throw error;
  }
}

// Connect to MongoDB before starting the server
connectDB()
  .then(mongoClient => {
    // Make the client available to routes
    app.locals.mongoClient = mongoClient;

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
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
}); 