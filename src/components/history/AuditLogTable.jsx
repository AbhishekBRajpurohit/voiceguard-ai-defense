// src/components/history/AuditLogTable.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function AuditLogTable() {
  const [searchTerm, setSearchTerm] = useState('');

  const mockAuditLogs = [
    { id: "CALL-98210", time: "2026-09-03 19:42", caller: "+91 98450 11029", type: "Wire Transfer (₹50k)", aiScore: "94.6% Deepfake", telephony: "OOB Rejected", decision: "BLOCK", dClass: "text-red-400" },
    { id: "CALL-98209", time: "2026-09-03 19:35", caller: "+91 80234 89201", type: "Balance Inquiry", aiScore: "98.2% Authentic", telephony: "STIR Verified", decision: "ALLOW", dClass: "text-emerald-400" },
    { id: "CALL-98208", time: "2026-09-03 19:28", caller: "+91 99001 44521", type: "VIP Credential Reset", aiScore: "Ambiguous (62%)", telephony: "CLI Spoof Flag", decision: "FLAG", dClass: "text-amber-400" },
    { id: "CALL-98207", time: "2026-09-03 19:15", caller: "+91 91234 56789", type: "Robocall Spam", aiScore: "99.1% Vocoder Bot", telephony: "Unverified", decision: "BLOCK", dClass: "text-red-400" },
    { id: "CALL-98206", time: "2026-09-03 19:02", caller: "+91 98765 43210", type: "Account Statement", aiScore: "97.5% Authentic", telephony: "STIR Verified", decision: "ALLOW", dClass: "text-emerald-400" }
  ];

  const filtered = mockAuditLogs.filter(l => 
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.caller.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.decision.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-black/40 border border-white/8 rounded-2xl p-4.5">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <i className="fa-solid fa-table-list"></i> Verification Audit Log History
        </h3>
        <div className="relative w-64">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Call ID, Caller, or Result..."
            className="w-full bg-[#111216] border border-white/12 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-zinc-500 text-[10px] uppercase">
              <th className="py-2.5 px-3 font-semibold">Call ID</th>
              <th className="py-2.5 px-3 font-semibold">Timestamp</th>
              <th className="py-2.5 px-3 font-semibold">Caller ID</th>
              <th className="py-2.5 px-3 font-semibold">Request Type</th>
              <th className="py-2.5 px-3 font-semibold">AI Score</th>
              <th className="py-2.5 px-3 font-semibold">Telephony</th>
              <th className="py-2.5 px-3 font-semibold">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-300">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-white/2 transition-colors">
                <td className="py-2.5 px-3 font-bold text-white">{log.id}</td>
                <td className="py-2.5 px-3">{log.time}</td>
                <td className="py-2.5 px-3">{log.caller}</td>
                <td className="py-2.5 px-3">{log.type}</td>
                <td className="py-2.5 px-3">{log.aiScore}</td>
                <td className="py-2.5 px-3">{log.telephony}</td>
                <td className="py-2.5 px-3 font-bold"><span className={log.dClass}>{log.decision}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
