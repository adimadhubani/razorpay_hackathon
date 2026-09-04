import IntentCapsule from '../models/IntentCapsule.js';
import AuditLog from '../models/AuditLog.js';
import { getIsDbConnected, getMemoryStore } from '../config/db.js';
import { generateIntentCapsule } from '../services/geminiService.js';

export const createIntent = async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.intent || req.body.policy || req.body.query || req.body.text;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field "prompt" (string).'
      });
    }

    // Call Gemini Service
    const result = await generateIntentCapsule(prompt);
    const capsuleData = result.capsule;

    const isDbConnected = getIsDbConnected();
    let savedCapsule = null;

    if (isDbConnected) {
      // Deactivate prior active capsules
      await IntentCapsule.updateMany({ isActive: true }, { isActive: false });
      savedCapsule = await IntentCapsule.create({
        ...capsuleData,
        isActive: true
      });
    } else {
      const store = getMemoryStore();
      savedCapsule = {
        _id: `capsule_mem_${Date.now()}`,
        ...capsuleData,
        completedTransactionsCount: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      store.activeCapsule = savedCapsule;
    }

    // Broadcast Socket.io event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('intent_created', {
        timestamp: new Date().toISOString(),
        capsule: savedCapsule,
        source: result.source
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Intent Capsule successfully generated and activated by IntentGuard Policy Engine',
      source: result.source,
      capsule: savedCapsule
    });
  } catch (err) {
    console.error('[Create Intent Error]', err);
    return res.status(500).json({
      success: false,
      error: `Failed to create intent capsule: ${err.message}`
    });
  }
};

export const getActiveIntent = async (req, res) => {
  try {
    const isDbConnected = getIsDbConnected();
    let capsule = null;

    if (isDbConnected) {
      capsule = await IntentCapsule.findOne({ isActive: true }).sort({ createdAt: -1 });
    } else {
      const store = getMemoryStore();
      capsule = store.activeCapsule;
    }

    if (!capsule) {
      // Create initial default capsule if none exists
      const defaultData = {
        userPrompt: 'Buy running shoes under ₹3000',
        maxBudget: 3000,
        allowedCategories: ['running shoes', 'footwear', 'sports apparel'],
        allowedCurrency: 'INR',
        requiresApprovalAbove: 2000,
        maxTransactions: 1
      };

      if (isDbConnected) {
        capsule = await IntentCapsule.create(defaultData);
      } else {
        capsule = {
          _id: 'capsule_mem_default',
          ...defaultData,
          completedTransactionsCount: 0,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        getMemoryStore().activeCapsule = capsule;
      }
    }

    return res.status(200).json({
      success: true,
      capsule
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getMetrics = async (req, res) => {
  try {
    const isDbConnected = getIsDbConnected();

    if (isDbConnected) {
      const logs = await AuditLog.find().sort({ timestamp: -1 });
      const totalEvaluations = logs.length;
      const allowedCount = logs.filter(l => l.decision === 'ALLOW').length;
      const stepUpCount = logs.filter(l => l.decision === 'REQUIRES_APPROVAL').length;
      const blockedCount = logs.filter(l => l.decision === 'BLOCKED').length;
      const promptInjectionsDetected = logs.filter(l => l.isPromptInjection).length;
      
      const totalBlockedAmount = logs
        .filter(l => l.decision === 'BLOCKED')
        .reduce((sum, l) => sum + (l.requestPayload?.amount || 0), 0);

      const avgRiskScore = totalEvaluations > 0
        ? Math.round(logs.reduce((sum, l) => sum + l.riskScore, 0) / totalEvaluations)
        : 0;

      return res.status(200).json({
        success: true,
        metrics: {
          totalEvaluations,
          allowedCount,
          stepUpCount,
          blockedCount,
          promptInjectionsDetected,
          totalBlockedAmount,
          avgRiskScore
        }
      });
    }

    const store = getMemoryStore();
    const logs = store.logs;
    const totalEvaluations = logs.length;
    const allowedCount = logs.filter(l => l.decision === 'ALLOW').length;
    const stepUpCount = logs.filter(l => l.decision === 'REQUIRES_APPROVAL').length;
    const blockedCount = logs.filter(l => l.decision === 'BLOCKED').length;
    const promptInjectionsDetected = logs.filter(l => l.isPromptInjection).length;
    const totalBlockedAmount = logs
      .filter(l => l.decision === 'BLOCKED')
      .reduce((sum, l) => sum + (l.requestPayload?.amount || 0), 0);
    const avgRiskScore = totalEvaluations > 0
      ? Math.round(logs.reduce((sum, l) => sum + l.riskScore, 0) / totalEvaluations)
      : 0;

    return res.status(200).json({
      success: true,
      metrics: {
        totalEvaluations,
        allowedCount,
        stepUpCount,
        blockedCount,
        promptInjectionsDetected,
        totalBlockedAmount,
        avgRiskScore
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
