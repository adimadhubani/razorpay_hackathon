import express from 'express';
import { createIntent, getActiveIntent, getMetrics } from '../controllers/intentController.js';
import { processPayment, approveStepUpPayment, getAuditLogs } from '../controllers/paymentController.js';
import { intentGuard } from '../middleware/intentGuard.js';

const router = express.Router();

// Intent Guardrail Policy Routes
router.post('/intent', createIntent);
router.get('/intent/active', getActiveIntent);

// Payment & Security Firewall Routes
router.post('/pay', intentGuard, processPayment);
router.post('/pay/approve', approveStepUpPayment);

// Audit & Telemetry Metrics Routes
router.get('/logs', getAuditLogs);
router.get('/metrics', getMetrics);

export default router;
