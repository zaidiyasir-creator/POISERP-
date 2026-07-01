import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, FileCheck, Landmark, DollarSign, 
  Percent, Users, Clock, AlertCircle, UserCheck, 
  CheckCircle2, Gauge, CalendarRange 
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const { quotations, clients, jobs, invoices, projects, technicians } = useApp();
  const [activeDashboard, setActiveDashboard] = useState<'sales' | 'quotes' | 'jobs'>('sales');

  const currentDate = new Date('2026-06-30'); // Anchor current date from prompt metadata

  // ==========================================
  // CALCULATIONS: SALES PERFORMANCE DASHBOARD
  // ==========================================
  const totalSentQuotes = quotations.filter(q => q.status === 'sent' || q.status === 'accepted');
  const wonQuotes = quotations.filter(q => q.status === 'accepted');
  const winRate = totalSentQuotes.length > 0 
    ? ((wonQuotes.length / totalSentQuotes.length) * 100).toFixed(1) 
    : '0';

  const pipelineValue = quotations
    .filter(q => q.status === 'sent')
    .reduce((sum, q) => sum + q.grandTotal, 0);

  const totalInvoicedValue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const realizedRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  // Package Tier Counts
  const packageStats = {
    '100Mbps': wonQuotes.filter(q => q.items.some(i => i.itemCode === 'GF-100M' || i.itemCode === 'IA-100B')).length,
    '300Mbps': wonQuotes.filter(q => q.items.some(i => i.itemCode === 'GF-300M' || i.itemCode === 'IA-300A' || i.itemCode === 'IA-300B')).length,
    '500Mbps': wonQuotes.filter(q => q.items.some(i => i.itemCode === 'GF-500M' || i.itemCode === 'IA-500B' || i.itemCode === 'IA-500BP')).length,
    '1Gbps': wonQuotes.filter(q => q.items.some(i => i.itemCode === 'GF-1G' || i.itemCode === 'IA-1000B')).length,
  };

  // Top corporate clients by invoice totals
  const clientRevenue = clients.map(client => {
    const total = invoices
      .filter(inv => inv.clientId === client.id)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
    return { name: client.name, total, status: client.status };
  }).sort((a, b) => b.total - a.total).slice(0, 3);

  // Contract renewals (lock-in active expiring in 2026 or 2027)
  const renewals = projects
    .filter(p => p.lockInEndDate)
    .map(p => {
      const client = clients.find(c => c.id === p.clientId);
      return {
        clientName: client?.name || 'Unknown',
        endDate: p.lockInEndDate,
        owner: p.owner
      };
    });

  // ==========================================
  // CALCULATIONS: QUOTATION PIPELINE DASHBOARD
  // ==========================================
  const quoteCounts = {
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
    expired: quotations.filter(q => q.status === 'expired').length,
  };

  // Turnaround Time (days from quote date to accepted date)
  const acceptedWithDates = wonQuotes.filter(q => q.dateAccepted);
  const totalTurnaroundDays = acceptedWithDates.reduce((sum, q) => {
    const start = new Date(q.date);
    const end = new Date(q.dateAccepted!);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return sum + diff;
  }, 0);
  const avgTurnaround = acceptedWithDates.length > 0 
    ? (totalTurnaroundDays / acceptedWithDates.length).toFixed(1) 
    : 'N/A';

  // Nearing expiry (sent quotes created > 10 days ago, valid for 14 days)
  const nearingExpiry = quotations.filter(q => {
    if (q.status !== 'sent') return false;
    const createdDate = new Date(q.date);
    const diff = Math.ceil((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 10 && diff <= 14;
  });

  // GP % Distribution categories
  const gpSpreads = {
    high: quotations.filter(q => q.grossProfitGpPercent >= 50).length,
    medium: quotations.filter(q => q.grossProfitGpPercent >= 25 && q.grossProfitGpPercent < 50).length,
    low: quotations.filter(q => q.grossProfitGpPercent < 25).length,
  };

  // ==========================================
  // CALCULATIONS: JOB MONITORING DASHBOARD
  // ==========================================
  const totalJobs = jobs.length;
  const jobStatusCounts = {
    pending_survey: jobs.filter(j => j.status === 'pending_survey').length,
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    in_progress: jobs.filter(j => j.status === 'in_progress').length,
    installed: jobs.filter(j => j.status === 'installed').length,
    activated: jobs.filter(j => j.status === 'activated').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  };

  const completedInstallsCount = jobs.filter(j => ['installed', 'activated', 'closed'].includes(j.status)).length;
  const pendingSiteSurveys = jobs.filter(j => j.status === 'pending_survey' || !j.surveyChecklist.completed).length;

  // Tech utilization / workload (how many jobs are assigned to each)
  const techWorkload = technicians.map(tech => {
    const count = jobs.filter(j => j.assignedTechnicians.includes(tech.name) && j.status !== 'closed').length;
    return { name: tech.name, activeJobs: count };
  });

  // SLA compliance: (overdue is if current date is past SLA date and status is not activated/closed)
  const overdueJobs = jobs.filter(j => {
    if (['activated', 'closed'].includes(j.status)) return false;
    const slaDate = new Date(j.slaDueDate);
    return currentDate > slaDate;
  });

  const slaCompliancePercent = totalJobs > 0 
    ? (((totalJobs - overdueJobs.length) / totalJobs) * 100).toFixed(0) 
    : '100';

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-white p-1 rounded-xl border border-gray-100 max-w-xl shadow-xs">
        <button
          onClick={() => setActiveDashboard('sales')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
            activeDashboard === 'sales'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Sales Performance
        </button>
        <button
          onClick={() => setActiveDashboard('quotes')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
            activeDashboard === 'quotes'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Quotation Pipeline
        </button>
        <button
          onClick={() => setActiveDashboard('jobs')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
            activeDashboard === 'jobs'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Service Delivery (Jobs)
        </button>
      </div>

      {/* DASHBOARD VIEWS */}
      {activeDashboard === 'sales' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sales Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Total Invoiced (Revenue)</span>
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                  <Landmark className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">RM {totalInvoicedValue.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <div className="flex items-center gap-1.5 mt-2 text-emerald-600 text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>RM {realizedRevenue.toLocaleString('en-MY')} Received (Realized)</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Active Won Rate</span>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{winRate}%</p>
              <p className="text-xs text-gray-400 mt-2">{wonQuotes.length} won out of {totalSentQuotes.length} sent quotations</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Active Pipeline</span>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">RM {pipelineValue.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-400 mt-2">Value of pending quotations in "Sent" stage</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Active Clients</span>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {clients.filter(c => c.status === 'active').length}
              </p>
              <p className="text-xs text-gray-400 mt-2">{clients.filter(c => c.status === 'lead').length} early leads in CRM database</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Package speed breakdown */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs lg:col-span-1">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Speed Tier Distribution (Contracts Won)</h3>
              <div className="space-y-4">
                {Object.entries(packageStats).map(([tier, count]) => {
                  const maxCount = Math.max(...Object.values(packageStats), 1);
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={tier} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{tier} Packages</span>
                        <span>{count} Contract(s)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Corporate Clients */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs lg:col-span-1">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Top Revenue Generating Clients</h3>
              <div className="space-y-4">
                {clientRevenue.map((cl, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{cl.name}</p>
                      <span className="text-[10px] uppercase font-semibold text-brand-600 mt-1 inline-block">
                        {cl.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 shrink-0 ml-4">
                      RM {cl.total.toLocaleString('en-MY')}
                    </p>
                  </div>
                ))}
                {clientRevenue.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No client billing data available yet.</p>
                )}
              </div>
            </div>

            {/* Upcoming Contract Renewals */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs lg:col-span-1">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Contract Commitments & Renewals</h3>
              <div className="space-y-3">
                {renewals.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-700 truncate max-w-[180px]">{r.clientName}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Expiry: {r.endDate} ({r.owner})</p>
                    </div>
                    <span className="bg-brand-50 text-brand-700 font-semibold text-[10px] px-2.5 py-1 rounded">
                      24-Mo Lock
                    </span>
                  </div>
                ))}
                {renewals.length === 0 && (
                  <div className="text-center py-8">
                    <CalendarRange className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No active lock-in contracts found. Complete a job to start billing.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeDashboard === 'quotes' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quotations Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Draft / In-Work</span>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">Draft</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{quoteCounts.draft} Quotations</p>
              <p className="text-xs text-gray-400 mt-2">Currently being drafted by Sales team</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Avg Approval Turnaround</span>
                <div className="p-1.5 bg-brand-50 rounded text-brand-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{avgTurnaround} Days</p>
              <p className="text-xs text-gray-400 mt-2">From Creation to Client Sign-off</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Nearing Expiry (14 days)</span>
                <div className="p-1.5 bg-rose-50 rounded text-rose-600 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-rose-700 mt-2">{nearingExpiry.length} Quotation(s)</p>
              <p className="text-xs text-gray-400 mt-2">Sent quotes &gt; 10 days old, unsigned</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">SST Collected (Estimate)</span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">SST 8%</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                RM {invoices.reduce((sum, inv) => sum + inv.sstTotal, 0).toLocaleString('en-MY')}
              </p>
              <p className="text-xs text-gray-400 mt-2">Total tax compiled across issued billing</p>
            </div>
          </div>

          {/* GP Spreads and Pipeline stages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GP Spread visual */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Gross Profit (GP%) Margin Distribution</h3>
              <p className="text-xs text-gray-400 mb-6">Visual spread of profit margins across all compiled quotations. Low margin (&lt; 25%) triggers mandatory CEO override approval.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-gray-600">High Margin (&ge; 50% GP)</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{gpSpreads.high} Quotes</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium text-gray-600">Healthy Margin (25% - 49% GP)</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{gpSpreads.medium} Quotes</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-medium text-gray-600">Low Margin (&lt; 25% GP) — CEO Block</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{gpSpreads.low} Quotes</span>
                </div>

                <div className="pt-4 flex h-6 w-full rounded-full overflow-hidden">
                  {/* Visual progress stacked bar */}
                  {(() => {
                    const total = (gpSpreads.high + gpSpreads.medium + gpSpreads.low) || 1;
                    const highPct = (gpSpreads.high / total) * 100;
                    const medPct = (gpSpreads.medium / total) * 100;
                    const lowPct = (gpSpreads.low / total) * 100;
                    return (
                      <>
                        <div style={{ width: `${highPct}%` }} className="bg-emerald-500 h-full hover:opacity-95" />
                        <div style={{ width: `${medPct}%` }} className="bg-blue-500 h-full hover:opacity-95" />
                        <div style={{ width: `${lowPct}%` }} className="bg-rose-500 h-full hover:opacity-95" />
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Pipeline list */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Quotations Sent & Awaiting Decision</h3>
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2">
                {quotations.filter(q => q.status === 'sent').map((q) => (
                  <div key={q.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50/50 border border-gray-100">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{q.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Ref: {q.refNo} | GP: {q.grossProfitGpPercent}%</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs font-bold text-gray-800">RM {q.grandTotal.toLocaleString('en-MY')}</p>
                      <span className="text-[9px] text-brand-600 font-semibold uppercase">Pending PO</span>
                    </div>
                  </div>
                ))}
                {quotations.filter(q => q.status === 'sent').length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-10">No pending sent quotations. Go draft and send quotes to clients!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeDashboard === 'jobs' && (
        <div className="space-y-6 animate-fade-in">
          {/* Jobs Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">SLA Installs Compliance</span>
                <div className="p-1.5 bg-emerald-50 rounded text-emerald-600">
                  <Gauge className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{slaCompliancePercent}%</p>
              <p className="text-xs text-gray-400 mt-2">{overdueJobs.length} work order(s) breaching SLA limit</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Total Installs Complete</span>
                <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{completedInstallsCount} Completed</p>
              <p className="text-xs text-gray-400 mt-2">Activated services on core network</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Open Site Surveys</span>
                <div className="p-1.5 bg-amber-50 rounded text-amber-600 animate-pulse">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-700 mt-2">{pendingSiteSurveys} Pending</p>
              <p className="text-xs text-gray-400 mt-2">Requiring physical cabling checks</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">SLA Target Standard</span>
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">14-30 Days</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">Corporate SLA</p>
              <p className="text-xs text-gray-400 mt-2">Working days commitment on purchase order</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technician workload */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Technician Active Workload & Dispatch Utilization</h3>
              <div className="space-y-4">
                {techWorkload.map((tech) => (
                  <div key={tech.name} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                      <span className="text-xs font-bold text-gray-700">{tech.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500">{tech.activeJobs} Active Work Order(s)</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        tech.activeJobs > 2 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {tech.activeJobs > 2 ? 'High Load' : 'Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Risks panel */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Active Jobs Queue & Status Matrix</h3>
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2">
                {jobs.map((job) => {
                  const isOverdue = new Date() > new Date(job.slaDueDate) && !['activated', 'closed'].includes(job.status);
                  return (
                    <div key={job.id} className={`flex justify-between items-center p-3 rounded-lg border ${
                      isOverdue ? 'border-rose-200 bg-rose-50/20' : 'border-gray-100 bg-slate-50/40'
                    }`}>
                      <div>
                        <p className="text-xs font-bold text-gray-800 truncate max-w-[200px]">{job.serviceType}</p>
                        <p className="text-[10px] text-gray-400 mt-1">SLA Limit: {job.slaDueDate} {isOverdue && ' (BREACHING SLA)'}</p>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded inline-block ${
                          job.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                          job.status === 'activated' ? 'bg-emerald-100 text-emerald-700' :
                          job.status === 'installed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardModule;
