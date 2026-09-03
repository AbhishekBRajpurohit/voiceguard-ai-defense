// src/pages/Dashboard.jsx
import React from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import AuditLogTable from '../components/history/AuditLogTable';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-5">
      {/* Executive System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/8 text-white grid place-items-center text-lg">
            <Activity size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400">Total Checks Performed</span>
            <strong className="text-lg font-bold text-white my-0.5">14,280</strong>
            <small className="text-[10px] text-emerald-400 font-semibold">+12.4% this week</small>
          </div>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 grid place-items-center text-lg">
            <CheckCircle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400">Calls Allowed</span>
            <strong className="text-lg font-bold text-white my-0.5">88.4%</strong>
            <small className="text-[10px] text-zinc-500">12,624 Clean Authentications</small>
          </div>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 grid place-items-center text-lg">
            <AlertTriangle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400">Calls Flagged</span>
            <strong className="text-lg font-bold text-white my-0.5">7.2%</strong>
            <small className="text-[10px] text-zinc-500">1,028 Secondary Challenges</small>
          </div>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 grid place-items-center text-lg">
            <XCircle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400">Deepfakes Blocked</span>
            <strong className="text-lg font-bold text-white my-0.5">4.4%</strong>
            <small className="text-[10px] text-zinc-500">628 Intercepted Attacks</small>
          </div>
        </div>
      </div>

      {/* Paginated Searchable Audit Log Table */}
      <AuditLogTable />
    </div>
  );
}
