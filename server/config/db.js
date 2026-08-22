import mongoose from 'mongoose';

let isConnected = false;
let memoryStore = {
  activeCapsule: null,
  logs: [],
  metrics: {
    totalEvaluations: 0,
    allowedCount: 0,
    stepUpCount: 0,
    blockedCount: 0,
    promptInjectionsDetected: 0,
    totalBlockedAmount: 0
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/intentguard';
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${uri}`);
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB (${err.message}). Using resilient In-Memory Store fallback.`);
  }
};

export const getIsDbConnected = () => isConnected;
export const getMemoryStore = () => memoryStore;
