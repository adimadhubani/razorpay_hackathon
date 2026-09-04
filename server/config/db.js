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
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/intentguard';
  
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[MongoDB] Disconnected. Reverting to In-Memory Store.');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.warn(`[MongoDB Error] ${err.message}. Using In-Memory Store.`);
  });

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      bufferCommands: false
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${uri}`);
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB Notice] Local MongoDB instance not reachable (${err.message}). Seamlessly activated In-Memory Store fallback.`);
  }
};

export const getIsDbConnected = () => isConnected;
export const getMemoryStore = () => memoryStore;

