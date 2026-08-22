import AuditLog from '../models/AuditLog.js';
import IntentCapsule from '../models/IntentCapsule.js';
import { getIsDbConnected, getMemoryStore } from '../config/db.js';
import { createRazorpayOrder } from '../config/razorpay.js';

export const processPayment = async (req, res) => {
  try {
    const riskAnalysis = req.riskAnalysis;
    const { capsule, paymentPayload, riskScore, decision, layer1Flags, layer2Flags, isPromptInjection, reason } = riskAnalysis;

    const isDbConnected = getIsDbConnected();
    const store = getMemoryStore();

    let razorpayOrderId = null;
    let razorpayOrderDetails = null;

    if (decision === 'ALLOW') {
      // Create Razorpay Order
      const rzpRes = await createRazorpayOrder(paymentPayload.amount, paymentPayload.currency || 'INR');
      razorpayOrderId = rzpRes.order.id;
      razorpayOrderDetails = rzpRes.order;

      // Update completed transaction counter on capsule
      if (isDbConnected && capsule._id) {
        await IntentCapsule.findByIdAndUpdate(capsule._id, {
          $inc: { completedTransactionsCount: 1 }
        });
      } else if (store.activeCapsule) {
        store.activeCapsule.completedTransactionsCount = (store.activeCapsule.completedTransactionsCount || 0) + 1;
      }
    }

    // Save Audit Log
    const auditData = {
      capsuleId: capsule._id || 'capsule_active',
      requestPayload: paymentPayload,
      riskScore,
      decision,
      layer1Flags,
      layer2Flags,
      isPromptInjection,
      reason,
      razorpayOrderId,
      status: decision === 'ALLOW' ? 'PROCESSED' : 'PENDING_APPROVAL',
      timestamp: new Date()
    };

    let logDoc = null;
    if (isDbConnected) {
      logDoc = await AuditLog.create(auditData);
    } else {
      logDoc = {
        _id: `log_mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...auditData
      };
      store.logs.unshift(logDoc);
    }

    // Emit Socket.io telemetry event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('telemetry_event', {
        type: decision === 'ALLOW' ? 'PAYMENT_ALLOWED' : 'STEP_UP_REQUIRED',
        timestamp: new Date().toISOString(),
        auditLog: logDoc,
        razorpayOrder: razorpayOrderDetails
      });
    }

    if (decision === 'ALLOW') {
      return res.status(200).json({
        success: true,
        message: 'Payment evaluated and authorized by IntentGuard Firewall',
        decision,
        riskScore,
        razorpayOrder: razorpayOrderDetails,
        riskAnalysis
      });
    }

    // REQUIRES_APPROVAL status -> Step-Up Authorization Required
    return res.status(202).json({
      success: true,
      message: 'Step-Up User Authorization Required',
      decision,
      riskScore,
      logId: logDoc._id,
      riskAnalysis
    });

  } catch (err) {
    console.error('[Payment Processing Error]', err);
    return res.status(500).json({
      success: false,
      error: `Payment processing error: ${err.message}`
    });
  }
};

export const approveStepUpPayment = async (req, res) => {
  try {
    const { logId } = req.body;
    if (!logId) {
      return res.status(400).json({
        success: false,
        error: 'Missing logId for step-up authorization.'
      });
    }

    const isDbConnected = getIsDbConnected();
    const store = getMemoryStore();

    let targetLog = null;
    if (isDbConnected) {
      targetLog = await AuditLog.findById(logId);
    } else {
      targetLog = store.logs.find(l => String(l._id) === String(logId));
    }

    if (!targetLog) {
      return res.status(404).json({
        success: false,
        error: 'Audit log entry not found for step-up authorization.'
      });
    }

    // Generate Razorpay Order upon manual approval
    const rzpRes = await createRazorpayOrder(targetLog.requestPayload.amount, targetLog.requestPayload.currency || 'INR');
    const orderId = rzpRes.order.id;

    targetLog.status = 'APPROVED';
    targetLog.razorpayOrderId = orderId;

    if (isDbConnected) {
      await targetLog.save();
    }

    // Emit socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('telemetry_event', {
        type: 'STEP_UP_APPROVED',
        timestamp: new Date().toISOString(),
        auditLog: targetLog,
        razorpayOrder: rzpRes.order
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment manually authorized by User. Razorpay Order generated.',
      razorpayOrder: rzpRes.order,
      auditLog: targetLog
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Step-up approval error: ${err.message}`
    });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const isDbConnected = getIsDbConnected();

    if (isDbConnected) {
      const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
      return res.status(200).json({ success: true, logs });
    }

    const store = getMemoryStore();
    return res.status(200).json({ success: true, logs: store.logs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
