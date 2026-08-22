import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Cpu, CheckCircle2, Zap, Ban, XCircle, Activity } from 'lucide-react';

export default function SecurityMetrics({ lastEvaluation, metrics }) {
  const riskScore = lastEvaluation ? lastEvaluation.riskScore : 0;
  const decision = lastEvaluation ? lastEvaluation.decision : 'ALLOW';
  const isPromptInjection = lastEvaluation ? lastEvaluation.isPromptInjection : false;
  const layer1Flags = lastEvaluation?.layer1Flags || [];
  const layer2Flags = lastEvaluation?.layer2Flags || [];
  const reason = lastEvaluation?.reason || 'Firewall standing by for agent payload evaluation.';

  const getDecisionBadge = () => {
    if (decision === 'BLOCKED') {
      return {
        bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />
      };
    }
    if (decision === 'REQUIRES_APPROVAL') {
      return {
        bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
      };
    }
    return {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    };
  };

  const badgeStyle = getDecisionBadge();

  return (
    <div className="card-panel p-6 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-zinc-100 tracking-tight">
                Firewall Decision & Risk Telemetry
              </h2>
              <p className="text-xs text-zinc-400">Dual-Layer (Deterministic JS + Llama 3.3 70B)</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
            Groq Llama 3.3 70B
          </span>
        </div>

        {/* Clean Visual Decision & Risk Score Block */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 mb-4">
          
          <div className="flex items-center justify-between">
            {/* Status Badge */}
            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border ${badgeStyle.bg}`}>
              {badgeStyle.icon}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider">{decision}</span>
              </div>
            </div>

            {/* Risk Score Pill */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">RISK SCORE:</span>
              <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded border ${
                riskScore > 60 ? 'bg-rose-950 text-rose-400 border-rose-900' :
                riskScore >= 30 ? 'bg-amber-950 text-amber-400 border-amber-900' :
                'bg-emerald-950 text-emerald-400 border-emerald-900'
              }`}>
                {riskScore} / 100
              </span>
            </div>
          </div>

          {/* Reason Statement */}
          <div className="text-xs text-zinc-300 font-sans leading-relaxed pt-1">
            {reason}
          </div>

          {/* Latency & Metadata Row */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-900">
            <span className="flex items-center gap-1 text-zinc-400">
              <Zap className="w-3 h-3 text-amber-400" />
              Eval Latency: {lastEvaluation?.evalTimeMs || 42}ms
            </span>

            {lastEvaluation?.razorpayOrderId && (
              <span className="text-emerald-400 font-mono">
                Order ID: {lastEvaluation.razorpayOrderId}
              </span>
            )}
          </div>

        </div>

        {/* Prompt Injection Warning Banner if intercepted */}
        {isPromptInjection && (
          <div className="px-3.5 py-2.5 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2.5 mb-4">
            <Ban className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-medium">Intercepted: Indirect Prompt Injection Attack Signature!</span>
          </div>
        )}

        {/* Triggered Security Rules List */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] font-mono font-medium text-zinc-500 block uppercase tracking-wider">
            TRIGGERED RULE BREAKDOWN
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {/* Layer 1 Deterministic Rules */}
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/90">
              <span className="text-[10px] font-mono text-zinc-400 block mb-2 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                LAYER 1 (DETERMINISTIC JS)
              </span>
              {layer1Flags.length > 0 ? (
                <ul className="space-y-1">
                  {layer1Flags.map((flag, idx) => (
                    <li key={idx} className="text-[11px] text-zinc-300 font-mono leading-snug bg-zinc-900/80 p-1.5 rounded border border-zinc-800">
                      {flag}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[11px] text-emerald-400 font-mono">✓ Passed all Layer 1 limits.</span>
              )}
            </div>

            {/* Layer 2 Groq LLM Rules */}
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/90">
              <span className="text-[10px] font-mono text-zinc-400 block mb-2 flex items-center gap-1.5 font-medium">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                LAYER 2 (GROQ LLAMA 3.3 70B)
              </span>
              {layer2Flags.length > 0 ? (
                <ul className="space-y-1">
                  {layer2Flags.map((flag, idx) => (
                    <li key={idx} className="text-[11px] text-rose-300 font-mono leading-snug bg-rose-950/30 p-1.5 rounded border border-rose-900/60">
                      {flag}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[11px] text-emerald-400 font-mono">✓ Zero prompt injection detected.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Statistics Footer */}
      <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 block font-mono">TOTAL EVALS</span>
          <span className="text-xs font-bold text-zinc-100 font-mono">{metrics?.totalEvaluations || 0}</span>
        </div>
        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 block font-mono">ATTACKS BLOCKED</span>
          <span className="text-xs font-bold text-rose-400 font-mono">{metrics?.blockedCount || 0}</span>
        </div>
        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 block font-mono">INJECTIONS CAUGHT</span>
          <span className="text-xs font-bold text-purple-400 font-mono">{metrics?.promptInjectionsDetected || 0}</span>
        </div>
        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 block font-mono">FUNDS SAVED</span>
          <span className="text-xs font-bold text-emerald-400 font-mono">₹{(metrics?.totalBlockedAmount || 0).toLocaleString()}</span>
        </div>
      </div>

    </div>
  );
}
