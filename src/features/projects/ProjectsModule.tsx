import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, Client } from '../../types';
import { 
  Briefcase, Calendar, ShieldAlert, CheckCircle2, 
  TrendingUp, Clock, FileText, AlertCircle, Sparkles 
} from 'lucide-react';

type ProjectStage = 'survey' | 'cabling' | 'noc_activation' | 'uat' | 'billing_active';

export const ProjectsModule: React.FC = () => {
  const { projects, clients, currentUser } = useApp();

  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const clientOfProject = clients.find(c => c.id === selectedProject?.clientId);

  const stages: { value: ProjectStage; label: string; desc: string; targetDays: number }[] = [
    { value: 'survey', label: 'Site Survey', desc: 'Onsite infrastructure measurement and structural feasibility', targetDays: 5 },
    { value: 'cabling', label: 'Cabling Trunking', desc: 'Pulling fiber core cables from nearest Telekom DP box', targetDays: 7 },
    { value: 'noc_activation', label: 'NOC Routing', desc: 'IP routing assignment, router ping test, bandwidth allocation', targetDays: 4 },
    { value: 'uat', label: 'UAT Acceptance', desc: 'Customer signoff testing speed limits and packet drop logs', targetDays: 3 },
    { value: 'billing_active', label: 'Active Lease', desc: 'Contract terms locked, monthly recurring billing active', targetDays: 30 }
  ];

  const getStageBadge = (stage: ProjectStage) => {
    switch (stage) {
      case 'survey': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cabling': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'noc_activation': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'uat': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'billing_active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStageIndex = (stage: ProjectStage) => {
    return stages.findIndex(s => s.value === stage);
  };

  const activeStageIndex = selectedProject ? getStageIndex(selectedProject.stage || 'survey') : -1;

  const getSlaCountdown = (project: Project) => {
    if ((project.stage || 'survey') === 'billing_active') {
      return { label: 'SLA Succeeded', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 border' };
    }
    const today = new Date('2026-07-01');
    const target = new Date(project.targetDeliveryDate || '2026-07-15');
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: `SLA Delayed by ${Math.abs(diffDays)}d`, color: 'bg-rose-50 text-rose-700 border-rose-200 border font-semibold animate-pulse' };
    } else if (diffDays <= 3) {
      return { label: `SLA Warning: ${diffDays}d left`, color: 'bg-amber-50 text-amber-700 border-amber-200 border font-semibold animate-pulse' };
    } else {
      return { label: `${diffDays} days remaining`, color: 'bg-indigo-50 text-indigo-700 border-indigo-200 border' };
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    if (stageFilter === 'all') return true;
    if (stageFilter === 'risk') return p.isRenewalRisk;
    return p.stage === stageFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top statistics banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4 text-xs">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Active Deployments</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {projects.filter(p => p.stage !== 'billing_active').length} projects
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4 text-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">Completed / Active Leases</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {projects.filter(p => p.stage === 'billing_active').length} contracts
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4 text-xs">
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="font-bold text-gray-400 uppercase tracking-wider text-[9px]">SLA / Churn Risks</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {projects.filter(p => p.isRenewalRisk).length} accounts
            </p>
          </div>
        </div>
      </div>

      {/* Main projects board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-xs">
        {/* Left projects roster */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Deployment Portfolios</h3>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-[11px] rounded px-2.5 py-1"
            >
              <option value="all">All stages</option>
              <option value="survey">Site Survey</option>
              <option value="cabling">Cabling Trunk</option>
              <option value="noc_activation">NOC Active</option>
              <option value="uat">UAT Testing</option>
              <option value="billing_active">Active Billing</option>
              <option value="risk">Churn Risks</option>
            </select>
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {filteredProjects.map((p) => {
              const client = clients.find(c => c.id === p.clientId);
              const isSelected = selectedProjectId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`p-4 cursor-pointer hover:bg-slate-50/50 transition-all space-y-2.5 ${
                    isSelected ? 'bg-brand-50/20 border-l-4 border-brand-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-gray-400">{p.id}</span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${getStageBadge(p.stage || 'survey')}`}>
                      {(p.stage || 'survey').replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 truncate">{p.title}</h4>
                    <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{client?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Deployment SLA progress</span>
                      <span className="font-bold text-brand-600">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-600 h-full transition-all duration-500" 
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                  {p.isRenewalRisk && (
                    <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-150 px-2 py-0.5 rounded font-bold animate-pulse inline-block">
                      SLA RISK: Churn Potential
                    </span>
                  )}
                </div>
              );
            })}
            {filteredProjects.length === 0 && (
              <p className="text-center py-12 text-gray-400">No project portfolios found matching filter.</p>
            )}
          </div>
        </div>

        {/* Right timeline stage stepper & Lock-in monitoring */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProject ? (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-6">
              {/* Header block */}
              <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
                <div>
                  <span className="font-mono text-gray-400 font-bold">{selectedProject.id}</span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">{selectedProject.title}</h3>
                  <p className="text-xs text-brand-600 font-bold mt-1">{clientOfProject?.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-mono px-2.5 py-1 rounded-md inline-block font-semibold">
                    Owner: {selectedProject.owner}
                  </span>
                </div>
              </div>

              {/* Project Time & SLA Analytics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-500 font-semibold uppercase tracking-wider text-[9px]">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>Deployment Lead Time</span>
                  </div>
                  <div className="text-base font-black text-gray-900">
                    {selectedProject.daysElapsed} <span className="text-[11px] font-normal text-gray-500">days elapsed</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          (selectedProject.daysElapsed || 0) > (selectedProject.slaLimitDays || 25) ? 'bg-rose-600' :
                          (selectedProject.daysElapsed || 0) > (selectedProject.slaLimitDays || 25) * 0.8 ? 'bg-amber-500' : 'bg-brand-600'
                        }`} 
                        style={{ width: `${Math.min(100, ((selectedProject.daysElapsed || 0) / (selectedProject.slaLimitDays || 25)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Limit: {selectedProject.slaLimitDays} days</span>
                      <span>{Math.round(((selectedProject.daysElapsed || 0) / (selectedProject.slaLimitDays || 25)) * 100)}% Used</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 border-t sm:border-t-0 sm:border-x border-slate-200 pt-3 sm:pt-0 sm:px-4">
                  <div className="flex items-center gap-1.5 text-gray-500 font-semibold uppercase tracking-wider text-[9px]">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>SLA RFS Target Date</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900">
                    {selectedProject.targetDeliveryDate || '2026-07-15'}
                  </div>
                  <div>
                    {(() => {
                      const countdown = getSlaCountdown(selectedProject);
                      return (
                        <span className={`inline-block text-[10px] px-2 py-0.5 font-bold rounded mt-0.5 ${countdown.color}`}>
                          {countdown.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 sm:pl-4">
                  <div className="flex items-center gap-1.5 text-gray-500 font-semibold uppercase tracking-wider text-[9px]">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Stage Bottleneck Clock</span>
                  </div>
                  <div className="text-base font-black text-rose-700">
                    {selectedProject.daysInStage} <span className="text-[11px] font-normal text-gray-500">days in stage</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Current Action: <span className="text-slate-700 font-medium">{selectedProject.nextAction}</span>
                  </p>
                </div>
              </div>

              {/* Physical Deployment Stepper with Timelines */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-brand-950 uppercase tracking-widest">Physical Deployment Stepper</h4>
                  <span className="text-[10px] text-gray-400 font-medium">SLA Target vs. Actual Duration</span>
                </div>
                <div className="relative pl-6 space-y-6 border-l-2 border-brand-100 ml-3 py-1">
                  {stages.map((stage, idx) => {
                    const isDone = idx < activeStageIndex;
                    const isActive = idx === activeStageIndex;
                    const isFuture = idx > activeStageIndex;

                    const actualDays = selectedProject.cycleTimes?.[stage.value];
                    const targetDays = stage.targetDays;

                    return (
                      <div key={stage.value} className="relative">
                        {/* Bullet point */}
                        <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone ? 'bg-brand-600 border-brand-600 text-white' :
                          isActive ? 'bg-white border-brand-600 text-brand-600 ring-4 ring-brand-50' :
                          'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {isDone && <span className="text-[8px] font-bold">✓</span>}
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-1">
                          <div className="space-y-0.5">
                            <p className={`font-bold ${
                              isActive ? 'text-brand-950 text-xs' : 'text-gray-600 text-xs'
                            }`}>
                              {stage.label}
                            </p>
                            <p className="text-[10px] text-gray-400 leading-relaxed max-w-lg">{stage.desc}</p>
                          </div>
                          <div className="text-right shrink-0">
                            {isDone && (
                              <div className="space-y-0.5">
                                <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-1.5 py-0.5 rounded font-bold">
                                  Completed in {actualDays || targetDays}d
                                </span>
                                <p className="text-[9px] text-gray-400">Target: {targetDays} days</p>
                              </div>
                            )}
                            {isActive && (
                              <div className="space-y-0.5">
                                <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                                  (selectedProject.daysInStage || 0) > targetDays 
                                    ? 'bg-rose-50 text-rose-700 border-rose-150 animate-pulse' 
                                    : 'bg-amber-50 text-amber-700 border-amber-150'
                                }`}>
                                  Active: {selectedProject.daysInStage}d
                                </span>
                                <p className="text-[9px] text-gray-400">Target: {targetDays} days</p>
                              </div>
                            )}
                            {isFuture && (
                              <span className="text-[10px] text-gray-300 font-medium">
                                Target: {targetDays}d
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cycle Time & Flow Bottleneck Analysis chart */}
              <div className="border-t border-gray-100 pt-5 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Business Flow Timeline Analysis</h4>
                  <span className="text-[10px] text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    Lead Time Contribution Breakdown
                  </span>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div className="space-y-2">
                    {stages.map((stage) => {
                      const actualDays = selectedProject.cycleTimes?.[stage.value];
                      const targetDays = stage.targetDays;
                      const hasData = actualDays !== undefined;
                      const percentage = hasData ? Math.min(100, (actualDays / (selectedProject.slaLimitDays || 25)) * 100) : 0;
                      
                      return (
                        <div key={stage.value} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-medium text-gray-500">
                            <span>{stage.label}</span>
                            <span className="font-semibold text-slate-700">
                              {hasData ? `${actualDays}d elapsed` : 'Pending (Planned)'}
                              {hasData && ` / Target: ${targetDays}d`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                            {hasData ? (
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  actualDays > targetDays ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            ) : (
                              <div className="h-full bg-slate-200 border-dashed border border-slate-300 w-1/4" style={{ width: `${(targetDays / (selectedProject.slaLimitDays || 25)) * 100}%` }} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium border-t border-slate-200/60 pt-2 mt-1">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block" /> Completed within target</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded-xs inline-block" /> SLA target exceeded</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-200 rounded-xs inline-block" /> Planned step</span>
                  </div>
                </div>
              </div>

              {/* Commercial contract terms box */}
              <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4 text-xs">
                <h4 className="font-bold text-brand-950 flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar className="w-4.5 h-4.5 text-brand-600" />
                  <span>Commercial Contract Lock-in Status</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                  <div className="space-y-2.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Lease Specifics</p>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>Contract Start Date:</span>
                        <span className="font-bold text-gray-900">{selectedProject.contractStartDate || 'N/A (Pending Activation)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum Lock-in Period:</span>
                        <span className="font-bold text-gray-900">{selectedProject.contractLockInMonths || '24'} Months</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Renewal Alert Date:</span>
                        <span className="font-bold text-brand-600">{selectedProject.renewalAlertDate || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Infrastructure Actuals</p>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>Fiber Cable Length:</span>
                        <span className="font-bold text-gray-900">{selectedProject.actualCablingMeters || '30'} meters</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Physical Router Serials:</span>
                        <span className="font-mono font-bold text-gray-800">{selectedProject.equipmentDetails || 'N/A (Pending Onsite Setup)'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk or Renewal alerts */}
                {selectedProject.isRenewalRisk && (
                  <div className="p-3.5 bg-rose-50 border border-rose-150 rounded-lg text-rose-800 flex items-start gap-2 text-[11px] font-semibold">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Contract Term Expiration Alert!</p>
                      <p className="font-normal text-[10px] text-rose-700 mt-0.5">This customer lock-in term has either expired or is within 90 days of lease renewal. Initiate contact to renew corporate terms or upgrade speeds.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-16 rounded-xl border border-gray-100 shadow-xs text-center text-gray-400">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">Select Deployment Portfolio</p>
              <p className="text-xs mt-1">Select an active client deployment to trace physical core progress, fiber cabling lengths, or lock-in contract lease details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProjectsModule;
