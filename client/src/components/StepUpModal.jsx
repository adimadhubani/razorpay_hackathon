import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StepUpModal({ isOpen, stepUpData, onApprove, onReject, loading }) {
  if (!isOpen || !stepUpData) return null;

  const riskAnalysis = stepUpData.riskAnalysis || {};
  const payload = riskAnalysis.paymentPayload || {};
  const capsule = riskAnalysis.capsule || {};
  const riskScore = riskAnalysis.riskScore || 45;
  const layer1Flags = riskAnalysis.layer1Flags || [];
  const layer2Flags = riskAnalysis.layer2Flags || [];

  const handleAuthorize = async () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    onApprove(stepUpData.logId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      
      {/* Modal Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-medium tracking-wider text-amber-400 uppercase block">
              STEP-UP VERIFICATION REQUIRED
            </span>
            <h3 className="text-lg font-bold font-display text-zinc-100">
              User Approval Requested
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Autonomous AI Agent requested a payment exceeding automated trust bounds.
            </p>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-3 mb-4">
          
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
            <div>
              <span className="text-[10px] text-zinc-500 block font-mono">REQUESTED ITEM</span>
              <span className="text-sm font-semibold text-zinc-100">{payload.item}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 block font-mono">AMOUNT</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                ₹{payload.amount?.toLocaleString()} {payload.currency}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 block font-mono">MERCHANT</span>
              <span className="text-zinc-300">{payload.merchant || 'Verified Merchant'}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block font-mono">AUTO APPROVE CAP</span>
              <span className="text-zinc-300 font-mono">₹{capsule.requiresApprovalAbove?.toLocaleString()} INR</span>
            </div>
          </div>

        </div>

        {/* Risk Breakdown */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">RISK SCORE</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-900">
              {riskScore} / 100
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg space-y-1 text-xs">
            <span className="text-[10px] font-mono font-medium text-amber-400 block uppercase">TRIGGERED RULE FLAGS:</span>
            {[...layer1Flags, ...layer2Flags].map((flag, idx) => (
              <p key={idx} className="text-[11px] text-zinc-300 font-mono leading-tight">
                • {flag}
              </p>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReject}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-zinc-700/60"
          >
            <XCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>Deny</span>
          </button>

          <button
            type="button"
            onClick={handleAuthorize}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Authorizing...' : 'Authorize & Pay'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
