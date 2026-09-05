import React from 'react';
import { Trees, ShieldAlert, FileSpreadsheet, Search, RefreshCw, Sparkles, Filter, LogOut, UserCheck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function Header({ 
  selectedState, 
  setSelectedState, 
  selectedDistrict, 
  setSelectedDistrict, 
  selectedStatus,
  setSelectedStatus,
  searchTerm, 
  setSearchTerm,
  onRefresh,
  activeTab,
  setActiveTab
}) {
  const { officerProfile, logout } = useAuth();

  const defaultStates = [
    'All', 'Odisha', 'Chhattisgarh', 'Madhya Pradesh', 'Maharashtra', 'Jharkhand',
    'Andhra Pradesh', 'Telangana', 'Tripura', 'Gujarat', 'Rajasthan', 'Karnataka', 
    'Kerala', 'Tamil Nadu', 'Assam', 'West Bengal'
  ];
  
  const states = defaultStates.includes(selectedState) 
    ? defaultStates 
    : [...defaultStates, selectedState];
  
  const districtsMap = {
    'All': ['All', 'Mayurbhanj', 'Sundargarh', 'Koraput', 'Kandhamal', 'Bastar', 'Kanker', 'Dantewada', 'Mandla', 'Dindori', 'Gadchiroli', 'Bapatla', 'Alluri Sitharama Raju', 'Khammam', 'Karbi Anglong'],
    'Odisha': ['All', 'Mayurbhanj', 'Sundargarh', 'Koraput', 'Kandhamal'],
    'Chhattisgarh': ['All', 'Bastar', 'Kanker', 'Dantewada'],
    'Madhya Pradesh': ['All', 'Mandla', 'Dindori'],
    'Maharashtra': ['All', 'Gadchiroli'],
    'Jharkhand': ['All', 'Ranchi', 'West Singhbhum'],
    'Andhra Pradesh': ['All', 'Bapatla', 'Alluri Sitharama Raju', 'Manyam', 'Parvathipuram'],
    'Telangana': ['All', 'Khammam', 'Bhadradri Kothagudem', 'Adilabad'],
    'Assam': ['All', 'Karbi Anglong', 'Dima Hasao', 'Kokrajhar']
  };

  const baseDistricts = districtsMap[selectedState] || ['All'];
  const availableDistricts = (selectedDistrict !== 'All' && !baseDistricts.includes(selectedDistrict))
    ? [...baseDistricts, selectedDistrict]
    : baseDistricts;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-[900] shadow-xs transition-all w-full overflow-hidden">
      {/* Top Header Bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs">
          {/* Left Branding */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-[#064e3b] text-white font-extrabold text-[11px] px-2 py-0.5 rounded shadow-xs tracking-wider">
              VN
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">VanNetr</span>
            <span className="text-slate-300 font-light hidden xs:inline">|</span>
            <span className="text-slate-500 font-medium text-[11.5px] hidden sm:inline">
              Forest Rights Act Decision Support System
            </span>
          </div>

          {/* Right Officer Status & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11.5px] shrink-0">
            <span className="text-slate-500 font-medium hidden lg:inline">
              MoTA & State Forest Departments
            </span>
            <span className="text-slate-300 hidden lg:inline">•</span>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-slate-800 truncate max-w-[130px] sm:max-w-[200px]">
                {officerProfile?.fullName || 'Dr. V. Sharma, IFS'}
              </span>
              <span className="bg-slate-100 text-slate-600 border border-gray-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                OFFICER
              </span>
            </div>

            <button 
              onClick={logout}
              className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer transition-colors shrink-0 ml-1 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 shadow-2xs"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Header Navigation & Control Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-1.5 rounded-lg text-xs transition-all font-semibold cursor-pointer ${
              activeTab === 'map' 
                ? 'bg-[#064e3b] text-white font-bold shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            WebGIS Atlas
          </button>

          <button 
            onClick={() => setActiveTab('anomalies')}
            className={`px-3.5 py-1.5 rounded-lg text-xs transition-all font-semibold cursor-pointer ${
              activeTab === 'anomalies' 
                ? 'bg-[#064e3b] text-white font-bold shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            AI Anomalies
          </button>

          <button 
            onClick={() => setActiveTab('briefing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs transition-all font-semibold cursor-pointer ${
              activeTab === 'briefing' 
                ? 'bg-[#064e3b] text-white font-bold shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Decision Matrix
          </button>
        </div>

        {/* Global Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-medium text-[11.5px]">Scope:</span>

          {/* State Selector */}
          <select 
            value={selectedState} 
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('All');
            }}
            className="bg-white border border-gray-300 text-slate-800 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-emerald-600 transition-colors cursor-pointer shadow-2xs"
          >
            {states.map(s => <option key={s} value={s}>State: {s}</option>)}
          </select>

          {/* District Selector */}
          <select 
            value={selectedDistrict} 
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-white border border-gray-300 text-slate-800 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-emerald-600 transition-colors cursor-pointer shadow-2xs"
          >
            {availableDistricts.map(d => <option key={d} value={d}>District: {d}</option>)}
          </select>

          {/* Status Filter */}
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-gray-300 text-slate-800 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-emerald-600 transition-colors cursor-pointer shadow-2xs"
          >
            <option value="All">Status: All</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Flagged Anomaly">Flagged Anomaly</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search ID / Claimant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-300 text-slate-800 text-xs rounded px-2.5 py-1 w-36 sm:w-44 focus:outline-none focus:border-emerald-600 placeholder-gray-400 shadow-2xs"
            />
          </div>

          <button 
            onClick={onRefresh}
            title="Refresh Data"
            className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 rounded text-xs transition-colors cursor-pointer flex items-center gap-1 font-medium shadow-2xs"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
}
