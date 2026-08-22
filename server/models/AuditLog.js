import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  capsuleId: {
    type: String,
    required: true
  },
  requestPayload: {
    item: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    category: { type: String, required: true },
    merchant: { type: String, default: 'Unknown Merchant' },
    promptContext: { type: String, default: '' }
  },
  riskScore: {
    type: Number,
    required: true
  },
  decision: {
    type: String,
    enum: ['ALLOW', 'REQUIRES_APPROVAL', 'BLOCKED'],
    required: true
  },
  layer1Flags: [{
    type: String
  }],
  layer2Flags: [{
    type: String
  }],
  isPromptInjection: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    required: true
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['PROCESSED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
    default: 'PROCESSED'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
