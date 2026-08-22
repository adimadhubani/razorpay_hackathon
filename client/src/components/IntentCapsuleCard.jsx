import React, { useState } from 'react';
import { Sparkles, Shield, Layers, Code, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function IntentCapsuleCard({ activeCapsule, onGenerateCapsule, loading }) {
  const [promptInput, setPromptInput] = useState('');

  const presets = [
    'Buy Nike running shoes under ₹3000',
    'Book budget flight to Goa max ₹5000',
    'Purchase Python programming book below ₹1200',
    'Order pepperoni pizza under ₹800'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (promptInput.trim()) {
      onGenerateCapsule(promptInput);
    }
  };

  const handleSelectPreset = (presetText) => {
    setPromptInput(presetText);
    onGenerateCapsule(presetText);
  };

  return (
    <div className="card-panel p-6 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-300">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-zinc-100 tracking-tight">
                Policy Guardrail Engine
              </h2>
              <p className="text-xs text-zinc-400">Convert natural intent into strict JSON policy</p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
            Gemini Flash
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3 mb-5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>USER INTENT PROMPT</span>
              <span className="text-[10px] text-zinc-500 font-mono">NL Policy Input</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Buy running shoes under ₹3000"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/30 transition-colors font-sans pr-24"
              />
              <button
                type="submit"
                disabled={loading || !promptInput.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {loading ? (
                  <span className="text-zinc-200">Generating...</span>
                ) : (
                  <>
                    <span>Generate</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[10px] font-mono font-medium text-zinc-500 block mb-1.5 uppercase tracking-wider">
              PRESET POLICIES
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors text-left font-sans"
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Active Capsule Display */}
      <div className="pt-4 border-t border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            Active Intent Guardrail Policy
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            ENFORCED
          </span>
        </div>

        {activeCapsule ? (
          <div className="space-y-3">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 block font-mono">MAX BUDGET</span>
                <span className="text-xs font-bold text-zinc-100 font-mono">
                  ₹{activeCapsule.maxBudget?.toLocaleString()}
                </span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 block font-mono">STEP-UP LIMIT</span>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  ₹{activeCapsule.requiresApprovalAbove?.toLocaleString()}
                </span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 block font-mono">CURRENCY</span>
                <span className="text-xs font-bold text-sky-400 font-mono">
                  {activeCapsule.allowedCurrency}
                </span>
              </div>
            </div>

            {/* Allowed Categories */}
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 block font-mono mb-1.5 flex items-center gap-1">
                <Layers className="w-3 h-3 text-zinc-400" />
                ALLOWED CATEGORIES
              </span>
              <div className="flex flex-wrap gap-1">
                {activeCapsule.allowedCategories?.map((cat, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Raw JSON Drawer */}
            <details className="group bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden text-xs">
              <summary className="px-3 py-2 cursor-pointer font-mono text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center justify-between select-none">
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-zinc-500" />
                  View Intent Capsule Policy JSON
                </span>
                <span className="text-[10px] text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <pre className="p-3 bg-zinc-950 text-zinc-300 font-mono-code text-[11px] overflow-x-auto border-t border-zinc-900 leading-relaxed">
                {JSON.stringify(activeCapsule, null, 2)}
              </pre>
            </details>

          </div>
        ) : (
          <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-center text-zinc-500 text-xs">
            No active policy set. Generate an intent policy above.
          </div>
        )}
      </div>

    </div>
  );
}
