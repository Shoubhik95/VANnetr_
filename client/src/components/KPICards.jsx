import React from 'react';

export default function KPICards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4 font-sans">
      {/* Total Claims */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
        <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">TOTAL CLAIMS</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-slate-900 font-sans">{stats.totalClaims}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500 font-normal">Records in scope</div>
      </div>

      {/* Granted Titles */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
        <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">GRANTED TITLES</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-[#15803d] font-sans">{stats.approved}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[#15803d] font-medium">
          {stats.approvalRate}% recognition ({stats.grantedLandHa} Ha)
        </div>
      </div>

      {/* AI Anomalies */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
        <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">AI ANOMALIES</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-[#b45309] font-sans">{stats.flaggedAnomalies}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[#b45309] font-medium">Requires review</div>
      </div>

      {/* SLA Breaches */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
        <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">SLA BREACHES</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-[#b91c1c] font-sans">{stats.slaBreaches}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[#b91c1c] font-medium">Over 180 days</div>
      </div>

      {/* Land Mismatch */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
        <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">LAND MISMATCH</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-[#b91c1c] font-sans">{stats.landMismatches}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[#b91c1c] font-medium">Requires verification</div>
      </div>

      {/* Total Area */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
        <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">TOTAL AREA</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-slate-900 font-sans">{stats.totalLandHa}</span>
          <span className="text-xs font-bold text-slate-600">Ha</span>
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500 font-normal">Mapped GPS area</div>
      </div>
    </div>
  );
}

