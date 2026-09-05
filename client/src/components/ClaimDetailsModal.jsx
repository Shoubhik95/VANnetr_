import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, ShieldAlert, FileText, Printer, MapPin, AlertTriangle, Scale, Send, RefreshCw, XCircle, Check, Loader2, Sparkles, FileCheck, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Marker } from 'react-leaflet';

export default function ClaimDetailsModal({ claim, onClose, onActionSuccess }) {
  const [currentClaim, setCurrentClaim] = useState(claim);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);

  const [aiReasoningLoading, setAiReasoningLoading] = useState(false);
  const [aiReasoningResult, setAiReasoningResult] = useState(null);
  const [aiReasoningSource, setAiReasoningSource] = useState('');

  useEffect(() => {
    setCurrentClaim(claim);
  }, [claim]);

  if (!currentClaim) return null;

  const handlePrintAudit = () => {
    window.print();
  };

  const handleApplyAction = async (actionType) => {
    setActionLoading(true);
    const actionLabelMap = {
      'APPROVE': `Title Deed Granted & Registered for ${currentClaim.id}!`,
      'ORDER_RESURVEY': `Re-Survey Order Issued for ${currentClaim.id}!`,
      'ESCALATE_DLC': `Claim ${currentClaim.id} Escalated to District Level Committee (DLC)!`,
      'REJECT': `Administrative Rejection Order Recorded for ${currentClaim.id}.`
    };

    const actionText = actionLabelMap[actionType] || `Administrative Action ${actionType} Applied for ${currentClaim.id}!`;

    // Immediately update state visually inside modal so step 4 gets ✓ green checkmark!
    let updated;
    if (actionType === 'APPROVE') {
      updated = {
        ...currentClaim,
        status: 'Approved',
        currentStage: 'Title Granted',
        anomalyRisk: 'LOW',
        anomalies: [],
        anomalyDetails: 'Title Deed Granted & Registered by DLC Authority.',
        daysPending: 0
      };
    } else if (actionType === 'REJECT') {
      updated = {
        ...currentClaim,
        status: 'Rejected',
        currentStage: 'Rejected',
        daysPending: 0
      };
    } else if (actionType === 'ORDER_RESURVEY') {
      updated = {
        ...currentClaim,
        status: 'Pending',
        currentStage: 'SDLC',
        anomalyRisk: 'MEDIUM'
      };
    } else if (actionType === 'ESCALATE_DLC') {
      updated = {
        ...currentClaim,
        currentStage: 'DLC'
      };
    }
    if (updated) setCurrentClaim(updated);

    try {
      await fetch(`/api/claims/${currentClaim.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          notes: actionNotes || `Administrative decision executed from VanNetr Portal.`
        })
      }).catch(() => {});

      if (onActionSuccess) onActionSuccess(actionText, currentClaim.id, actionType);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.warn('Executing local administrative state update:', err);
      if (onActionSuccess) onActionSuccess(actionText, currentClaim.id, actionType);
      setTimeout(() => {
        onClose();
      }, 700);
    } finally {
      setActionLoading(false);
    }
  };

  const isApproved = currentClaim.status === 'Approved' || currentClaim.currentStage === 'Title Granted';

  const steps = [
    { title: 'Gram Sabha', stage: 'Gram Sabha', isCompleted: true },
    { title: 'Sub-Divisional (SDLC)', stage: 'SDLC', isCompleted: currentClaim.currentStage === 'SDLC' || currentClaim.currentStage === 'DLC' || isApproved },
    { title: 'District (DLC)', stage: 'DLC', isCompleted: isApproved || currentClaim.currentStage === 'Title Granted' },
    { title: 'Title Certificate', stage: 'Title Granted', isCompleted: isApproved }
  ];

  const getDocStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        );
      case 'Discrepancy':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Discrepancy
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Missing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            {status || 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative text-slate-800 overflow-hidden my-auto animate-fade-in">
        
        {/* Pinned Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-slate-50/70 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-mono font-bold text-white shadow-sm text-sm">
              FRA
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight">{currentClaim.id}</h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  currentClaim.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  currentClaim.status === 'Flagged Anomaly' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                  currentClaim.status === 'Rejected' ? 'bg-slate-100 text-slate-700 border border-slate-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {currentClaim.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Forest Rights Act Official Claim Record & Audit Docket</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintAudit}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Print Audit Sheet</span>
            </button>

            <button
              onClick={onClose}
              title="Close modal"
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Inner Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
          {/* Feedback Alert if Action Triggered */}
          {actionFeedback && (
            <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2.5 animate-fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* Timeline Progression Stepper */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">FRA Statutory Verification Lifecycle</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Stage: {currentClaim.currentStage}
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center relative pt-2">
              {/* Connector line behind steps */}
              <div className="absolute top-[22px] left-[12%] right-[12%] h-0.5 bg-slate-200 -z-0" />
              
              {steps.map((step, idx) => (
                <div key={step.title} className="flex flex-col items-center gap-1.5 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    step.isCompleted 
                      ? 'bg-emerald-600 text-white shadow-xs ring-4 ring-emerald-50' 
                      : currentClaim.currentStage === step.stage 
                      ? 'bg-amber-500 text-white animate-pulse ring-4 ring-amber-50' 
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}>
                    {step.isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 tracking-tight">{step.title}</span>
                  {currentClaim.currentStage === step.stage && currentClaim.daysPending > 0 && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono font-bold">
                      {currentClaim.daysPending}d Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Information 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Applicant & Location Metadata */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-150 pb-2.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Applicant & Parcel Profile
                </h3>
              </div>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Applicant Name:</span>
                  <span className="font-bold text-slate-900">{claim.applicantName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Claim Type:</span>
                  <span className="text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[11px]">{claim.applicantType}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Social Category:</span>
                  <span className="text-emerald-700 font-bold">{claim.category} (Scheduled Tribe / OTFD)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Gram Sabha & Block:</span>
                  <span className="text-slate-800 font-medium">{claim.gramSabha} <span className="text-slate-400">({claim.block})</span></span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">District & State:</span>
                  <span className="text-slate-800 font-medium">{claim.district}, {claim.state}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-500 font-medium">Claimed vs Mapped:</span>
                  <div className="font-mono text-xs font-bold">
                    <span className="text-slate-600">{claim.claimedAreaHa} Ha</span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{claim.mappedAreaHa} Ha</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Verification Checklist */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-150 pb-2.5">
                <FileCheck className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Statutory Evidence & Documents
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                {Object.entries(claim.documents || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-slate-50/70 rounded-lg border border-slate-200/80">
                    <span className="text-slate-700 capitalize text-xs font-medium">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {getDocStatusBadge(value)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Anomaly Analysis Banner */}
          {claim.anomalies && claim.anomalies.length > 0 && (
            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                  <span>AI Anomaly Flag & Ground GIS Discrepancy</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full border border-rose-300 font-bold uppercase">
                  {claim.anomalyRisk} RISK
                </span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed font-medium pl-6">
                {claim.anomalyDetails}
              </p>
            </div>
          )}

          {/* AI Reasoning Audit Block */}
          <div className="bg-gradient-to-r from-emerald-900/5 via-teal-900/5 to-slate-900/5 border border-emerald-200/80 rounded-xl p-5 space-y-3.5 shadow-2xs bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    AI Statutory & Spatial Reasoning Engine
                  </h3>
                  <p className="text-[11px] text-slate-500">Automated Legal & Spatial Compliance Engine</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  setAiReasoningLoading(true);
                  try {
                    const apiKey = localStorage.getItem('groq_api_key') || localStorage.getItem('gemini_api_key') || '';
                    const res = await fetch('/api/claim-reasoning', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ claim, apiKey })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setAiReasoningResult(data.reasoning);
                      setAiReasoningSource(data.source);
                    }
                  } catch (err) {
                    console.error('Failed to run AI reasoning:', err);
                  } finally {
                    setAiReasoningLoading(false);
                  }
                }}
                disabled={aiReasoningLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shrink-0"
              >
                {aiReasoningLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Analyzing Statutory Claim Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Run AI Statutory Reasoning</span>
                  </>
                )}
              </button>
            </div>

            {aiReasoningResult ? (
              <div className="bg-slate-50 border border-emerald-200/80 rounded-xl p-4 space-y-2.5 text-xs leading-relaxed text-slate-800 font-sans shadow-2xs animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1">
                  <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {aiReasoningSource}
                  </span>
                  <button
                    onClick={() => setAiReasoningResult(null)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Clear Analysis
                  </button>
                </div>

                {aiReasoningResult.split('\n').map((line, idx) => {
                  if (line.startsWith('### ')) {
                    return <h3 key={idx} className="text-xs font-extrabold text-emerald-900 mt-2 mb-1 uppercase tracking-wider">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('#### ')) {
                    return <h4 key={idx} className="text-xs font-bold text-teal-800 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
                  }
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                      <div key={idx} className="flex items-start gap-2 pl-2 text-[11px] py-0.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{line.substring(2)}</span>
                      </div>
                    );
                  }
                  return <p key={idx} className="text-slate-700 text-[11px]">{line}</p>;
                })}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Click <strong>"Run AI Statutory Reasoning"</strong> to analyze Section 3(1) evidence, OTFD 75-year rule compliance, sanctuary buffer distance, and receive automated DLC decision recommendations powered by AI.
                </span>
              </div>
            )}
          </div>

          {/* High-Resolution GPS Parcel Mini-Map */}
          {claim.coordinates && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">High-Resolution GPS Parcel GIS Map</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-500">
                  Lat: {claim.coordinates[0].toFixed(4)}, Lng: {claim.coordinates[1].toFixed(4)}
                </span>
              </div>
              
              <div className="h-56 rounded-lg overflow-hidden border border-slate-200 relative z-10 shadow-2xs">
                <MapContainer
                  center={claim.coordinates}
                  zoom={14}
                  style={{ width: '100%', height: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                  {claim.polygon && (
                    <Polygon
                      positions={claim.polygon}
                      pathOptions={{
                        color: claim.status === 'Flagged Anomaly' ? '#ef4444' : '#10b981',
                        fillColor: claim.status === 'Flagged Anomaly' ? '#ef4444' : '#10b981',
                        fillOpacity: 0.55,
                        weight: 3
                      }}
                    />
                  )}
                  <Marker position={claim.coordinates} />
                </MapContainer>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Official Administrative Action Bar */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 shrink-0 shadow-lg">
          <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between mb-2.5">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              Executive Decision & Case Actions
            </span>
            <span className="text-[10px] text-slate-400 font-medium">DLC / SDLC Authority Workflow</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px]">
              <input 
                type="text"
                placeholder="Optional executive rationale / administrative order notes..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleApplyAction('ORDER_RESURVEY')}
                disabled={actionLoading}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${actionLoading ? 'animate-spin' : ''}`} />
                <span>Order Re-Survey</span>
              </button>

              <button
                onClick={() => handleApplyAction('ESCALATE_DLC')}
                disabled={actionLoading}
                className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-teal-600" />
                <span>Escalate DLC</span>
              </button>

              <button
                onClick={() => handleApplyAction('REJECT')}
                disabled={actionLoading}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Reject</span>
              </button>

              <button
                onClick={() => handleApplyAction('APPROVE')}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Grant Title Deed</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


