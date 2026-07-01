import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job, JobStatus, Technician, Invoice } from '../../types';
import { 
  Wrench, Calendar, MapPin, Users, CheckSquare, 
  Play, CheckCircle2, ChevronRight, AlertTriangle, Save,
  Cloud, UploadCloud, Check, AlertCircle, FileText,
  Plus, Trash2, Edit3, Clock, FileCheck, X, ArrowLeft, CheckCircle, Sparkles, TrendingUp, Gauge, FileSignature
} from 'lucide-react';

export const JobsModule: React.FC = () => {
  const { 
    jobs, setJobs, clients, technicians, scheduleJob, completeJobSurvey, 
    activateJobService, closeJob, currentUser, invoices, setInvoices, nextcloudConfig,
    addJobSchedule, deleteJobSchedule, setActiveTab, setTriggerClientCreate
  } = useApp();

  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobs[0]?.id || null);

  // Assignment help states
  const [scheduledDate, setScheduledDate] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

  // Survey checklists help states
  const [cablingMeters, setCablingMeters] = useState<number>(30);
  const [serialNos, setSerialNos] = useState('');
  const [routerAssigned, setRouterAssigned] = useState('WiFi 6 Enterprise Gateway (H-391)');
  const [meshAssigned, setMeshAssigned] = useState('AP Mesh G-390 (FOC)');

  // Modal for adding Job Schedule
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newServiceType, setNewServiceType] = useState('GPON Fiber 1Gbps Installation');
  const [newSiteAddress, setNewSiteAddress] = useState(clients[0]?.address || '');
  const [newScheduledDate, setNewScheduledDate] = useState('');
  const [newSlaDueDate, setNewSlaDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [newStatus, setNewStatus] = useState<JobStatus>('pending_survey');
  const [newScheduleTime, setNewScheduleTime] = useState('Morning Slot (9 AM - 1 PM)');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newDifficulty, setNewDifficulty] = useState<'Standard' | 'Complex' | 'Hazardous'>('Standard');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newSelectedTechs, setNewSelectedTechs] = useState<string[]>([]);

  // Editing details states
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editPriority, setEditPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [editTime, setEditTime] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<'Standard' | 'Complex' | 'Hazardous'>('Standard');
  const [editContactName, setEditContactName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editScheduledDate, setEditScheduledDate] = useState('');
  const [editSelectedTechs, setEditSelectedTechs] = useState<string[]>([]);

  // Verification report states (Proceeding report)
  const [reportOpticalPower, setReportOpticalPower] = useState('-19.5 dBm');
  const [reportFusionLoss, setReportFusionLoss] = useState('0.04 dB');
  const [reportLatency, setReportLatency] = useState('4 ms');
  const [reportSpeedDown, setReportSpeedDown] = useState('940 Mbps');
  const [reportSpeedUp, setReportSpeedUp] = useState('910 Mbps');
  const [reportInstrument, setReportInstrument] = useState('Fluke FiberInspector Pro / OTDR Model 200');
  const [reportSignatoryName, setReportSignatoryName] = useState('');
  const [reportSignatoryTitle, setReportSignatoryTitle] = useState('IT Lead');
  const [reportFeedback, setReportFeedback] = useState('Fiber splicing was neatly performed and speeds meet SLA criteria perfectly.');
  const [reportCablingMeters, setReportCablingMeters] = useState(30);
  const [reportSerialNos, setReportSerialNos] = useState('CDG-9812-WF6 / AP-MESH-90');
  const [reportRouter, setReportRouter] = useState('WiFi 6 Enterprise Gateway (H-391)');
  const [reportMesh, setReportMesh] = useState('AP Mesh G-390 (FOC)');
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportSignatureType, setReportSignatureType] = useState('');

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const clientOfJob = clients.find(c => c.id === selectedJob?.clientId);

  // Local states for inline receipt upload
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [receiptSuccessMsg, setReceiptSuccessMsg] = useState('');

  // Find deposit invoice for the selected job
  const depositInvoice = invoices.find(inv => inv.quotationId === selectedJob?.quotationId && inv.type === 'one-time');
  const isDepositPaid = depositInvoice ? (depositInvoice.status === 'paid' || depositInvoice.receiptUploaded) : true;

  // Sync edit state values when a job is selected
  React.useEffect(() => {
    if (selectedJob) {
      setEditPriority(selectedJob.priority || 'Medium');
      setEditTime(selectedJob.scheduleTime || 'Morning Slot (9 AM - 1 PM)');
      setEditDifficulty(selectedJob.difficultyLevel || 'Standard');
      setEditContactName(selectedJob.contactPersonName || '');
      setEditContactPhone(selectedJob.contactPersonPhone || '');
      setEditNotes(selectedJob.notes || '');
      setEditScheduledDate(selectedJob.scheduledDate || '');
      setEditSelectedTechs(selectedJob.assignedTechnicians || []);

      // Pre-fill report verification fields
      setReportOpticalPower(selectedJob.surveyChecklist?.opticalPower || '-19.5 dBm');
      setReportFusionLoss(selectedJob.surveyChecklist?.fusionLoss || '0.04 dB');
      setReportLatency(selectedJob.surveyChecklist?.latency || '4 ms');
      setReportSpeedDown(selectedJob.surveyChecklist?.measuredSpeedDown || '940 Mbps');
      setReportSpeedUp(selectedJob.surveyChecklist?.measuredSpeedUp || '910 Mbps');
      setReportInstrument(selectedJob.surveyChecklist?.testingInstrument || 'Fluke FiberInspector Pro / OTDR Model 200');
      setReportSignatoryName(selectedJob.surveyChecklist?.signatoryName || '');
      setReportSignatureType(selectedJob.surveyChecklist?.signatoryName || '');
      setReportSignatoryTitle(selectedJob.surveyChecklist?.signatoryTitle || 'IT Lead');
      setReportFeedback(selectedJob.surveyChecklist?.customerFeedback || 'Fiber splicing was neatly performed and speeds meet SLA criteria perfectly.');
      setReportCablingMeters(selectedJob.surveyChecklist?.cablingMetersUsed || 30);
      setReportSerialNos(selectedJob.surveyChecklist?.equipmentSerials || 'CDG-9812-WF6 / AP-MESH-90');
      setReportRouter(selectedJob.surveyChecklist?.routerAssigned || 'WiFi 6 Enterprise Gateway (H-391)');
      setReportMesh(selectedJob.surveyChecklist?.apMeshAssigned || 'AP Mesh G-390 (FOC)');
    }
  }, [selectedJobId, selectedJob]);

  // Handle client selection change in new job schedule modal
  const handleNewClientChange = (clientId: string) => {
    setNewClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setNewSiteAddress(client.address);
    }
  };

  const handleInlineReceiptUpload = (file: File) => {
    if (!depositInvoice) return;
    setIsUploadingReceipt(true);
    setReceiptSuccessMsg('');

    setTimeout(() => {
      setIsUploadingReceipt(false);
      setReceiptSuccessMsg(`Receipt "${file.name}" uploaded successfully!`);

      const paymentId = 'PAY-' + Math.floor(1000 + Math.random() * 9000);
      const newPayment = {
        id: paymentId,
        invoiceId: depositInvoice.id,
        amount: depositInvoice.grandTotal,
        date: new Date().toISOString().split('T')[0],
        method: 'DuitNow QR / Instant Transfer',
        reference: `DNC-${Math.floor(100000 + Math.random()*900000)}`
      };

      const updatedInvoice: Invoice = {
        ...depositInvoice,
        receiptUploaded: true,
        receiptFileName: file.name,
        receiptUploadedAt: new Date().toLocaleString(),
        receiptFileUrl: URL.createObjectURL(file),
        nextcloudReceiptPath: nextcloudConfig.enabled ? `${nextcloudConfig.url}/receipts/${depositInvoice.id}_receipt.pdf` : `/receipts/${depositInvoice.id}_receipt.pdf`,
        payments: [...depositInvoice.payments, newPayment],
        status: 'paid' as const
      };

      setInvoices(prev => prev.map(inv => inv.id === depositInvoice.id ? updatedInvoice : inv));
    }, 1500);
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'pending_survey': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'scheduled': return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'installed': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'activated': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !scheduledDate || selectedTechs.length === 0) {
      alert('Please select a scheduled date and assign at least one field technician.');
      return;
    }
    scheduleJob(selectedJobId, selectedTechs, scheduledDate);
    setSelectedTechs([]);
    setScheduledDate('');
  };

  const handleAddJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId) {
      alert('Please select a client.');
      return;
    }

    const jobData = {
      quotationId: 'Q-MANUAL',
      clientId: newClientId,
      siteAddress: newSiteAddress,
      serviceType: newServiceType,
      assignedTechnicians: newSelectedTechs,
      scheduledDate: newScheduledDate || undefined,
      slaDueDate: newSlaDueDate,
      status: newScheduledDate ? 'scheduled' : 'pending_survey',
      scheduleTime: newScheduleTime,
      priority: newPriority,
      difficultyLevel: newDifficulty,
      contactPersonName: newContactName,
      contactPersonPhone: newContactPhone,
      notes: newNotes
    };

    addJobSchedule(jobData);
    setShowAddModal(false);
    
    // Reset states
    setNewServiceType('GPON Fiber 1Gbps Installation');
    setNewScheduledDate('');
    setNewSelectedTechs([]);
    setNewContactName('');
    setNewContactPhone('');
    setNewNotes('');

    // Select first (newly created) job
    setTimeout(() => {
      if (jobs.length > 0) {
        setSelectedJobId(jobs[0]?.id || null);
      }
    }, 100);
  };

  const handleUpdateDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setJobs(prev => prev.map(j => j.id === selectedJob.id ? {
      ...j,
      priority: editPriority,
      scheduleTime: editTime,
      difficultyLevel: editDifficulty,
      contactPersonName: editContactName,
      contactPersonPhone: editContactPhone,
      notes: editNotes,
      scheduledDate: editScheduledDate || j.scheduledDate,
      assignedTechnicians: editSelectedTechs,
      status: editScheduledDate ? 'scheduled' : j.status
    } : j));

    setIsEditingDetails(false);
  };

  const handleProceedWithReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!reportSignatoryName.trim()) {
      alert('Please enter the customer sign-off representative name.');
      return;
    }

    setReportSuccess('Verification report sealed and certified. Advancing work order state...');

    setTimeout(() => {
      let nextStatus: JobStatus = selectedJob.status;
      if (selectedJob.status === 'scheduled') {
        nextStatus = 'installed';
      } else if (selectedJob.status === 'installed') {
        nextStatus = 'activated';
      } else if (selectedJob.status === 'activated') {
        nextStatus = 'closed';
      }

      setJobs(prev => prev.map(j => {
        if (j.id === selectedJob.id) {
          return {
            ...j,
            status: nextStatus,
            surveyChecklist: {
              completed: true,
              cablingMetersUsed: Number(reportCablingMeters),
              equipmentSerials: reportSerialNos,
              routerAssigned: reportRouter,
              apMeshAssigned: reportMesh,
              opticalPower: reportOpticalPower,
              fusionLoss: reportFusionLoss,
              latency: reportLatency,
              measuredSpeedDown: reportSpeedDown,
              measuredSpeedUp: reportSpeedUp,
              testingInstrument: reportInstrument,
              signatoryName: reportSignatoryName,
              signatoryTitle: reportSignatoryTitle,
              customerFeedback: reportFeedback,
              reportDate: new Date().toISOString().split('T')[0],
              reportSigned: true
            }
          };
        }
        return j;
      }));

      if (selectedJob.status === 'scheduled') {
        completeJobSurvey(selectedJob.id, Number(reportCablingMeters), reportSerialNos, reportRouter, reportMesh);
      } else if (selectedJob.status === 'installed') {
        activateJobService(selectedJob.id);
      } else if (selectedJob.status === 'activated') {
        closeJob(selectedJob.id);
      }

      setReportSuccess('');
    }, 1200);
  };

  const handleCompleteSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;
    completeJobSurvey(selectedJobId, Number(cablingMeters), serialNos, routerAssigned, meshAssigned);
    setSerialNos('');
  };

  const handleTechCheckboxChange = (name: string, checked: boolean) => {
    if (checked) {
      setSelectedTechs(prev => [...prev, name]);
    } else {
      setSelectedTechs(prev => prev.filter(t => t !== name));
    }
  };

  const handleNewTechCheckboxChange = (name: string, checked: boolean) => {
    if (checked) {
      setNewSelectedTechs(prev => [...prev, name]);
    } else {
      setNewSelectedTechs(prev => prev.filter(t => t !== name));
    }
  };

  const handleEditTechCheckboxChange = (name: string, checked: boolean) => {
    if (checked) {
      setEditSelectedTechs(prev => [...prev, name]);
    } else {
      setEditSelectedTechs(prev => prev.filter(t => t !== name));
    }
  };

  const isTechnicianUser = currentUser.role === 'technician';
  const canModifySchedule = currentUser.role === 'admin' || currentUser.role === 'sales_rep';

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-xs font-sans">
        {/* Left: Work Orders Queue */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2 font-sans">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-gray-800">Field Dispatch Queue</h3>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded w-max mt-1">
                {jobs.filter(j => j.status !== 'closed').length} active
              </span>
            </div>
            {canModifySchedule && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-[10px] uppercase px-2.5 py-1.5 rounded flex items-center gap-1 transition-all shadow-xs shrink-0 font-sans"
                title="Create Manual Job Schedule"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Schedule</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100 max-h-[550px] overflow-y-auto font-sans">
            {jobs.map((job) => {
              const client = clients.find(c => c.id === job.clientId);
              const isSelected = selectedJobId === job.id;
              const isSlaBreached = new Date() > new Date(job.slaDueDate) && !['activated', 'closed'].includes(job.status);

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 cursor-pointer hover:bg-slate-50/50 transition-all space-y-2 font-sans ${
                    isSelected ? 'bg-brand-50/20 border-l-4 border-brand-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-mono font-bold text-gray-400">{job.refNo}</span>
                    <div className="flex items-center gap-1.5 shrink-0 font-sans">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                      {canModifySchedule && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete the job schedule ${job.refNo}?`)) {
                              deleteJobSchedule(job.id);
                              if (selectedJobId === job.id) {
                                setSelectedJobId(null);
                              }
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all font-sans"
                          title="Delete Job Schedule"
                        >
                          <Trash2 className="w-3.5 h-3.5 font-sans" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 truncate text-[11px] font-sans">{job.serviceType}</h4>
                    <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5 font-sans">{client?.name}</p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1.5 border-t border-gray-50 font-sans">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{job.scheduledDate || 'Not Scheduled'}</span>
                    </span>
                    <span className={`font-bold ${isSlaBreached ? 'text-rose-600 animate-pulse' : 'text-gray-400'}`}>
                      SLA: {job.slaDueDate}
                    </span>
                  </div>
                </div>
              );
            })}
            {jobs.length === 0 && (
              <p className="text-center py-12 text-gray-400">No work orders scheduled. Use "Add Schedule" to configure manual schedules.</p>
            )}
          </div>
        </div>

        {/* Right: Job Details, Schedules, and Site Checklists */}
        <div className="lg:col-span-2 space-y-6">
          {selectedJob ? (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-6">
              {/* Job Header */}
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono font-bold text-gray-400 text-xs">{selectedJob.refNo}</span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusColor(selectedJob.status)}`}>
                      {selectedJob.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 font-sans">{selectedJob.serviceType}</h3>
                  <p className="text-xs text-brand-600 font-bold mt-1 font-sans">{clientOfJob?.name}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">SLA Target Date</p>
                  <p className="font-mono font-bold text-sm text-gray-800 mt-0.5">{selectedJob.slaDueDate}</p>
                  {new Date() > new Date(selectedJob.slaDueDate) && !['activated', 'closed'].includes(selectedJob.status) && (
                    <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 justify-end mt-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>SLA Breach Risk!</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Site Details info */}
              <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-gray-50 border border-gray-100 text-xs font-sans">
                <div className="space-y-1">
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">Physical Location</p>
                  <p className="font-bold text-gray-800 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{selectedJob.siteAddress}</span>
                  </p>
                </div>
                <div className="space-y-1 border-l border-gray-200 pl-6">
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">Assigned Dispatch Team</p>
                  <p className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-500" />
                    <span>{selectedJob.assignedTechnicians.join(' & ') || 'Pending Assignment'}</span>
                  </p>
                </div>
              </div>

              {/* SCHEDULE SPECIFICATIONS & DETAILS */}
              <div className="border border-gray-150 rounded-xl overflow-hidden shadow-xs bg-slate-50/50 font-sans">
                <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
                  <h4 className="font-bold text-gray-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>Job Schedule Details & Onsite Parameters</span>
                  </h4>
                  {canModifySchedule && !isEditingDetails && (
                    <button
                      onClick={() => setIsEditingDetails(true)}
                      className="text-brand-600 hover:text-brand-700 font-bold text-xs flex items-center gap-1 hover:underline"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                  )}
                </div>

                {isEditingDetails ? (
                  <form onSubmit={handleUpdateDetailsSubmit} className="p-4 bg-white space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Priority</label>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as any)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Schedule Time Slot</label>
                        <input
                          type="text"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Difficulty</label>
                        <select
                          value={editDifficulty}
                          onChange={(e) => setEditDifficulty(e.target.value as any)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Complex">Complex Splicing</option>
                          <option value="Hazardous">Hazardous/Confined Space</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Execution Date</label>
                        <input
                          type="date"
                          value={editScheduledDate}
                          onChange={(e) => setEditScheduledDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Contact Person Name</label>
                        <input
                          type="text"
                          value={editContactName}
                          onChange={(e) => setEditContactName(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={editContactPhone}
                          onChange={(e) => setEditContactPhone(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Special Technicians Assignment</label>
                      <div className="grid grid-cols-2 gap-2 mt-1 bg-gray-50 p-2 border border-gray-100 rounded">
                        {technicians.map(t => (
                          <label key={t.id} className="flex items-center gap-1.5 cursor-pointer font-medium select-none text-gray-700">
                            <input
                              type="checkbox"
                              value={t.name}
                              checked={editSelectedTechs.includes(t.name)}
                              onChange={(e) => handleEditTechCheckboxChange(t.name, e.target.checked)}
                              className="rounded text-brand-600 focus:ring-brand-600 border-gray-300"
                            />
                            <span>{t.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Special Instructions / Notes</label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600 text-gray-800"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsEditingDetails(false)}
                        className="px-3 py-1.5 font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded shadow-xs"
                      >
                        Save Details
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-3">
                      <div>
                        <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Priority Urgency</p>
                        <span className={`inline-flex items-center gap-1 font-bold mt-1 px-2.5 py-0.5 rounded-full text-[10px] ${
                          selectedJob.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                          selectedJob.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          selectedJob.priority === 'Low' ? 'bg-slate-100 text-slate-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span>{selectedJob.priority || 'Medium'}</span>
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Schedule Time Slot</p>
                        <p className="font-bold text-gray-700 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{selectedJob.scheduleTime || 'Morning Slot (9 AM - 1 PM)'}</span>
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Difficulty Classification</p>
                        <p className="font-bold text-gray-700 mt-0.5 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                          <span>{selectedJob.difficultyLevel || 'Standard'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 sm:border-l sm:border-gray-150 sm:pl-4">
                      <div>
                        <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Onsite Contact Representative</p>
                        <p className="font-bold text-gray-800 mt-0.5">
                          {selectedJob.contactPersonName || 'Client Site Contact Person'}
                        </p>
                        <p className="text-brand-600 font-mono font-medium mt-0.5">
                          {selectedJob.contactPersonPhone || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Special Dispatch Notes</p>
                        <p className="text-gray-600 mt-1 italic leading-relaxed text-[10px] bg-white p-2 border border-gray-100 rounded-lg">
                          "{selectedJob.notes || 'No special dispatch notes logged. Onsite technicians to proceed with standard splicing and physical cabling setup.'}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FIELD VERIFICATION & COMPLETION REPORT */}
              <div className="border border-emerald-150 rounded-xl overflow-hidden shadow-xs bg-white font-sans">
                <div className="px-4 py-3 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-emerald-300" />
                    <h4 className="font-bold text-[11px] uppercase tracking-wider">
                      Onsite Service Verification & Compliance Report
                    </h4>
                  </div>
                  {selectedJob.surveyChecklist?.reportSigned ? (
                    <span className="text-[9px] font-extrabold uppercase bg-emerald-500 text-white px-2.5 py-0.5 rounded-full border border-emerald-300 animate-pulse flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Certified Compliant</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase bg-amber-500 text-white px-2.5 py-0.5 rounded-full">
                      Pending Onsite Report
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-6 font-sans">
                  {/* Visual Paper Sheet Layout */}
                  <div className="bg-slate-50 border border-gray-200 rounded-lg p-5 shadow-inner relative overflow-hidden">
                    {/* Watermark for sealed report */}
                    {selectedJob.surveyChecklist?.reportSigned && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 select-none pointer-events-none opacity-[0.06] border-4 border-emerald-600 text-emerald-600 font-black text-4xl p-4 tracking-widest uppercase rounded">
                        POIS SEALED & CLOSED
                      </div>
                    )}

                    <div className="flex justify-between items-start border-b border-gray-300 pb-3">
                      <div>
                        <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider">POIS SOLUTIONS FIELD OPS REPORT</h5>
                        <p className="text-[9px] text-gray-400 font-mono font-medium mt-0.5">DOC-REF: {selectedJob.refNo}/REP/{selectedJob.surveyChecklist?.completed ? 'VERIFIED' : 'PENDING'}</p>
                      </div>
                      <Wrench className="w-8 h-8 text-slate-300" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-250 text-[10px] text-gray-600">
                      <div>
                        <p className="font-bold">Client Enterprise:</p>
                        <p className="font-medium text-gray-800">{clientOfJob?.name}</p>
                        <p className="font-mono mt-0.5">{clientOfJob?.companyName}</p>
                      </div>
                      <div>
                        <p className="font-bold">Dispatch Location:</p>
                        <p className="font-medium text-gray-800 line-clamp-2">{selectedJob.siteAddress}</p>
                      </div>
                    </div>

                    {selectedJob.surveyChecklist?.reportSigned || selectedJob.status === 'closed' ? (
                      /* Display sealed report measurements */
                      <div className="space-y-4 pt-3 text-xs">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-white p-2 border border-gray-150 rounded">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Optical Power</p>
                            <p className="font-mono font-black text-gray-800 text-xs mt-0.5">{selectedJob.surveyChecklist?.opticalPower}</p>
                          </div>
                          <div className="bg-white p-2 border border-gray-150 rounded">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Splicing Loss</p>
                            <p className="font-mono font-black text-gray-800 text-xs mt-0.5">{selectedJob.surveyChecklist?.fusionLoss}</p>
                          </div>
                          <div className="bg-white p-2 border border-gray-150 rounded">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Ping Latency</p>
                            <p className="font-mono font-black text-gray-800 text-xs mt-0.5">{selectedJob.surveyChecklist?.latency}</p>
                          </div>
                          <div className="bg-white p-2 border border-gray-150 rounded">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Measured Speeds</p>
                            <p className="font-mono font-black text-gray-800 text-[10px] mt-0.5 truncate">{selectedJob.surveyChecklist?.measuredSpeedDown} / {selectedJob.surveyChecklist?.measuredSpeedUp}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-gray-600">
                          <div className="space-y-1 bg-white p-3 border border-gray-150 rounded">
                            <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Hardware & Cabling Logged</p>
                            <p className="mt-1"><strong>Cabling drop:</strong> {selectedJob.surveyChecklist?.cablingMetersUsed} meters</p>
                            <p><strong>Gateway Serial:</strong> {selectedJob.surveyChecklist?.equipmentSerials}</p>
                            <p><strong>Gateway model:</strong> {selectedJob.surveyChecklist?.routerAssigned}</p>
                            <p><strong>AP Mesh hardware:</strong> {selectedJob.surveyChecklist?.apMeshAssigned}</p>
                          </div>

                          <div className="space-y-1 bg-white p-3 border border-gray-150 rounded">
                            <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Client Certification Seal</p>
                            <p className="mt-1"><strong>Representative:</strong> {selectedJob.surveyChecklist?.signatoryName}</p>
                            <p><strong>Title:</strong> {selectedJob.surveyChecklist?.signatoryTitle}</p>
                            <p className="italic text-gray-500 mt-1 bg-slate-50 p-1.5 rounded border border-gray-100">"{selectedJob.surveyChecklist?.customerFeedback}"</p>
                            <div className="mt-2 pt-1 border-t border-dashed border-gray-200">
                              <p className="font-bold text-[9px] text-slate-400 uppercase">Authorized Signature</p>
                              <p className="font-serif italic text-sm text-brand-700 tracking-wide mt-1 font-bold">/s/ {selectedJob.surveyChecklist?.signatoryName}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Form to fill report and proceed */
                      <form onSubmit={handleProceedWithReportSubmit} className="space-y-4 pt-3 text-xs">
                        <div className="p-3 bg-amber-50 border border-amber-150 text-amber-800 rounded-lg text-[10px] leading-relaxed">
                          <p className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Action Required to Proceed Work Order Workflow</span>
                          </p>
                          Complete this Field Report to verify optical splicing parameters, list hardware, and acquire client representative sign-off. **Submitting this report immediately seals the dispatch log and advances the work order status.**
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="font-bold text-gray-500 block mb-1">Fiber Splicing Loss (dB)</label>
                            <input
                              type="text"
                              required
                              value={reportFusionLoss}
                              onChange={(e) => setReportFusionLoss(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 font-mono text-gray-800"
                              placeholder="e.g. 0.04 dB"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-500 block mb-1">Optical Signal Level (dBm)</label>
                            <input
                              type="text"
                              required
                              value={reportOpticalPower}
                              onChange={(e) => setReportOpticalPower(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 font-mono text-gray-800"
                              placeholder="e.g. -19.5 dBm"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-500 block mb-1">Ping Latency (ms)</label>
                            <input
                              type="text"
                              required
                              value={reportLatency}
                              onChange={(e) => setReportLatency(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 font-mono text-gray-800"
                              placeholder="e.g. 4 ms"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-500 block mb-1">Measured Speed Downstream</label>
                            <input
                              type="text"
                              required
                              value={reportSpeedDown}
                              onChange={(e) => setReportSpeedDown(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 font-mono text-gray-800"
                              placeholder="e.g. 940 Mbps"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-500 block mb-1">Measured Speed Upstream</label>
                            <input
                              type="text"
                              required
                              value={reportSpeedUp}
                              onChange={(e) => setReportSpeedUp(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 font-mono text-gray-800"
                              placeholder="e.g. 910 Mbps"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-500 block mb-1">Fiber Splicing Test Instrument</label>
                            <input
                              type="text"
                              required
                              value={reportInstrument}
                              onChange={(e) => setReportInstrument(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 text-gray-800"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-500 block mb-1">Cabling length drops (meters) *</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={reportCablingMeters}
                              onChange={(e) => setReportCablingMeters(Number(e.target.value))}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 font-mono text-gray-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="font-bold text-gray-500 block mb-1">Gateway Serials *</label>
                            <input
                              type="text"
                              required
                              value={reportSerialNos}
                              onChange={(e) => setReportSerialNos(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 font-mono text-gray-800"
                              placeholder="Gateway Serials"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-gray-500 block mb-1">Router Model</label>
                            <input
                              type="text"
                              value={reportRouter}
                              onChange={(e) => setReportRouter(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 text-gray-800"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-gray-500 block mb-1">AP Mesh Model</label>
                            <input
                              type="text"
                              value={reportMesh}
                              onChange={(e) => setReportMesh(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 text-gray-800"
                            />
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Client Representative Name *</label>
                            <input
                              type="text"
                              required
                              value={reportSignatoryName}
                              onChange={(e) => {
                                setReportSignatoryName(e.target.value);
                                if (!reportSignatureType) setReportSignatureType(e.target.value);
                              }}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 text-gray-800 font-bold"
                              placeholder="e.g. Sarah Tan"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Representative Corporate Title *</label>
                            <input
                              type="text"
                              required
                              value={reportSignatoryTitle}
                              onChange={(e) => setReportSignatoryTitle(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-1.5 text-gray-800 font-bold"
                              placeholder="e.g. IT Manager"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-gray-700 block mb-1">Client Comments & Feedback</label>
                          <textarea
                            value={reportFeedback}
                            onChange={(e) => setReportFeedback(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded p-1.5 text-gray-800"
                            rows={2}
                            placeholder="e.g. Excellent signal stability, splicing team completed work ahead of SLA target."
                          />
                        </div>

                        {/* Signature block */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 font-sans">
                          <label className="font-bold text-gray-800 flex items-center gap-1.5">
                            <FileSignature className="w-4 h-4 text-brand-600" />
                            <span>Corporate Sign-off Signature Authorisation</span>
                          </label>
                          <p className="text-[10px] text-gray-400">Type representative's full name to generate official certified corporate signature.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <input
                              type="text"
                              required
                              value={reportSignatureType}
                              onChange={(e) => setReportSignatureType(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded p-2 text-xs font-serif font-black focus:ring-1 focus:ring-brand-600 text-brand-800"
                              placeholder="Type representative name to sign"
                            />
                            <div className="bg-slate-50 border border-dashed border-gray-300 rounded p-2.5 text-center h-12 flex items-center justify-center">
                              {reportSignatureType ? (
                                <span className="font-serif italic text-base tracking-wide text-brand-700 font-bold select-none">
                                  /s/ {reportSignatureType}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">Signature preview will appear here</span>
                              )}
                            </div>
                          </div>
                          <label className="flex items-start gap-2 pt-1 font-medium text-[10px] cursor-pointer">
                            <input
                              type="checkbox"
                              required
                              className="rounded text-brand-600 focus:ring-brand-600 border-gray-300 mt-0.5"
                            />
                            <span className="text-gray-600 leading-normal">
                              I certify that all optical connections, cabling lengths, and hardware parameters have been field-tested on site and meet Malaysian Communications and Multimedia Commission (MCMC) QoS standards.
                            </span>
                          </label>
                        </div>

                        {reportSuccess ? (
                          <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-lg text-xs font-bold animate-pulse flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></span>
                            <span>{reportSuccess}</span>
                          </div>
                        ) : (
                          <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] uppercase"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span>
                              {selectedJob.status === 'scheduled' ? 'Sign & Proceed (Conduct Physical Site Installation)' :
                               selectedJob.status === 'installed' ? 'Sign & Proceed (Activate Core Fiber Parameters)' :
                               'Sign & Proceed (Lock Certification & Commencing Contract Billing)'}
                            </span>
                          </button>
                        )}
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* STAGE 1: Scheduler (Locked when status != pending_survey) */}
              {selectedJob.status === 'pending_survey' && (
                <div className="p-5 border border-brand-100 bg-brand-50/20 rounded-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-600" />
                    <h4 className="font-bold text-brand-950 text-sm">Schedule Engineer Dispatch</h4>
                  </div>
                  
                  {!isDepositPaid ? (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg space-y-1">
                        <p className="font-extrabold flex items-center gap-1.5 text-amber-900 font-bold">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>DuitNow Deposit Receipt Pending</span>
                        </p>
                        <p className="leading-relaxed text-[11px]">
                          Field technicians cannot be scheduled until the DuitNow deposit invoice payment receipt is uploaded. This is required to start the project and secure the physical survey/installation slot.
                        </p>
                        <p className="font-bold text-amber-950 mt-1.5">
                          Deposit Invoice: <span className="font-mono underline">{depositInvoice?.id}</span> — Amount Due: <span className="font-bold text-brand-900">RM {depositInvoice?.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                        </p>
                      </div>

                      {/* Inline DuitNow Transfer & Drag & Drop Receipt Upload block */}
                      <div className="bg-white p-4 border border-gray-100 rounded-lg space-y-3 shadow-inner">
                        <p className="font-bold text-gray-700">Scan DuitNow QR or Transfer to MAYBANK 5142-9904-8931 (POIS Solutions Sdn Bhd)</p>
                        
                        {receiptSuccessMsg ? (
                          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold animate-fade-in flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>{receiptSuccessMsg} Scheduling unlocked!</span>
                          </div>
                        ) : (
                          <div 
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleInlineReceiptUpload(e.dataTransfer.files[0]); }}
                            className={`border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer ${
                              dragActive ? 'border-brand-600 bg-brand-50/50' : 'border-gray-200 hover:border-brand-500 hover:bg-slate-50'
                            }`}
                          >
                            <input 
                              type="file" 
                              id="inline-receipt-file" 
                              accept="image/*,application/pdf"
                              className="hidden" 
                              onChange={(e) => { if (e.target.files?.[0]) handleInlineReceiptUpload(e.target.files[0]); }}
                            />
                            <label htmlFor="inline-receipt-file" className="cursor-pointer space-y-1.5 block">
                              <UploadCloud className="w-8 h-8 text-gray-400 mx-auto" />
                              <div>
                                <p className="font-bold text-gray-700 text-xs">Drag & Drop DuitNow Receipt Here</p>
                                <p className="text-[9px] text-gray-400 font-medium">or click to upload bank transfer slip to unlock scheduling immediately</p>
                              </div>
                            </label>

                            {isUploadingReceipt && (
                              <div className="mt-3 flex items-center justify-center gap-2 text-brand-600 font-bold text-[11px]">
                                <span className="w-3.5 h-3.5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></span>
                                <span>Verifying DuitNow receipt and unlocking project scheduling...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : canModifySchedule ? (
                    <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-gray-700">Scheduled Execution Date <span className="text-rose-600">*</span></label>
                          <input
                            type="date"
                            required
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-gray-700">Assign Onsite Field Technicians <span className="text-rose-600">*</span></label>
                          <div className="space-y-1.5 mt-1 bg-white p-2 border border-gray-100 rounded">
                            {technicians.map(t => (
                              <label key={t.id} className="flex items-center gap-2 cursor-pointer font-medium select-none">
                                <input
                                  type="checkbox"
                                  value={t.name}
                                  checked={selectedTechs.includes(t.name)}
                                  onChange={(e) => handleTechCheckboxChange(t.name, e.target.checked)}
                                  className="rounded text-brand-600 focus:ring-brand-600 border-gray-300"
                                />
                                <span>{t.name} (Active Field)</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-lg transition-all"
                      >
                        Schedule Dispatch
                      </button>
                    </form>
                  ) : (
                    <p className="text-gray-500 font-medium font-sans">Scheduling access restricted. Ask Sales Rep or Admin to schedule dispatcher dispatch.</p>
                  )}
                </div>
              )}

              {/* STAGE 2: Site Survey & Installation Checklists (Active when status == scheduled) */}
              {selectedJob.status === 'scheduled' && (
                <div className="p-5 border border-amber-100 bg-amber-50/20 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 font-sans">
                    <CheckSquare className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-amber-950 text-sm">Site Survey & Physical Installation Checklist</h4>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    Field execution form. Document actual cabling length and hardware serials issued. <strong>Cabling meters reported here reconcile directly back into final invoice totals</strong> upon closure.
                  </p>

                  <form onSubmit={handleCompleteSurveySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700">Actual Fiber Cabling Length Used (meters) *</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            required
                            value={cablingMeters}
                            onChange={(e) => setCablingMeters(Number(e.target.value))}
                            className="w-full bg-white border border-gray-200 rounded p-2 font-black text-gray-800 text-sm"
                          />
                          <span className="text-gray-500 font-bold shrink-0 font-sans">meters</span>
                        </div>
                        <p className="text-[10px] text-gray-400">Default is estimate. Actual meters &gt; quote triggers auto-billing adjustments.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700">Hardware Gateway Serial Numbers *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CDG-9812-WF6 / MSH-231-G"
                          value={serialNos}
                          onChange={(e) => setSerialNos(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-2 font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700">WiFi 6 Corporate Router Model</label>
                        <input
                          type="text"
                          value={routerAssigned}
                          onChange={(e) => setRouterAssigned(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-2 text-gray-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700">Assigned AP Mesh Hardware</label>
                        <input
                          type="text"
                          value={meshAssigned}
                          onChange={(e) => setMeshAssigned(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-2 text-gray-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Installation Checklists</span>
                    </button>
                  </form>
                </div>
              )}

              {/* STAGE 3: Core NOC activation (Active when status == installed) */}
              {selectedJob.status === 'installed' && (
                <div className="p-5 border border-cyan-100 bg-cyan-50/20 rounded-lg space-y-3 font-sans">
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-cyan-600" />
                    <h4 className="font-bold text-cyan-950 text-sm">Backbone NOC Connectivity Activation</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px] font-sans">
                    Cabling and hardware active. Handover parameters ready. Click below to ping backbone routers and activate fiber line parameters to commence active service.
                  </p>
                  <button
                    onClick={() => activateJobService(selectedJob.id)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm mt-2"
                  >
                    <span>Activate Backbone Fiber Link (NOC Ping)</span>
                  </button>
                </div>
              )}

              {/* STAGE 4: Customer acceptance handover (Active when status == activated) */}
              {selectedJob.status === 'activated' && (
                <div className="p-5 border border-emerald-100 bg-emerald-50/20 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-emerald-950 text-sm">Customer Acceptance & Work-Order Closure</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px]">
                    The fiber trunk line has been activated on the core network. Handover the certificate of completion to the client, acquire signed seal approval, and click below to lock contract terms.
                  </p>
                  <button
                    onClick={() => closeJob(selectedJob.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm mt-2"
                  >
                    <span>Close Work Order (Lock Contract & Commencing Billing)</span>
                  </button>
                </div>
              )}

              {/* STAGE 5: Completed / Closed details */}
              {selectedJob.status === 'closed' && (
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Closed & Fully Billing Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <p className="font-bold">Actual Cabling length logged:</p>
                      <p className="font-mono">{selectedJob.surveyChecklist?.cablingMetersUsed || 'N/A'} meters</p>
                    </div>
                    <div>
                      <p className="font-bold">Hardware Gateway Serials:</p>
                      <p className="font-mono">{selectedJob.surveyChecklist?.equipmentSerials || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Monthly lease recurring invoices will auto-compile for each billing cycle.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-16 rounded-xl border border-gray-100 shadow-xs text-center text-gray-400">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">Select Dispatch Work Order</p>
              <p className="text-xs mt-1">Select an active work order from the dispatcher queue to manage schedules, technician logs, or complete site checklist validations.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD MANUAL JOB SCHEDULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-xl max-w-2xl w-full shadow-2xl p-6 space-y-4 my-8 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>Create Manual Job Schedule</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddJobSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Select Client *</label>
                  <select
                    value={newClientId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'ADD_NEW_CLIENT') {
                        setShowAddModal(false);
                        setTriggerClientCreate(true);
                        setActiveTab('clients');
                      } else {
                        handleNewClientChange(val);
                      }
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600 font-bold"
                    required
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
                    ))}
                    <option value="ADD_NEW_CLIENT" className="text-brand-600 font-bold bg-slate-50">+ Add New Client...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Service Type *</label>
                  <input
                    type="text"
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600 font-bold"
                    required
                    placeholder="e.g. GPON Fiber 1Gbps Installation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Installation Site Address *</label>
                <textarea
                  value={newSiteAddress}
                  onChange={(e) => setNewSiteAddress(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600"
                  required
                  rows={2}
                  placeholder="Enter detailed physical address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Schedule Execution Date</label>
                  <input
                    type="date"
                    value={newScheduledDate}
                    onChange={(e) => setNewScheduledDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600 font-bold"
                  />
                  <p className="text-[9px] text-gray-400 mt-0.5">Leave blank for Pending confirmation</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Schedule Time / Slot</label>
                  <select
                    value={newScheduleTime}
                    onChange={(e) => setNewScheduleTime(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600 font-bold"
                  >
                    <option value="Morning Slot (9 AM - 1 PM)">Morning Slot (9 AM - 1 PM)</option>
                    <option value="Afternoon Slot (2 PM - 5 PM)">Afternoon Slot (2 PM - 5 PM)</option>
                    <option value="Evening Slot (6 PM - 9 PM)">Evening Slot (6 PM - 9 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">SLA Target Date *</label>
                  <input
                    type="date"
                    value={newSlaDueDate}
                    onChange={(e) => setNewSlaDueDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600 font-bold"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Difficulty Level</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600 font-bold"
                  >
                    <option value="Standard">Standard Execution</option>
                    <option value="Complex">Complex Splicing</option>
                    <option value="Hazardous">Hazardous/Confined Space</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Onsite Contact Name</label>
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600"
                    placeholder="e.g. Encik Haris"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Onsite Contact Phone</label>
                  <input
                    type="text"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600 font-bold"
                    placeholder="e.g. +6012-3456789"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Special Dispatch / Notes</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-800 focus:ring-1 focus:ring-brand-600"
                    placeholder="e.g. Keys at security desk. High-ladder splicing set needed."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Assign Onsite Field Technicians</label>
                <div className="grid grid-cols-2 gap-2 mt-1 bg-gray-50 p-2.5 border border-gray-100 rounded-lg font-sans">
                  {technicians.map(t => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer font-medium select-none text-gray-700">
                      <input
                        type="checkbox"
                        value={t.name}
                        checked={newSelectedTechs.includes(t.name)}
                        onChange={(e) => handleNewTechCheckboxChange(t.name, e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-600 border-gray-300 font-sans"
                      />
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100 font-sans">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-xs font-sans"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default JobsModule;
