import React from 'react';
import { ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';

export default function Header({ isConnected, metrics }) {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & System Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-600/10 border border-sky-500/20 text-sky-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-1.5">
              <span>Razorpay</span>
              <span className="text-zinc-400 font-normal">/</span>
              <span className="text-sky-400 font-medium">IntentGuard</span>
            </h1>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
              SANDBOX / TEST MODE
            </span>
          </div>
        </div>

        {/* Status Indicators & Live Telemetry Badge */}
        <div className="flex items-center gap-3">
          
          {/* Socket.io Telemetry Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-800 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-zinc-400 font-mono text-[11px] font-medium">
              {isConnected ? 'STREAMING: LIVE' : 'TELEMETRY: CONNECTING'}
            </span>
          </div>

          {/* AI Engines Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono text-[11px]">Gemini 1.5 Flash + Llama 3.3 70B</span>
          </div>

          {/* Active Defense Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>FIREWALL ACTIVE</span>
          </div>

        </div>

      </div>
    </header>
  );
}
