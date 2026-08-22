import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Header from '../components/Header';
import IntentCapsuleCard from '../components/IntentCapsuleCard';
import AttackSimulator from '../components/AttackSimulator';
import SecurityMetrics from '../components/SecurityMetrics';
import AuditConsole from '../components/AuditConsole';
import StepUpModal from '../components/StepUpModal';

const SOCKET_SERVER_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001' : '/';

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeCapsule, setActiveCapsule] = useState(null);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [metrics, setMetrics] = useState({
    totalEvaluations: 0,
    allowedCount: 0,
    stepUpCount: 0,
    blockedCount: 0,
    promptInjectionsDetected: 0,
    totalBlockedAmount: 0
  });
  const [logs, setLogs] = useState([]);
  const [loadingCapsule, setLoadingCapsule] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  
  // Step-Up Modal state
  const [isStepUpOpen, setIsStepUpOpen] = useState(false);
  const [stepUpData, setStepUpData] = useState(null);
  const [loadingApproval, setLoadingApproval] = useState(false);

  // Initialize Socket.io connection & Initial Data Fetching
  useEffect(() => {
    fetchActiveCapsule();
    fetchMetrics();
    fetchLogs();

    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to IntentGuard Telemetry Stream');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected from Telemetry Stream');
      setIsConnected(false);
    });

    socket.on('intent_created', (data) => {
      if (data.capsule) {
        setActiveCapsule(data.capsule);
      }
      fetchMetrics();
    });

    socket.on('telemetry_event', (event) => {
      console.log('[Socket.io Telemetry Event]', event);
      setLogs((prev) => [event, ...prev]);
      if (event.auditLog) {
        setLastEvaluation(event.auditLog);
      } else if (event.riskAnalysis) {
        setLastEvaluation(event.riskAnalysis);
      }
      fetchMetrics();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchActiveCapsule = async () => {
    try {
      const res = await fetch('/api/v1/intent/active');
      const data = await res.json();
      if (data.success && data.capsule) {
        setActiveCapsule(data.capsule);
      }
    } catch (err) {
      console.error('Failed to fetch active capsule:', err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/v1/metrics');
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/v1/logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
        if (data.logs.length > 0) {
          setLastEvaluation(data.logs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  // Generate Intent Capsule from Prompt
  const handleGenerateCapsule = async (userPrompt) => {
    setLoadingCapsule(true);
    try {
      const res = await fetch('/api/v1/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt })
      });
      const data = await res.json();
      if (data.success && data.capsule) {
        setActiveCapsule(data.capsule);
      }
    } catch (err) {
      console.error('Capsule creation error:', err);
    } finally {
      setLoadingCapsule(false);
    }
  };

  // Simulate Payment Evaluation
  const handleSimulatePayment = async (paymentPayload) => {
    setLoadingPayment(true);
    try {
      const res = await fetch('/api/v1/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });
      
      const data = await res.json();
      const riskAnalysis = data.riskAnalysis || {};
      setLastEvaluation(riskAnalysis);

      if (res.status === 202 && data.decision === 'REQUIRES_APPROVAL') {
        // Trigger Step-Up Modal
        setStepUpData({
          logId: data.logId,
          riskAnalysis
        });
        setIsStepUpOpen(true);
      }

      fetchMetrics();
      fetchLogs();
    } catch (err) {
      console.error('Payment evaluation error:', err);
    } finally {
      setLoadingPayment(false);
    }
  };

  // Manual Step-Up Approval
  const handleApproveStepUp = async (logId) => {
    setLoadingApproval(true);
    try {
      const res = await fetch('/api/v1/pay/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      });
      const data = await res.json();
      if (data.success) {
        setIsStepUpOpen(false);
        setStepUpData(null);
        fetchMetrics();
        fetchLogs();
      }
    } catch (err) {
      console.error('Step-up approval error:', err);
    } finally {
      setLoadingApproval(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      
      {/* Top Header */}
      <Header isConnected={isConnected} metrics={metrics} />

      {/* Main Security Operations Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top 3 Core Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Panel 1: Intent Policy Engine */}
          <div className="h-full">
            <IntentCapsuleCard
              activeCapsule={activeCapsule}
              onGenerateCapsule={handleGenerateCapsule}
              loading={loadingCapsule}
            />
          </div>

          {/* Panel 2: Agent & Attack Simulator */}
          <div className="h-full">
            <AttackSimulator
              activeCapsule={activeCapsule}
              onSimulatePayment={handleSimulatePayment}
              loading={loadingPayment}
            />
          </div>

          {/* Panel 3: Real-Time Risk Engine & Telemetry */}
          <div className="h-full">
            <SecurityMetrics
              lastEvaluation={lastEvaluation}
              metrics={metrics}
            />
          </div>

        </div>

        {/* Full-width Terminal Audit Stream */}
        <div className="w-full">
          <AuditConsole
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        </div>

      </main>

      {/* Step-Up User Authorization Modal */}
      <StepUpModal
        isOpen={isStepUpOpen}
        stepUpData={stepUpData}
        onApprove={handleApproveStepUp}
        onReject={() => setIsStepUpOpen(false)}
        loading={loadingApproval}
      />

    </div>
  );
}
