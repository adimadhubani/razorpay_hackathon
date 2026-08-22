import mongoose from 'mongoose';

const IntentCapsuleSchema = new mongoose.Schema({
  userPrompt: {
    type: String,
    required: true
  },
  maxBudget: {
    type: Number,
    required: true
  },
  allowedCategories: [{
    type: String,
    required: true
  }],
  allowedCurrency: {
    type: String,
    default: 'INR'
  },
  requiresApprovalAbove: {
    type: Number,
    required: true
  },
  maxTransactions: {
    type: Number,
    default: 1
  },
  completedTransactionsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.IntentCapsule || mongoose.model('IntentCapsule', IntentCapsuleSchema);
