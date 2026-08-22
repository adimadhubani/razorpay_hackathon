import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export default function AuditConsole({ logs, onClearLogs }) {
  const [filterType, setFilterType] = useState('ALL');
  const scrollRef = useRef(null);

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'BLOCKED') return log.decision === 'BLOCKED' || log.type === 'FIREWALL_BLOCKED';
    if (filterType === 'REQUIRES_APPROVAL') return log.decision === 'REQUIRES_APPROVAL' || log.type === 'STEP_UP_REQUIRED';
    if (filterType === 'ALLOW') return log.decision === 'ALLOW' || log.type === 'PAYMENT_ALLOWED';
    return true;
  });

  // Auto scroll terminal on new log stream items
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className="card-panel p-6 flex flex-col h-full">
      
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
            <Terminal className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-zinc-100 tracking-tight">
              Real-Time Security Audit Stream
            </h3>
            <p className="text-xs text-zinc-400">Live Socket.io event feed broadcasted to client</p>
          </div>
        </div>

        {/* Console Actions & Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            {['ALL', 'ALLOW', 'REQUIRES_APPROVAL', 'BLOCKED'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 rounded font-mono text-[10px] font-medium transition-colors ${
                  filterType === type
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors"
            title="Clear Log Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={scrollRef}
        className="flex-1 bg-zinc-950 rounded-lg border border-zinc-800/90 p-4 font-mono-code text-xs overflow-y-auto max-h-[380px] space-y-2"
      >
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, index) => {
            const timeStr = new Date(log.timestamp || Date.now()).toLocaleTimeString();
            const decision = log.decision || log.auditLog?.decision || log.riskAnalysis?.decision;
            const riskScore = log.riskScore ?? log.auditLog?.riskScore ?? log.riskAnalysis?.riskScore ?? 0;
            const item = log.requestPayload?.item || log.auditLog?.requestPayload?.item || log.riskAnalysis?.paymentPayload?.item;
            const amount = log.requestPayload?.amount || log.auditLog?.requestPayload?.amount || log.riskAnalysis?.paymentPayload?.amount;
            const currency = log.requestPayload?.currency || log.auditLog?.requestPayload?.currency || log.riskAnalysis?.paymentPayload?.currency || 'INR';

            return (
              <div
                key={log._id || index}
                className="p-3 rounded-md bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors space-y-1.5"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">{timeStr}</span>
                    <span className="text-sky-400 font-semibold">[{log.type || 'EVENT_EVALUATED'}]</span>
                  </div>

                  {decision && (
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Risk: <strong className="text-zinc-200">{riskScore}/100</strong></span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        decision === 'BLOCKED'
                          ? 'bg-rose-950 text-rose-300 border-rose-900'
                          : decision === 'REQUIRES_APPROVAL'
                          ? 'bg-amber-950 text-amber-300 border-amber-900'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-900'
                      }`}>
                        {decision}
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Summary Body */}
                {item && (
                  <div className="text-zinc-300 text-[11px] flex items-center justify-between">
                    <span className="font-semibold text-zinc-100">Item: {item}</span>
                    <span className="font-mono text-zinc-400">Amount: ₹{amount?.toLocaleString()} {currency}</span>
                  </div>
                )}

                {/* Reason Text */}
                <div className="text-[11px] text-zinc-400 leading-snug">
                  {log.reason || log.auditLog?.reason || log.riskAnalysis?.reason || JSON.stringify(log)}
                </div>

                {/* Razorpay Order ID */}
                {(log.razorpayOrderId || log.auditLog?.razorpayOrderId) && (
                  <div className="text-[10px] text-emerald-400 font-mono">
                    ✓ Razorpay Order Generated: {log.razorpayOrderId || log.auditLog?.razorpayOrderId}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="h-44 flex flex-col items-center justify-center text-zinc-600 space-y-2">
            <Terminal className="w-6 h-6 opacity-40" />
            <span className="text-xs font-mono">No audit telemetry logged yet. Execute a payment check to view live stream.</span>
          </div>
        )}
      </div>

    </div>
  );
}
