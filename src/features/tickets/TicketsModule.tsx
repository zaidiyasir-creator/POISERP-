import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TroubleTicket, TicketStatus, TicketPriority, Client, Invoice } from '../../types';
import { 
  Search, Plus, ShieldCheck, AlertTriangle, Clock, 
  CheckCircle, FileText, DollarSign, User, Link as LinkIcon, 
  X, Trash2, Activity, Filter, Info, ChevronRight, Sliders, Play
} from 'lucide-react';

export const TicketsModule: React.FC = () => {
  const { 
    troubleTickets, 
    addTroubleTicket, 
    updateTroubleTicket, 
    deleteTroubleTicket, 
    applyRebateToInvoice,
    clients, 
    invoices, 
    technicians, 
    slaSettings,
    currentUser
  } = useApp();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<TroubleTicket | null>(null);

  // Create/Edit modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Form fields
  const [ticketId, setTicketId] = useState('');
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TicketStatus>('open');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [isOutage, setIsOutage] = useState(false);
  const [outageDurationHours, setOutageDurationHours] = useState(0);
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');
  const [customMrc, setCustomMrc] = useState(1500); // Default MRC for estimation

  // Apply Rebate modal state
  const [showRebateModal, setShowRebateModal] = useState(false);
  const [targetInvoiceId, setTargetInvoiceId] = useState('');
  const [rebateSuccess, setRebateSuccess] = useState('');

  // Calculator sub-tab states
  const [activeSubTab, setActiveSubTab] = useState<'log' | 'calculator'>('log');
  const [calcClientId, setCalcClientId] = useState<string>(clients[0]?.id || '');
  const [calcMrc, setCalcMrc] = useState<number>(1500);
  const [calcOutageHours, setCalcOutageHours] = useState<number>(6);
  const [calcSlaHours, setCalcSlaHours] = useState<number>(slaSettings.resolutionSlaHours || 4);
  const [calcRebatePercent, setCalcRebatePercent] = useState<number>(slaSettings.outageRebatePercent || 5.0);
  const [calcMultiplier, setCalcMultiplier] = useState<number>(1.0);
  const [calcDeductible, setCalcDeductible] = useState<'full' | 'excess'>('full');
  const [calcCreatedTicketId, setCalcCreatedTicketId] = useState<string>('');
  const [calcSuccessMessage, setCalcSuccessMessage] = useState<string>('');
  const [calcSelectedInvoiceId, setCalcSelectedInvoiceId] = useState<string>('');

  // Auto-calculate SLA breach & rebate
  const isSlaBreached = isOutage && outageDurationHours > (slaSettings.resolutionSlaHours || 4);
  const calculatedRebate = isOutage 
    ? Number((outageDurationHours * ((slaSettings.outageRebatePercent || 5.0) / 100) * customMrc).toFixed(2))
    : 0;

  // Filtered tickets
  const filteredTickets = troubleTickets.filter(t => {
    const client = clients.find(c => c.id === t.clientId);
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadgeColor = (p: TicketPriority) => {
    switch (p) {
      case 'critical': return 'bg-rose-100 text-rose-800 border-rose-200 font-bold animate-pulse';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (s: TicketStatus) => {
    switch (s) {
      case 'open': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'investigating': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'closed': return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormError('');
    setTicketId('TKT-' + Math.floor(1000 + Math.random() * 9000));
    setClientId(clients[0]?.id || '');
    setTitle('');
    setDescription('');
    setStatus('open');
    setPriority('medium');
    setIsOutage(false);
    setOutageDurationHours(0);
    setAssignedTechnicianId('');
    setCustomMrc(1500);
    setShowFormModal(true);
  };

  const openEditModal = (t: TroubleTicket) => {
    setIsEditing(true);
    setFormError('');
    setTicketId(t.id);
    setClientId(t.clientId);
    setTitle(t.title);
    setDescription(t.description);
    setStatus(t.status);
    setPriority(t.priority);
    setIsOutage(t.isOutage);
    setOutageDurationHours(t.outageDurationHours || 0);
    setAssignedTechnicianId(t.assignedTechnicianId || '');
    setCustomMrc(1500); // Default or adjust
    setShowFormModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a trouble ticket title.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please describe the technical incident.');
      return;
    }

    const ticketData: TroubleTicket = {
      id: ticketId,
      clientId,
      title,
      description,
      status,
      priority,
      createdAt: isEditing 
        ? troubleTickets.find(t => t.id === ticketId)?.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19)
        : new Date().toISOString().replace('T', ' ').substring(0, 19),
      resolvedAt: ['resolved', 'closed'].includes(status) 
        ? new Date().toISOString().replace('T', ' ').substring(0, 19)
        : undefined,
      isOutage,
      outageDurationHours: isOutage ? Number(outageDurationHours) : undefined,
      slaBreached: isOutage && Number(outageDurationHours) > (slaSettings.resolutionSlaHours || 4),
      rebateAmount: isOutage ? calculatedRebate : undefined,
      assignedTechnicianId: assignedTechnicianId || undefined,
      appliedToInvoiceId: isEditing ? troubleTickets.find(t => t.id === ticketId)?.appliedToInvoiceId : undefined
    };

    if (isEditing) {
      updateTroubleTicket(ticketData);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(ticketData);
      }
    } else {
      addTroubleTicket(ticketData);
    }

    setShowFormModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trouble ticket?')) {
      deleteTroubleTicket(id);
      if (selectedTicket?.id === id) {
        setSelectedTicket(null);
      }
    }
  };

  const handleOpenRebateModal = () => {
    if (!selectedTicket || !selectedTicket.rebateAmount) return;
    setRebateSuccess('');
    // Find first unpaid or issued invoice for this client
    const clientInvoices = invoices.filter(inv => inv.clientId === selectedTicket.clientId && inv.status !== 'paid');
    setTargetInvoiceId(clientInvoices[0]?.id || '');
    setShowRebateModal(true);
  };

  const handleApplyRebateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !targetInvoiceId) return;

    applyRebateToInvoice(selectedTicket.id, targetInvoiceId);
    setRebateSuccess('Rebate credit applied successfully as an invoice line item adjustment!');
    
    // Auto refresh selected view
    const updated = {
      ...selectedTicket,
      appliedToInvoiceId: targetInvoiceId,
      status: 'closed' as TicketStatus
    };
    setSelectedTicket(updated);

    setTimeout(() => {
      setShowRebateModal(false);
      setRebateSuccess('');
    }, 2000);
  };

  // Interactive Calculator computations
  const calcClientObj = clients.find(c => c.id === calcClientId);
  const calcExcessHours = Math.max(0, calcOutageHours - calcSlaHours);
  const calcPenalizedHours = calcDeductible === 'full' ? calcOutageHours : calcExcessHours;
  const calcRawRebatePct = calcPenalizedHours * calcRebatePercent * calcMultiplier;
  const calcRebatePct = Math.min(100, calcRawRebatePct);
  const calcRebateAmount = Number(((calcRebatePct / 100) * calcMrc).toFixed(2));
  const calcUptimePercent = Number((100 - (calcOutageHours / 720) * 100).toFixed(4));
  const calcUptimeSlaBreached = calcUptimePercent < (slaSettings.targetUptime || 99.9);
  const calcMtrBreached = calcOutageHours > calcSlaHours;

  const handleConvertSimulationToTicket = () => {
    const newTktId = 'TKT-SIM-' + Math.floor(1000 + Math.random() * 9000);
    const clientName = calcClientObj?.name || 'Client';
    
    const newTicket: TroubleTicket = {
      id: newTktId,
      clientId: calcClientId,
      title: `Contractual SLA Rebate: Outage incident for ${clientName}`,
      description: `Official trouble ticket generated from interactive SLA Rebate Calculator.
Incident parameters simulated:
- Leased MRC: RM ${calcMrc.toFixed(2)}
- Outage duration: ${calcOutageHours} hours (Target SLA Limit: ${calcSlaHours} hours)
- Penalty rate factor: ${calcRebatePercent}% per hour (Applied: ${calcDeductible === 'full' ? 'Full duration' : 'Excess hours only'})
- Contract SLA Multiplier: ${calcMultiplier}x (${calcMultiplier === 1 ? 'Standard' : calcMultiplier === 1.5 ? 'Gold Priority' : 'Platinum Critical Route'})
- Resulting monthly link uptime: ${calcUptimePercent}% (Target Guarantee: ${slaSettings.targetUptime || 99.9}%)`,
      status: 'resolved',
      priority: calcOutageHours > calcSlaHours ? 'high' : 'medium',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      isOutage: true,
      outageDurationHours: calcOutageHours,
      slaBreached: calcOutageHours > calcSlaHours,
      rebateAmount: calcRebateAmount
    };

    addTroubleTicket(newTicket);
    setCalcCreatedTicketId(newTktId);
    setCalcSuccessMessage(`Simulated outage successfully converted to official Incident Ticket ${newTktId}!`);
    setTimeout(() => {
      setCalcSuccessMessage('');
    }, 4000);
  };

  const handleApplyCalcRebateToInvoice = () => {
    if (!calcSelectedInvoiceId) return;

    // Use existing simulated ticket ID if already converted, otherwise create a simulation ticket on the fly
    const ticketIdToUse = calcCreatedTicketId || ('TKT-CALC-' + Math.floor(1000 + Math.random() * 9000));
    const clientName = calcClientObj?.name || 'Client';

    if (!calcCreatedTicketId) {
      const newTicket: TroubleTicket = {
        id: ticketIdToUse,
        clientId: calcClientId,
        title: `SLA Outage Rebate: ${clientName}`,
        description: `Direct interactive billing rebate credit applied. Outage: ${calcOutageHours} hrs. MRC: RM ${calcMrc.toFixed(2)}. Rate: ${calcRebatePercent}%/hr. Multiplier: ${calcMultiplier}x.`,
        status: 'closed',
        priority: calcOutageHours > calcSlaHours ? 'high' : 'medium',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        isOutage: true,
        outageDurationHours: calcOutageHours,
        slaBreached: calcOutageHours > calcSlaHours,
        rebateAmount: calcRebateAmount,
        appliedToInvoiceId: calcSelectedInvoiceId
      };
      addTroubleTicket(newTicket);
    }

    applyRebateToInvoice(ticketIdToUse, calcSelectedInvoiceId);

    setCalcSuccessMessage(`Billing credit of RM ${calcRebateAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })} has been applied directly to Invoice #${calcSelectedInvoiceId}!`);
    setCalcSelectedInvoiceId('');
    setTimeout(() => {
      setCalcSuccessMessage('');
    }, 4000);
  };

  // Stats
  const totalCount = troubleTickets.length;
  const openCount = troubleTickets.filter(t => ['open', 'investigating'].includes(t.status)).length;
  const resolvedCount = troubleTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;
  const totalRebatesPaid = troubleTickets
    .filter(t => t.appliedToInvoiceId)
    .reduce((sum, t) => sum + (t.rebateAmount || 0), 0);
  const totalRebatesPending = troubleTickets
    .filter(t => t.rebateAmount && !t.appliedToInvoiceId)
    .reduce((sum, t) => sum + (t.rebateAmount || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* High-Level Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Incidents</p>
            <p className="text-xl font-bold text-gray-800">{openCount}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resolved Tickets</p>
            <p className="text-xl font-bold text-gray-800">{resolvedCount} / {totalCount}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Rebates</p>
            <p className="text-xl font-bold text-gray-800">RM {totalRebatesPending.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Applied Rebates</p>
            <p className="text-xl font-bold text-brand-800">RM {totalRebatesPaid.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Sub Module Tabs */}
      <div className="flex border-b border-gray-200 gap-2 mb-6">
        <button
          onClick={() => setActiveSubTab('log')}
          className={`py-3 px-6 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'log'
              ? 'border-brand-600 text-brand-600 bg-brand-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Incident Ticket Logging</span>
        </button>
        <button
          onClick={() => {
            setActiveSubTab('calculator');
            if (!calcClientId && clients.length > 0) {
              setCalcClientId(clients[0].id);
            }
          }}
          className={`py-3 px-6 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'calculator'
              ? 'border-brand-600 text-brand-600 bg-brand-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>SLA Rebates Calculator & Invoice Simulator</span>
        </button>
      </div>

      {activeSubTab === 'log' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Ticket List & Search */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl shadow-xs flex flex-col overflow-hidden h-[600px]">
          {/* Header & Filters */}
          <div className="p-4 border-b border-gray-100 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-600" />
                <span>Trouble Ticket Log</span>
              </h3>
              <button
                onClick={openCreateModal}
                className="bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>File Ticket</span>
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search ticket, client, details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-[11px] font-semibold text-gray-600 focus:outline-none"
                >
                  <option value="all">🔍 All Statuses</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-[11px] font-semibold text-gray-600 focus:outline-none"
                >
                  <option value="all">⚠️ All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* List scroll area */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <Info className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs">No trouble tickets found matching criteria.</p>
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const client = clients.find(c => c.id === ticket.clientId);
                const isSelected = selectedTicket?.id === ticket.id;
                
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 cursor-pointer hover:bg-slate-50/50 transition-all space-y-2 text-xs relative ${
                      isSelected ? 'bg-brand-50/40 border-l-4 border-brand-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-gray-400">{ticket.id}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getPriorityBadgeColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusBadgeColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-gray-800 text-xs truncate">{ticket.title}</p>
                      <p className="text-slate-500 text-[11px] font-semibold mt-0.5 truncate">{client?.name}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                      <span>Created: {ticket.createdAt.split(' ')[0]}</span>
                      
                      {ticket.isOutage && (
                        <span className="flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Outage: {ticket.outageDurationHours} hrs</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Ticket Details, SLA Auditing & Billing Rebate connector */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl shadow-xs p-6 h-[600px] flex flex-col justify-between overflow-y-auto">
          {selectedTicket ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="border-b border-gray-150 pb-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded-md inline-block font-semibold">
                      {selectedTicket.id}
                    </span>
                    <h2 className="text-base font-bold text-gray-900 leading-snug">{selectedTicket.title}</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(selectedTicket)}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Edit Ticket
                    </button>
                    <button
                      onClick={() => handleDelete(selectedTicket.id)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition-all"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-gray-500 font-medium">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-bold">Client</span>
                    <span className="text-gray-800 font-bold">
                      {clients.find(c => c.id === selectedTicket.clientId)?.name || 'Unknown Client'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-bold">Assigned Crew</span>
                    <span className="text-gray-800 flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {technicians.find(t => t.id === selectedTicket.assignedTechnicianId)?.name || 'NOC Engineers'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block font-bold">Logged Date</span>
                    <span className="text-gray-800 font-mono">{selectedTicket.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Description box */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Incident Log Description</h4>
                <div className="p-4 bg-slate-50 border border-gray-150 rounded-xl text-xs text-gray-700 leading-relaxed font-normal whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Outage and SLA Audit Panel */}
              <div className="bg-slate-50 border border-gray-250 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>SLA Contract Auditing</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Target SLA Resolution Time</p>
                    <p className="font-bold text-gray-800">{slaSettings.resolutionSlaHours || 4} Hours</p>
                    <p className="text-[10px] text-gray-400">Guaranteed max MTTR (Mean Time to Repair).</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">SLA Breach Metric</p>
                    {selectedTicket.isOutage ? (
                      selectedTicket.slaBreached ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Breached — Down {selectedTicket.outageDurationHours} hrs</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Within Compliance ({selectedTicket.outageDurationHours} hrs)</span>
                        </span>
                      )
                    ) : (
                      <span className="text-gray-500 font-medium">Non-outage report</span>
                    )}
                  </div>
                </div>

                {/* REBATE CONNECTOR BOX */}
                {selectedTicket.isOutage && selectedTicket.rebateAmount && (
                  <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3 mt-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">Contractual Service Credit Rebate</span>
                      <span className="text-xs font-bold text-brand-600 font-mono text-base">
                        RM {selectedTicket.rebateAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="p-3 bg-brand-50/50 rounded-lg text-[11px] text-slate-600 leading-relaxed font-medium space-y-1">
                      <p className="font-bold text-brand-800">Formula Breakdown:</p>
                      <p className="font-mono">
                        {selectedTicket.outageDurationHours} hrs × {slaSettings.outageRebatePercent}% MRC Factor per hr = {(selectedTicket.outageDurationHours! * slaSettings.outageRebatePercent).toFixed(1)}% MRC Refund.
                      </p>
                      <p>Estimated monthly service leasing charge applied for calculation: <span className="font-bold">RM 1,500.00</span></p>
                    </div>

                    {/* Button to connect to billing invoice */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-[10px] font-medium text-gray-500">
                        {selectedTicket.appliedToInvoiceId ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <CheckCircle className="w-4 h-4" />
                            <span>Linked & Credited to Invoice #{selectedTicket.appliedToInvoiceId}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-700 font-semibold">
                            <Clock className="w-4 h-4" />
                            <span>Unbilled credit — rebate pending invoice</span>
                          </div>
                        )}
                      </div>

                      {!selectedTicket.appliedToInvoiceId && (
                        <button
                          onClick={handleOpenRebateModal}
                          className="bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>Link Rebate to Invoice</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8 space-y-3">
              <div className="p-4 bg-brand-50 text-brand-600 rounded-2xl">
                <Sliders className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-gray-700 text-sm">No Ticket Selected</h4>
                <p className="text-xs max-w-sm mx-auto leading-relaxed mt-1">
                  Select a trouble ticket from the log timeline to view physical fiber incident logs, technician schedules, SLA breach alerts, and billing rebate summaries.
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Trouble Incident</span>
              </button>
            </div>
          )}
        </div>
      </div>
      ) : (
        /* SLA Rebate Calculator Tab Content */
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
          {/* Intro Banner */}
          <div className="p-6 bg-slate-50 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1 font-sans">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-600" />
                <span>Interactive SLA Rebates Calculator & Invoice Simulator</span>
              </h3>
              <p className="text-xs text-gray-500 max-w-xl">
                Simulate network fiber outages, calculate MTTR violations, compare compliance thresholds, and instantly credit client monthly bills with contractual SLA deductions.
              </p>
            </div>

            {/* SLA Rule Defaults info */}
            <div className="bg-brand-50 border border-brand-100 p-3 rounded-lg text-[11px] font-medium text-slate-700 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <div>
                <p className="font-bold text-brand-800">System Contract SLA Defaults:</p>
                <p>Target MTTR: <span className="font-bold">{slaSettings.resolutionSlaHours} hrs</span> | Rate: <span className="font-bold">{slaSettings.outageRebatePercent}% MRC/hr</span></p>
              </div>
            </div>
          </div>

          {/* Calculator Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 font-sans">
            {/* Left Column: Parameter Inputs (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Simulation Inputs</h4>

              {/* Success message */}
              {calcSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium animate-fade-in flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>{calcSuccessMessage}</span>
                </div>
              )}

              {/* Client selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600">Target Client Account</label>
                <select
                  value={calcClientId}
                  onChange={(e) => {
                    setCalcClientId(e.target.value);
                    setCalcSelectedInvoiceId('');
                  }}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 font-medium"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              {/* MRC leasing charge input & presets */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-600">Monthly Recurring Charge (MRC)</label>
                  <span className="text-xs font-bold text-slate-700">RM {calcMrc.toLocaleString('en-MY')}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="100"
                  value={calcMrc}
                  onChange={(e) => setCalcMrc(parseInt(e.target.value) || 500)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCalcMrc(1500)}
                    className={`text-[10px] font-semibold py-1 px-1.5 rounded-md border text-center transition-all cursor-pointer ${
                      calcMrc === 1500 ? 'bg-brand-50 border-brand-300 text-brand-700 font-bold' : 'bg-gray-50 border-gray-250 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    RM 1.5k (GPON)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMrc(5000)}
                    className={`text-[10px] font-semibold py-1 px-1.5 rounded-md border text-center transition-all cursor-pointer ${
                      calcMrc === 5000 ? 'bg-brand-50 border-brand-300 text-brand-700 font-bold' : 'bg-gray-50 border-gray-250 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    RM 5k (1Gbps ME)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMrc(15000)}
                    className={`text-[10px] font-semibold py-1 px-1.5 rounded-md border text-center transition-all cursor-pointer ${
                      calcMrc === 15000 ? 'bg-brand-50 border-brand-300 text-brand-700 font-bold' : 'bg-gray-50 border-gray-250 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    RM 15k (Trunk)
                  </button>
                </div>
              </div>

              {/* Outage hours input & presets */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-600">Incident Outage Duration</label>
                  <span className="text-xs font-bold text-rose-700 font-mono">{calcOutageHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="72.0"
                  step="0.1"
                  value={calcOutageHours}
                  onChange={(e) => setCalcOutageHours(parseFloat(e.target.value) || 0.1)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => setCalcOutageHours(1.0)}
                    className={`text-[9px] font-semibold py-1 rounded-md border text-center transition-all cursor-pointer ${
                      calcOutageHours === 1.0 ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold' : 'bg-gray-50 border-gray-250 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    1.0h (Glitch)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcOutageHours(4.5)}
                    className={`text-[9px] font-semibold py-1 rounded-md border text-center transition-all cursor-pointer ${
                      calcOutageHours === 4.5 ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold animate-pulse' : 'bg-gray-50 border-gray-250 text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Exceeds standard 4.0 hr SLA target limit"
                  >
                    4.5h (Breach)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcOutageHours(12.0)}
                    className={`text-[9px] font-semibold py-1 rounded-md border text-center transition-all cursor-pointer ${
                      calcOutageHours === 12.0 ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold' : 'bg-gray-50 border-gray-250 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    12.0h (Cut)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcOutageHours(36.0)}
                    className={`text-[9px] font-semibold py-1 rounded-md border text-center transition-all cursor-pointer ${
                      calcOutageHours === 36.0 ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold' : 'bg-gray-50 border-gray-250 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    36.0h (Disaster)
                  </button>
                </div>
              </div>

              {/* Sla target overrides & hourly rebate rate % */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-600">SLA Resolution Limit</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={calcSlaHours}
                      onChange={(e) => setCalcSlaHours(parseInt(e.target.value) || 4)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">Hrs</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-600">Hourly Rebate Rate</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={calcRebatePercent}
                      onChange={(e) => setCalcRebatePercent(parseFloat(e.target.value) || 5.0)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-brand-600 focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-400 font-bold uppercase font-mono">% MRC</span>
                  </div>
                </div>
              </div>

              {/* Corporate Tier SLA multiplier & Penalty Clause deductible option */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-600 font-sans">Contract Priority Tier</label>
                  <select
                    value={calcMultiplier}
                    onChange={(e) => setCalcMultiplier(parseFloat(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold focus:outline-none font-medium"
                  >
                    <option value="1.0">Standard (1.0x)</option>
                    <option value="1.5" className="text-amber-700">Gold Priority (1.5x)</option>
                    <option value="2.0" className="text-rose-700">Platinum Mission-Crit (2.0x)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-600 font-sans">Penalty Clause Rule</label>
                  <select
                    value={calcDeductible}
                    onChange={(e) => setCalcDeductible(e.target.value as 'full' | 'excess')}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-slate-700 focus:outline-none font-medium"
                  >
                    <option value="full">Full Duration (Standard)</option>
                    <option value="excess">Excess Hours Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Calculations & Interactive Credit Statement Output (7 cols) */}
            <div className="lg:col-span-7 bg-slate-50 border border-gray-200 rounded-xl p-6 space-y-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Compliance & Billing Credit Analysis</h4>

              {/* Compliance Gauges Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                {/* MTTR SLA Card */}
                <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs text-xs space-y-1.5">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">MTTR SLA Compliance</span>
                  {calcMtrBreached ? (
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[10px] font-bold uppercase inline-block animate-pulse">
                        SLA BREACHED
                      </span>
                      <p className="font-bold text-gray-800 text-sm">+{calcExcessHours.toFixed(1)} Excess Hours</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase inline-block font-semibold">
                        COMPLIANT
                      </span>
                      <p className="font-bold text-gray-800 text-sm">Resolved in Time</p>
                    </div>
                  )}
                  <p className="text-[9px] text-gray-400 font-medium leading-tight font-semibold">Max target repair time is {calcSlaHours} hours.</p>
                </div>

                {/* Monthly Uptime Metric */}
                <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs text-xs space-y-1.5">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Monthly Link Uptime</span>
                  {calcUptimeSlaBreached ? (
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[10px] font-bold uppercase inline-block">
                        MONTHLY BREACH
                      </span>
                      <p className="font-mono font-bold text-rose-600 text-sm">{calcUptimePercent}% Uptime</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase inline-block">
                        Uptime OK
                      </span>
                      <p className="font-mono font-bold text-emerald-600 text-sm">{calcUptimePercent}% Uptime</p>
                    </div>
                  )}
                  <p className="text-[9px] text-gray-400 font-medium leading-tight font-semibold">Contractual target guarantee is {slaSettings.targetUptime || 99.9}%.</p>
                </div>

                {/* Total Billing Deduction factor */}
                <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xs text-xs space-y-1.5">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Billing Credit Percentage</span>
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-brand-50 border border-brand-200 text-brand-700 rounded text-[10px] font-bold uppercase inline-block">
                      {calcRebatePct === 100 ? 'MAX CAPPED REFUND' : 'REBATE RATE'}
                    </span>
                    <p className="font-mono font-bold text-brand-600 text-sm">{calcRebatePct.toFixed(1)}% MRC Refund</p>
                  </div>
                  <p className="text-[9px] text-gray-400 font-medium leading-tight font-semibold">
                    {calcPenalizedHours.toFixed(1)} hrs charged × {calcRebatePercent}% rate {calcMultiplier !== 1 && `× ${calcMultiplier}x tier`}
                  </p>
                </div>
              </div>

              {/* Simulated SLA credit statement / Memo card */}
              <div className="bg-white border-2 border-dashed border-gray-300 p-5 rounded-xl font-mono text-[11px] text-gray-700 space-y-4 shadow-sm relative overflow-hidden">
                {/* Watermark/stamp */}
                {calcMtrBreached && (
                  <div className="absolute top-2 right-2 rotate-12 border-2 border-rose-600 text-rose-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-white/90">
                    SLA VIOLATION
                  </div>
                )}
                
                <div className="text-center border-b border-gray-200 pb-3 space-y-1">
                  <p className="font-bold text-xs uppercase tracking-wide">Pois Carrier Billing System</p>
                  <p className="text-[10px] text-gray-400 font-semibold">CONTRACTUAL SLA REBATE MEMO STATEMENT</p>
                  <p className="text-[10px] text-gray-400 font-mono">Date Generated: {new Date().toISOString().split('T')[0]}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-1 border-b border-gray-200 pb-3">
                  <span className="text-slate-400 font-bold uppercase block">AFFECTED ACCOUNT:</span>
                  <span className="text-right font-bold text-gray-800 block">{calcClientObj?.name || 'Account Simulated'}</span>

                  <span className="text-slate-400 font-bold uppercase block">SERVICE ID:</span>
                  <span className="text-right font-bold text-gray-800 block">LRL-FBR-{calcClientId || 'SIM'}</span>

                  <span className="text-slate-400 font-bold uppercase block">LEASED MRC:</span>
                  <span className="text-right font-bold text-gray-800 block">RM {calcMrc.toFixed(2)}</span>

                  <span className="text-slate-400 font-bold uppercase block">INCIDENT OUTAGE:</span>
                  <span className="text-right font-bold text-gray-800 block">{calcOutageHours} hrs</span>

                  <span className="text-slate-400 font-bold uppercase block">PENALTY METHOD:</span>
                  <span className="text-right font-bold text-gray-800 block">{calcDeductible === 'full' ? 'Full Duration' : 'Excess SLA Only'}</span>
                </div>

                <div className="space-y-1 border-b border-gray-200 pb-3">
                  <p className="font-bold text-gray-800">CREDIT STATEMENT LINE ADJ:</p>
                  <p className="text-slate-500 text-[10px] italic">
                    "SLA Service Outage Rebate Adjustment — Ref: {calcCreatedTicketId || 'SIM-TEMP'}"
                  </p>
                  <div className="flex justify-between items-center pt-2 font-sans">
                    <span className="font-bold text-gray-950 font-mono">NET CREDIT AMOUNT:</span>
                    <span className="text-base font-bold text-rose-600 font-mono">
                      - RM {calcRebateAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-gray-400 font-semibold">
                  Formula: {calcPenalizedHours.toFixed(1)} hrs × {calcRebatePercent}% rate × {calcMultiplier}x multiplier = {calcRebatePct.toFixed(1)}% of MRC
                </div>
              </div>

              {/* Invoicing Connector & Direct credit application button */}
              <div className="bg-white border border-gray-150 p-5 rounded-xl space-y-4 shadow-xs font-sans">
                <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-brand-600" />
                  <span>Apply credit directly to Client Billing Invoice</span>
                </h5>

                <div className="grid grid-cols-1 gap-3">
                  {invoices.filter(inv => inv.clientId === calcClientId && inv.status !== 'paid').length > 0 ? (
                    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                      <select
                        value={calcSelectedInvoiceId}
                        onChange={(e) => setCalcSelectedInvoiceId(e.target.value)}
                        className="flex-1 bg-white border border-gray-250 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 font-medium"
                      >
                        <option value="">-- Choose outstanding client invoice --</option>
                        {invoices
                          .filter(inv => inv.clientId === calcClientId && inv.status !== 'paid')
                          .map(inv => (
                            <option key={inv.id} value={inv.id}>
                              Invoice {inv.id} (Outstanding: RM {inv.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })})
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        disabled={!calcSelectedInvoiceId}
                        onClick={handleApplyCalcRebateToInvoice}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-5 rounded-lg transition-all shadow-xs disabled:opacity-40 whitespace-nowrap cursor-pointer"
                      >
                        Apply Bill Credit
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-[11.5px] leading-relaxed font-semibold">
                      ⚠️ No outstanding invoices found for <strong>{calcClientObj?.name}</strong>. First, convert this simulation to an official trouble ticket to record the breach, or generate recurring monthly invoices in the <strong>Invoices & Billing</strong> module to enable credits.
                    </div>
                  )}
                </div>

                {/* Convert to Trouble Ticket button */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold">
                  <span className="text-slate-500 text-[11px] font-semibold">Want to officially log this outage and track it?</span>
                  <button
                    type="button"
                    onClick={handleConvertSimulationToTicket}
                    className="bg-slate-50 hover:bg-slate-100 border border-gray-250 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg transition-all cursor-pointer"
                  >
                    File Incident Trouble Ticket
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TICKET CREATION / EDITING FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-xl border border-gray-200 max-w-lg w-full shadow-lg p-6 relative">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {isEditing ? 'Edit Incident Trouble Ticket' : 'File New Incidental Trouble Ticket'}
                </h3>
                <p className="text-xs text-gray-400">Log client hardware faults, splice cuts, and calculate contract SLA adjustments</p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Incident Reference ID</label>
                  <input
                    type="text"
                    value={ticketId}
                    className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-500 font-mono font-bold focus:outline-none"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Affected Client *</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                    disabled={isEditing}
                    required
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Issue Headline / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Backbone fiber cut between Subang and Damansara"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Incident Fault Details *</label>
                <textarea
                  placeholder="Provide precise technical logs, fiber splice readings, or port error rates..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Incident Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TicketStatus)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Priority Rating</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold text-rose-700"
                  >
                    <option value="low" className="text-gray-500 font-normal">Low</option>
                    <option value="medium" className="text-blue-600 font-bold">Medium</option>
                    <option value="high" className="text-amber-600 font-bold">High</option>
                    <option value="critical" className="text-rose-600 font-black">Critical (SLA Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Dispatch Crew</label>
                  <select
                    value={assignedTechnicianId}
                    onChange={(e) => setAssignedTechnicianId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  >
                    <option value="">NOC Central Engineers</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* OUTAGE AND DOWNTIME CONFIG */}
              <div className="p-4 bg-slate-50 rounded-xl border border-gray-150 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOutageCheckbox"
                    checked={isOutage}
                    onChange={(e) => setIsOutage(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="isOutageCheckbox" className="text-xs font-bold text-gray-700 cursor-pointer">
                    This incident triggered a total Service Outage / Connection Downtime
                  </label>
                </div>

                {isOutage && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 animate-fade-in text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Outage Duration (Hours)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={outageDurationHours}
                        onChange={(e) => setOutageDurationHours(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold text-rose-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Estimate Monthly MRC (RM)</label>
                      <input
                        type="number"
                        value={customMrc}
                        onChange={(e) => setCustomMrc(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <p className="text-[10px] text-gray-400 font-bold">Estimated Rebate Credit</p>
                      <p className="text-xs font-mono font-bold text-brand-600 mt-1">
                        RM {calculatedRebate.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-xs py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-sm"
                >
                  {isEditing ? 'Save Ticket Changes' : 'File Ticket & Start Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLY REBATE CREDIT TO INVOICE MODAL */}
      {showRebateModal && selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full shadow-lg p-6 relative">
            <button
              onClick={() => setShowRebateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-4">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Select Target Billing Invoice</h3>
                <p className="text-xs text-gray-400">Credit outage rebate directly to client recurring invoices</p>
              </div>
            </div>

            <form onSubmit={handleApplyRebateSubmit} className="space-y-4">
              {rebateSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">
                  {rebateSuccess}
                </div>
              )}

              <div className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Ticket:</span>
                  <span className="font-bold text-gray-800">{selectedTicket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client:</span>
                  <span className="font-bold text-gray-800">
                    {clients.find(c => c.id === selectedTicket.clientId)?.name}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 mt-1 font-bold text-gray-800">
                  <span className="text-brand-700">Rebate Amount:</span>
                  <span className="text-brand-600 font-mono">
                    -RM {selectedTicket.rebateAmount?.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Choose Outstanding Invoice *</label>
                {invoices.filter(inv => inv.clientId === selectedTicket.clientId && inv.status !== 'paid').length > 0 ? (
                  <select
                    value={targetInvoiceId}
                    onChange={(e) => setTargetInvoiceId(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600"
                    required
                  >
                    <option value="">-- Choose outstanding client invoice --</option>
                    {invoices
                      .filter(inv => inv.clientId === selectedTicket.clientId && inv.status !== 'paid')
                      .map(inv => (
                        <option key={inv.id} value={inv.id}>
                          Invoice {inv.id} — Total: RM {inv.grandTotal.toLocaleString('en-MY')} ({inv.status.replace('_', ' ')})
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-[11px] leading-relaxed">
                    ⚠️ No outstanding or unpaid invoices found for this client. You can generate recurring invoices first in the <strong>Invoices & Billing</strong> module, or apply this rebate later.
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRebateModal(false)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-xs py-2.5 rounded-lg transition-all"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!targetInvoiceId}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-50"
                >
                  Apply Credit Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
