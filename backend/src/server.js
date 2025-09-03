// backend/server.js
import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import helmet from 'helmet';
import dotenv from 'dotenv'
import { generalLimiter, authLimiter } from './middleware/rateLimit.js';
import swaggerUi from 'swagger-ui-express';
let swaggerFile;
(async () => {
  swaggerFile = (await import('./swagger-output.json', {
    assert: { type: 'json' }
  })).default;
})();
dotenv.config();

import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import dashboardRoutes from './routes/dashboard.js';
import analytics from './routes/analytics.js';
import exportRoutes from './routes/export.js';
import budgets from './routes/budgets.js';



const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Health check - moved before other routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});
app.use('/api/auth/', authLimiter);
app.use('/api/', generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analytics);
app.use('/api/export', exportRoutes);
// app.use('/api/budgets', budgets);

// Error handling middleware - must come last
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection with improved error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();