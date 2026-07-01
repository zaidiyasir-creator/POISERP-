import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PoisLogo } from '../../components/ui/PoisLogo';
import { Quotation, QuotationLineItem, CostingLine, QuotationStatus, Client, CatalogItem } from '../../types';
import { 
  calculateTotals, calculateCosting, DEFAULT_SST_RATE 
} from '../../domain/pricingEngine';
import { 
  Plus, Search, FileText, Eye, Printer, DollarSign, 
  Check, ShieldCheck, AlertCircle, Trash2, Edit, ChevronRight, UserCheck,
  Mail, Cloud, ExternalLink, Download
} from 'lucide-react';
import { downloadQuotationPDF } from '../../utils/pdfGenerator';

export const QuotationsModule: React.FC = () => {
  const { 
    quotations, clients, catalog, saveQuotation, verifyCosting, 
    approveQuotation, acceptQuotation, rejectQuotation, currentUser, nextcloudConfig,
    setActiveTab, setTriggerClientCreate
  } = useApp();

  // Filter and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Active quotation for view details
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [viewMode, setViewMode] = useState<'client' | 'costing'>('client');

  // Email sending modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [archiveNextcloud, setArchiveNextcloud] = useState(true);

  // Create/Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formQuote, setFormQuote] = useState<Partial<Quotation>>({
    title: '',
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    costings: [],
    validityWeeks: 2,
    deliveryDays: 14,
    paymentTerms: 'Refundable Deposit on PO + balance on delivery/activation',
    lockInMonths: 24,
    notes: ''
  });

  // Help state to build items inside form
  const [selectedCatalogCode, setSelectedCatalogCode] = useState('');
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemQty, setCustomItemQty] = useState(1);
  const [customItemPrice, setCustomItemPrice] = useState(0);
  const [customItemFoc, setCustomItemFoc] = useState(false);
  const [customItemTaxable, setCustomItemTaxable] = useState(true);

  // Supplier cost help state
  const [tempUnitCost, setTempUnitCost] = useState(0);
  const [tempSupplier, setTempSupplier] = useState('');

  // Handle opening builder for a new quote
  const handleOpenNewBuilder = () => {
    const nextNum = quotations.length + 1001;
    setFormQuote({
      id: 'Q-' + nextNum,
      refNo: `POIS/2026/QT-${nextNum}`,
      title: 'Broadband / Line Connection Provisioning',
      clientId: clients[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      costings: [],
      validityWeeks: 2,
      deliveryDays: 14,
      paymentTerms: 'Refundable Deposit on PO + balance on delivery/activation',
      lockInMonths: 24,
      notes: '',
      preparedBy: currentUser.name,
      hodApproved: false,
      ceoApproved: false,
      status: 'draft'
    });
    setIsFormOpen(true);
  };

  const handleAddLineItem = () => {
    let code = selectedCatalogCode;
    let desc = customItemDesc;
    let price = customItemPrice;
    let taxable = customItemTaxable;

    if (code) {
      const catItem = catalog.find(item => item.code === code);
      if (catItem) {
        desc = catItem.name;
        price = catItem.unit_price;
        taxable = catItem.taxable;
      }
    } else {
      code = 'CUSTOM-' + Math.floor(100 + Math.random() * 900);
    }

    if (!desc) {
      alert('Please specify a description or choose a catalog item.');
      return;
    }

    const newLine: QuotationLineItem = {
      id: 'QLI-' + Math.floor(1000 + Math.random() * 9000),
      itemCode: code,
      description: desc,
      qty: Number(customItemQty),
      unitPrice: Number(price),
      isFoc: customItemFoc,
      taxable: taxable
    };

    // Auto-generate costing line estimate
    const defaultCost = Number((price * 0.6).toFixed(2)); // standard 40% margin assumption
    const newCostLine: CostingLine = {
      itemCode: code,
      unitCost: tempUnitCost || defaultCost,
      supplier: tempSupplier || 'Main Carrier (TM/Maxis)',
      discount: 0
    };

    const updatedItems = [...(formQuote.items || []), newLine];
    const updatedCostings = [...(formQuote.costings || []), newCostLine];

    // Compute subtotal, sst and grand total
    const totals = calculateTotals(updatedItems, DEFAULT_SST_RATE);
    const costingsCalc = calculateCosting(updatedItems, updatedCostings, totals.grandTotal);

    setFormQuote(prev => ({
      ...prev,
      items: updatedItems,
      costings: updatedCostings,
      subtotal: totals.subtotal,
      sstTotal: totals.sstTotal,
      grandTotal: totals.grandTotal,
      totalUnitCost: costingsCalc.totalUnitCost,
      grossProfitRm: costingsCalc.grossProfitRm,
      grossProfitGpPercent: costingsCalc.grossProfitGpPercent,
      requiresCeoApproval: costingsCalc.requiresCeoApproval
    }));

    // Reset helpers
    setSelectedCatalogCode('');
    setCustomItemDesc('');
    setCustomItemQty(1);
    setCustomItemPrice(0);
    setCustomItemFoc(false);
    setCustomItemTaxable(true);
    setTempUnitCost(0);
    setTempSupplier('');
  };

  const handleRemoveLineItem = (id: string, code: string) => {
    const updatedItems = (formQuote.items || []).filter(item => item.id !== id);
    const updatedCostings = (formQuote.costings || []).filter(c => c.itemCode !== code);

    const totals = calculateTotals(updatedItems, DEFAULT_SST_RATE);
    const costingsCalc = calculateCosting(updatedItems, updatedCostings, totals.grandTotal);

    setFormQuote(prev => ({
      ...prev,
      items: updatedItems,
      costings: updatedCostings,
      subtotal: totals.subtotal,
      sstTotal: totals.sstTotal,
      grandTotal: totals.grandTotal,
      totalUnitCost: costingsCalc.totalUnitCost,
      grossProfitRm: costingsCalc.grossProfitRm,
      grossProfitGpPercent: costingsCalc.grossProfitGpPercent,
      requiresCeoApproval: costingsCalc.requiresCeoApproval
    }));
  };

  const handleSubmitBuilder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuote.clientId) {
      alert('Please link a corporate client.');
      return;
    }
    if (!formQuote.items || formQuote.items.length === 0) {
      alert('Please add at least one billable service line item.');
      return;
    }

    const saved: Quotation = {
      id: formQuote.id!,
      refNo: formQuote.refNo!,
      clientId: formQuote.clientId,
      date: formQuote.date || new Date().toISOString().split('T')[0],
      title: formQuote.title || 'Fiber connectivity & line rental',
      preparedBy: formQuote.preparedBy || currentUser.name,
      items: formQuote.items,
      costings: formQuote.costings || [],
      sstRate: DEFAULT_SST_RATE,
      subtotal: formQuote.subtotal || 0,
      sstTotal: formQuote.sstTotal || 0,
      grandTotal: formQuote.grandTotal || 0,
      status: (formQuote.status as QuotationStatus) || 'draft',
      validityWeeks: Number(formQuote.validityWeeks) || 2,
      deliveryDays: Number(formQuote.deliveryDays) || 14,
      paymentTerms: formQuote.paymentTerms || 'Deposit upfront on PO',
      lockInMonths: Number(formQuote.lockInMonths) || 24,
      hodApproved: formQuote.hodApproved || false,
      ceoApproved: formQuote.ceoApproved || false,
      notes: formQuote.notes,
      totalUnitCost: formQuote.totalUnitCost || 0,
      grossProfitRm: formQuote.grossProfitRm || 0,
      grossProfitGpPercent: formQuote.grossProfitGpPercent || 0,
      requiresCeoApproval: formQuote.requiresCeoApproval || false
    };

    saveQuotation(saved);
    setIsFormOpen(false);
    setSelectedQuote(saved); // view the generated quotation immediately
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenEmailModal = () => {
    if (!selectedQuote) return;
    const client = clients.find(c => c.id === selectedQuote.clientId);
    setEmailRecipient(client?.contactEmail || '');
    setEmailSubject(`[Commercial Proposal] POIS CONNECT — ${selectedQuote.title} (${selectedQuote.refNo})`);
    setEmailBody(`Dear ${client?.contactPerson || 'Client'},\n\nPlease find attached our commercial proposal for "${selectedQuote.title}" (Reference Ref No: ${selectedQuote.refNo}).\n\nWe have designed this solution customized to your infrastructure specifications. Kindly review the details and sign acceptance to confirm your Purchase Order (PO).\n\nBest Regards,\nSarah Tan\nPOIS Solutions Sdn Bhd`);
    setEmailSuccess('');
    setShowEmailModal(true);
  };

  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    setEmailLoading(true);
    
    setTimeout(() => {
      setEmailLoading(false);
      setEmailSuccess('Email proposal sent successfully to ' + emailRecipient + '!');
      
      const updatedQuote: Quotation = {
        ...selectedQuote,
        status: 'sent',
        emailSent: true,
        emailSentDate: new Date().toISOString().split('T')[0],
        nextcloudPath: archiveNextcloud ? `/contracts/${selectedQuote.refNo}.pdf` : selectedQuote.nextcloudPath
      };
      
      saveQuotation(updatedQuote);
      setSelectedQuote(updatedQuote);
      
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess('');
      }, 1800);
    }, 1200);
  };

  // Filtered quotations
  const filteredQuotes = quotations.filter(q => {
    const client = clients.find(c => c.id === q.clientId);
    const matchesSearch = q.refNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'sent': return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'expired': return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const clientOfSelected = clients.find(c => c.id === selectedQuote?.clientId);

  return (
    <div className="space-y-6">
      {!isFormOpen ? (
        <div className="space-y-6">
          {/* Top filter header */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-3 w-full max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ref, title, or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
              >
                <option value="all">All Stages</option>
                <option value="draft">Drafts</option>
                <option value="sent">Sent to Client</option>
                <option value="accepted">Accepted (PO)</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {currentUser.role !== 'technician' && (
              <button
                onClick={handleOpenNewBuilder}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Quotation Builder</span>
              </button>
            )}
          </div>

          {/* Quotations main workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Queue list */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Quotation Pipeline</h3>
              </div>

              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredQuotes.map((q) => {
                  const client = clients.find(c => c.id === q.clientId);
                  const isSelected = selectedQuote?.id === q.id;
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedQuote(q);
                        setViewMode('client');
                      }}
                      className={`p-4 cursor-pointer hover:bg-slate-50/40 transition-all text-xs space-y-2 ${
                        isSelected ? 'bg-brand-50/20 border-l-4 border-brand-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-gray-400">{q.refNo}</span>
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusBadge(q.status)}`}>
                          {q.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 truncate">{q.title}</h4>
                        <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{client?.name}</p>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-50 text-[10px]">
                        <span className="text-gray-400">Value: <strong>RM {q.grandTotal.toLocaleString('en-MY', { maximumFractionDigits: 0 })}</strong></span>
                        <span className="text-gray-400 font-medium">GP: {q.grossProfitGpPercent}%</span>
                      </div>
                    </div>
                  );
                })}
                {filteredQuotes.length === 0 && (
                  <p className="text-center py-12 text-gray-400 text-xs">No matching quotations recorded.</p>
                )}
              </div>
            </div>

            {/* Right details / Letterhead viewport */}
            <div className="lg:col-span-2 space-y-6">
              {selectedQuote ? (
                <div className="space-y-4">
                  {/* View toolbar */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-xs">
                    <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                      <button
                        onClick={() => setViewMode('client')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          viewMode === 'client' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Client Proposal View
                      </button>
                      <button
                        onClick={() => setViewMode('costing')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          viewMode === 'costing' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Internal Costing Sheet
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-xs px-3 py-1.5 rounded-lg"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Proposal</span>
                      </button>

                      <button
                        onClick={() => {
                          if (selectedQuote) {
                            downloadQuotationPDF(selectedQuote, clientOfSelected);
                          }
                        }}
                        className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-brand-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4 text-brand-600" />
                        <span>Download PDF</span>
                      </button>

                      {/* Email dispatch button (Requires HOD/CEO approvals) */}
                      {(selectedQuote.status === 'draft' || selectedQuote.status === 'sent') && (
                        <div className="relative group">
                          <button
                            onClick={handleOpenEmailModal}
                            disabled={!(selectedQuote.requiresCeoApproval ? (selectedQuote.hodApproved && selectedQuote.ceoApproved) : selectedQuote.hodApproved)}
                            className={`flex items-center gap-1.5 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm ${
                              (selectedQuote.requiresCeoApproval ? (selectedQuote.hodApproved && selectedQuote.ceoApproved) : selectedQuote.hodApproved)
                                ? 'bg-brand-600 hover:bg-brand-700 text-white cursor-pointer'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            }`}
                          >
                            <Mail className="w-4 h-4" />
                            <span>Send via Email</span>
                          </button>
                          {!(selectedQuote.requiresCeoApproval ? (selectedQuote.hodApproved && selectedQuote.ceoApproved) : selectedQuote.hodApproved) && (
                            <span className="absolute bottom-full mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-md w-52 text-center -left-6 z-10 leading-normal">
                              ⚠️ Requires HOD {selectedQuote.requiresCeoApproval ? '& CEO' : ''} approvals on Costing Sheet before sending.
                            </span>
                          )}
                        </div>
                      )}

                      {/* Workflows based on roles */}
                      {viewMode === 'costing' && (
                        <>
                          {/* HOD approval */}
                          {currentUser.role === 'hod_sales' && !selectedQuote.hodApproved && (
                            <button
                              onClick={() => verifyCosting(selectedQuote.id)}
                              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Verify Costings (HOD Signoff)</span>
                            </button>
                          )}

                          {/* CEO approval */}
                          {currentUser.role === 'ceo' && selectedQuote.hodApproved && !selectedQuote.ceoApproved && (
                            <button
                              onClick={() => approveQuotation(selectedQuote.id)}
                              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Grant CEO Approval</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* Client signs proposal PO */}
                      {selectedQuote.status === 'sent' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptQuotation(selectedQuote.id)}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all"
                          >
                            <Check className="w-4 h-4" />
                            <span>Confirm Purchase (Client PO)</span>
                          </button>
                          <button
                            onClick={() => rejectQuotation(selectedQuote.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all"
                          >
                            Decline Proposal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proposals / Letterhead View Area */}
                  {viewMode === 'client' ? (
                    <div 
                      id="pois-print-proposal"
                      className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0"
                    >
                      {/* Malaysian Letterhead Header */}
                      <div className="flex justify-between items-start border-b-2 border-brand-700 pb-6">
                        <div>
                          <div className="flex items-center gap-3">
                            <PoisLogo className="w-10 h-10 shrink-0" />
                            <span className="font-black text-xl text-brand-950 tracking-wider">POIS CONNECT</span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">POIS Solutions Sdn Bhd (1093412-M)</p>
                          <p className="text-[10px] text-gray-500 mt-2 max-w-sm leading-relaxed">
                            Level 12, Menara CelcomDigi, No. 6, Persiaran Barat, Seksyen 52, 46200 Petaling Jaya, Selangor, Malaysia
                          </p>
                          <p className="text-[10px] text-gray-500">Tel: +60 3-7962 1000 | Email: corporate@pois.com.my</p>
                        </div>
                        <div className="text-right">
                          <h2 className="text-xl font-extrabold text-brand-950 tracking-tight">COMMERCIAL PROPOSAL</h2>
                          <div className="mt-4 space-y-1 text-[11px] text-gray-600 font-medium">
                            <p>Ref No: <span className="font-mono font-bold text-gray-900">{selectedQuote.refNo}</span></p>
                            <p>Date: <span className="font-semibold text-gray-900">{selectedQuote.date}</span></p>
                            <p>Validity: <span className="font-semibold text-gray-900">{selectedQuote.validityWeeks} Weeks</span></p>
                            <p>Account Manager: <span className="font-semibold text-gray-900">{selectedQuote.preparedBy}</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Bill To Info */}
                      <div className="grid grid-cols-2 gap-8 text-xs">
                        <div className="space-y-1.5 p-4 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="font-bold text-brand-950 uppercase tracking-wider text-[10px]">Client Company Profile</p>
                          <p className="font-bold text-gray-900 text-sm">{clientOfSelected?.name}</p>
                          <p className="text-gray-500">Reg No: {clientOfSelected?.regNo}</p>
                          <p className="text-gray-500 mt-1 leading-relaxed">{clientOfSelected?.billingAddress}</p>
                        </div>
                        <div className="space-y-1.5 p-4 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="font-bold text-brand-950 uppercase tracking-wider text-[10px]">Technical Installation Site</p>
                          <p className="font-bold text-gray-800">{clientOfSelected?.contactPerson}</p>
                          <p className="text-gray-500">Email: {clientOfSelected?.contactEmail}</p>
                          <p className="text-gray-500">Phone: {clientOfSelected?.phone}</p>
                          <p className="text-gray-500 mt-1 leading-relaxed">{clientOfSelected?.siteAddress}</p>
                        </div>
                      </div>

                      {/* Title block */}
                      <div className="bg-brand-950 text-white p-3.5 rounded-lg">
                        <h3 className="text-xs font-bold uppercase tracking-wider">PROJECT: {selectedQuote.title}</h3>
                      </div>

                      {/* Line Items Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b-2 border-brand-950 bg-slate-50 font-bold text-brand-950 text-[10px] uppercase">
                              <th className="py-2.5 px-3 w-12">Item#</th>
                              <th className="py-2.5 px-3">Service & Deliverable Specification</th>
                              <th className="py-2.5 px-3 text-center w-16">Qty</th>
                              <th className="py-2.5 px-3 text-right w-28">Unit Price (RM)</th>
                              <th className="py-2.5 px-3 text-right w-24">Tax (SST)</th>
                              <th className="py-2.5 px-3 text-right w-28">Amount (RM)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedQuote.items.map((item, idx) => {
                              const lineAmount = item.isFoc ? 0 : item.qty * item.unitPrice;
                              return (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                  <td className="py-3 px-3 font-mono text-gray-400">{idx + 1}</td>
                                  <td className="py-3 px-3 font-semibold text-gray-800">
                                    {item.description}
                                    {item.isFoc && (
                                      <span className="ml-2 bg-emerald-50 text-emerald-700 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">FOC</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-center">{item.qty}</td>
                                  <td className="py-3 px-3 text-right">
                                    {item.isFoc ? 'RM 0.00' : `RM ${item.unitPrice.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`}
                                  </td>
                                  <td className="py-3 px-3 text-right text-gray-500 font-medium">
                                    {item.taxable && !item.isFoc ? '8%' : 'Exempt'}
                                  </td>
                                  <td className="py-3 px-3 text-right font-bold text-gray-900">
                                    RM {lineAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals Block */}
                      <div className="flex justify-end text-xs">
                        <div className="w-80 space-y-2 border-t border-brand-950 pt-4">
                          <div className="flex justify-between font-semibold text-gray-600">
                            <span>Subtotal:</span>
                            <span>RM {selectedQuote.subtotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-gray-600">
                            <span>SST Service Tax (8%):</span>
                            <span>RM {selectedQuote.sstTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-black text-brand-950">
                            <span>GRAND TOTAL:</span>
                            <span>RM {selectedQuote.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Terms and Conditions block */}
                      <div className="text-[10px] text-gray-500 leading-relaxed border-t border-gray-100 pt-6 space-y-2">
                        <p className="font-bold text-brand-950 uppercase tracking-widest text-[9px]">Standard Corporate Terms & Conditions</p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Validity: This quotation is strictly valid for {selectedQuote.validityWeeks} weeks from the proposal date.</li>
                          <li>Contract Lock-in commitment period: {selectedQuote.lockInMonths} months from the active billing start date. Early termination triggers standard remaining months penalties.</li>
                          <li>Delivery Period: Execution and physical fiber connectivity activation SLA is {selectedQuote.deliveryDays} working days from signed Purchase Order (PO).</li>
                          <li>SST: 8% Sales and Service Tax applies to applicable recurring monthly lines, cabling fees and engineering setup installations. Security deposits are tax exempt.</li>
                          <li>Payment Schedule: Refundable deposit on PO confirmation. Installation balance invoiced on site activation.</li>
                        </ol>
                      </div>

                      {/* Handover e-signature slip */}
                      <div className="grid grid-cols-2 gap-12 pt-12 text-xs border-t border-gray-100">
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-brand-950 uppercase tracking-widest">Authorized Reseller Signoff</p>
                          <div className="h-16 flex items-end">
                            <span className="font-mono italic text-brand-600 text-sm border-b border-gray-300 w-44 pb-1 font-bold">Sarah Tan (Sales AM)</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">For POIS Solutions Integrator</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-brand-950 uppercase tracking-widest">Client Acceptance Signoff & Stamp</p>
                          {selectedQuote.status === 'accepted' ? (
                            <div className="space-y-2">
                              <span className="text-xs font-mono font-bold text-emerald-600 border border-emerald-300 bg-emerald-50 px-2 py-1.5 rounded inline-block">
                                Accepted via Digital PO Client stamp (Verified)
                              </span>
                              <p className="text-[10px] text-gray-400">Date Accepted: {selectedQuote.dateAccepted}</p>
                            </div>
                          ) : (
                            <div className="h-16 flex items-end">
                              <span className="border-b border-gray-300 w-44 block text-gray-300 italic">Signature & Stamp Slip</span>
                            </div>
                          )}
                          <p className="text-[10px] text-gray-400 mt-1">Company Seal authorized signee</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Internal Costing Sheet view */
                    <div className="bg-slate-900 text-slate-100 p-8 rounded-xl border border-slate-800 shadow-sm space-y-6 text-xs">
                      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-brand-500 uppercase tracking-wider">Internal Project Costing & Margin Sheet</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Strictly confidential document. Verify costs before HOD verification and CEO final sign-off.</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-slate-800 text-slate-300 px-2 py-1.5 rounded-lg border border-slate-700 font-mono font-bold">
                            Turnaround Status: {selectedQuote.status}
                          </span>
                        </div>
                      </div>

                      {/* Approval Stepper Indicator */}
                      <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-slate-950/40 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            selectedQuote.hodApproved ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {selectedQuote.hodApproved ? '✓' : '1'}
                          </div>
                          <div>
                            <p className="font-bold">HOD Sales Verification</p>
                            <p className="text-[10px] text-slate-500">{selectedQuote.hodApproved ? 'Verified & Locked' : 'Pending Review'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            selectedQuote.ceoApproved ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {selectedQuote.ceoApproved ? '✓' : '2'}
                          </div>
                          <div>
                            <p className="font-bold">CEO Executive Approvals</p>
                            <p className="text-[10px] text-slate-500">
                              {selectedQuote.requiresCeoApproval 
                                ? (selectedQuote.ceoApproved ? 'Approved' : 'CEO Sign-off REQUIRED (&gt;RM10k or &lt;25% GP)')
                                : 'Auto-Approved (Total is small, GP margins healthy)'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Profit indicators */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Gross Sales Revenue</span>
                          <p className="text-xl font-bold text-slate-100 mt-1">RM {selectedQuote.subtotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Supplier Carrier Net Cost</span>
                          <p className="text-xl font-bold text-slate-100 mt-1">RM {selectedQuote.totalUnitCost.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">GP Profit Margin</span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xl font-bold text-brand-400">RM {selectedQuote.grossProfitRm.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              selectedQuote.grossProfitGpPercent >= 25 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {selectedQuote.grossProfitGpPercent}% GP
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Costing line items */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-brand-500 uppercase tracking-widest">Bill of Materials & Net Cost Elements</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                                <th className="py-2 px-3">Item Code</th>
                                <th className="py-2 px-3">Proposal Sales Price</th>
                                <th className="py-2 px-3">Estimated Net Cost</th>
                                <th className="py-2 px-3">Wholesale Supplier</th>
                                <th className="py-2 px-3 text-right">Profit Contribution</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                              {selectedQuote.items.map((item) => {
                                const costing = selectedQuote.costings.find(c => c.itemCode === item.itemCode);
                                const totalCost = costing ? item.qty * (costing.unitCost - costing.discount) : 0;
                                const totalRevenue = item.isFoc ? 0 : item.qty * item.unitPrice;
                                const profit = totalRevenue - totalCost;
                                return (
                                  <tr key={item.id} className="hover:bg-slate-800/40">
                                    <td className="py-3 px-3 font-mono font-bold text-slate-400">{item.itemCode}</td>
                                    <td className="py-3 px-3">RM {item.unitPrice.toLocaleString('en-MY')} ({item.qty} units)</td>
                                    <td className="py-3 px-3">RM {costing ? (costing.unitCost - costing.discount).toLocaleString('en-MY') : '0'}</td>
                                    <td className="py-3 px-3 font-semibold text-indigo-300">{costing?.supplier || 'Self-provided'}</td>
                                    <td className="py-3 px-3 text-right font-bold text-slate-100">
                                      RM {profit.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-16 rounded-xl border border-gray-100 shadow-xs text-center text-gray-400">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold">Select Quotation View Proposal</p>
                  <p className="text-xs mt-1">Select a record from the pipeline column to expand commercial layouts or verify internal costing profits.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Dynamic Builder / Creator Form */
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-6 space-y-6 text-xs">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Corporate Quotation & Costing Builder</h3>
              <p className="text-xs text-gray-400 mt-0.5">Build corporate line specifications, configure tax-SST, and declare supplier costing sheets synchronously.</p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3.5 py-1.5 rounded-lg"
            >
              Back to Pipeline
            </button>
          </div>

          <form onSubmit={handleSubmitBuilder} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Client Profile <span className="text-rose-600">*</span></label>
                <select
                  required
                  value={formQuote.clientId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'ADD_NEW_CLIENT') {
                      setTriggerClientCreate(true);
                      setActiveTab('clients');
                    } else {
                      setFormQuote({...formQuote, clientId: val});
                    }
                  }}
                  className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600 font-medium"
                >
                  <option value="">-- Choose Corporate Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="ADD_NEW_CLIENT" className="text-brand-600 font-bold bg-slate-50">+ Add New Client...</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Proposal Ref No.</label>
                <input
                  type="text"
                  disabled
                  value={formQuote.refNo}
                  className="w-full bg-gray-100 border border-gray-200 rounded p-2 font-mono text-gray-600 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Proposal Date <span className="text-rose-600">*</span></label>
                <input
                  type="date"
                  required
                  value={formQuote.date}
                  onChange={(e) => setFormQuote({...formQuote, date: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Proposal Title / Project Header <span className="text-rose-600">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Internet Access — Bandwidth 100Mbps Dedicated Metro-E"
                value={formQuote.title}
                onChange={(e) => setFormQuote({...formQuote, title: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>

            {/* Line Items Editor Section */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-brand-950 uppercase tracking-wider">Line Item & Supplier Cost Spec</h4>
              
              {/* Added Items Preview */}
              {formQuote.items && formQuote.items.length > 0 && (
                <div className="bg-white rounded border border-gray-100 divide-y divide-gray-100">
                  <div className="grid grid-cols-12 gap-2 p-2 font-bold text-gray-500 uppercase tracking-widest text-[9px] bg-gray-50">
                    <div className="col-span-4">Item Details</div>
                    <div className="col-span-1 text-center">Qty</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Net Cost (Wholesale)</div>
                    <div className="col-span-2 text-right">Line Total</div>
                    <div className="col-span-1 text-right">Delete</div>
                  </div>
                  {formQuote.items.map((item) => {
                    const costing = formQuote.costings?.find(c => c.itemCode === item.itemCode);
                    const lineAmount = item.isFoc ? 0 : item.qty * item.unitPrice;
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-2 p-3.5 items-center">
                        <div className="col-span-4 font-semibold text-gray-900">
                          {item.description}
                          {item.isFoc && <span className="ml-2 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 rounded uppercase">FOC</span>}
                        </div>
                        <div className="col-span-1 text-center font-bold text-gray-700">{item.qty}</div>
                        <div className="col-span-2 text-right">RM {item.unitPrice.toLocaleString('en-MY')}</div>
                        <div className="col-span-2 text-right text-brand-600 font-bold">
                          RM {costing ? (costing.unitCost - costing.discount).toLocaleString('en-MY') : '0'}
                          <p className="text-[9px] text-gray-400 font-normal">{costing?.supplier}</p>
                        </div>
                        <div className="col-span-2 text-right font-black text-gray-900">RM {lineAmount.toLocaleString('en-MY')}</div>
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id, item.itemCode)}
                            className="text-rose-600 hover:text-rose-950 hover:bg-rose-50 p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4 ml-auto" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Input builder */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4 space-y-1">
                  <label className="font-bold text-slate-500 text-[10px] uppercase">Service Catalog Pre-set</label>
                  <select
                    value={selectedCatalogCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedCatalogCode(code);
                      const catItem = catalog.find(ci => ci.code === code);
                      if (catItem) {
                        setCustomItemDesc(catItem.name);
                        setCustomItemPrice(catItem.unit_price);
                        setCustomItemTaxable(catItem.taxable);
                        // default suppliers based on codes
                        setTempSupplier(code.startsWith('GF-') ? 'Telekom Malaysia' : 'POIS Inhouse');
                        setTempUnitCost(Number((catItem.unit_price * 0.6).toFixed(2)));
                      }
                    }}
                    className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  >
                    <option value="">-- Custom Non-Catalog Item --</option>
                    {catalog.map(ci => (
                      <option key={ci.code} value={ci.code}>
                        [{ci.code}] {ci.name} (RM {ci.unit_price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="font-bold text-slate-500 text-[10px] uppercase">Line Specification Description</label>
                  <input
                    type="text"
                    placeholder="Enter manual specification description..."
                    value={customItemDesc}
                    onChange={(e) => setCustomItemDesc(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="sm:col-span-1 space-y-1">
                  <label className="font-bold text-slate-500 text-[10px] uppercase text-center block">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded p-1.5 text-center focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-500 text-[10px] uppercase text-right block">Sales Price (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded p-1.5 text-right font-bold focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="sm:col-span-1 flex items-center justify-center h-10 select-none cursor-pointer">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customItemFoc}
                      onChange={(e) => setCustomItemFoc(e.target.checked)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                    />
                    <span>FOC</span>
                  </label>
                </div>
              </div>

              {/* Costing line builder input */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-200/60">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 text-[10px] uppercase">Carrier Supplier (Wholesale)</label>
                  <input
                    type="text"
                    placeholder="e.g. Telekom Malaysia Bhd / Maxis Carrier"
                    value={tempSupplier}
                    onChange={(e) => setTempSupplier(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 text-[10px] uppercase">Supplier Net Cost Unit (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={tempUnitCost}
                    onChange={(e) => setTempUnitCost(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold text-brand-600"
                  />
                </div>

                <div className="space-y-1 flex items-end h-10">
                  <label className="flex items-center gap-2 font-bold text-gray-600 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customItemTaxable}
                      onChange={(e) => setCustomItemTaxable(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-600 border-gray-300 h-4 w-4"
                    />
                    <span>Subject to 8% SST Tax</span>
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Spec Line Item</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Calculations and KPI displays */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              {/* Proposal values */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
                <p className="font-bold text-gray-700">Proposal Summary</p>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">RM {(formQuote.subtotal || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>SST Service Tax (8%):</span>
                  <span className="font-semibold">RM {(formQuote.sstTotal || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-brand-950 text-sm">
                  <span>GRAND TOTAL:</span>
                  <span>RM {(formQuote.grandTotal || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Margin & profits */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
                <p className="font-bold text-gray-700">Internal Costing & Profit Margins</p>
                <div className="flex justify-between text-gray-600">
                  <span>Carrier Wholesales Cost:</span>
                  <span className="font-semibold">RM {(formQuote.totalUnitCost || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Project Gross Margin:</span>
                  <span className="font-bold text-brand-600">RM {(formQuote.grossProfitRm || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-gray-800">
                  <span>GP Profit Percentage:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    (formQuote.grossProfitGpPercent || 0) >= 25 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {(formQuote.grossProfitGpPercent || 0)}% GP
                  </span>
                </div>
              </div>

              {/* Approval status alerts */}
              <div className="p-4 rounded-lg border flex flex-col justify-between space-y-2 bg-slate-50 border-slate-100">
                <p className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>Approval Level Trigger</span>
                </p>
                {formQuote.requiresCeoApproval ? (
                  <div className="flex items-start gap-1.5 p-2 rounded bg-rose-50 border border-rose-100 text-[11px] text-rose-800 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">CEO Approval Triggered</p>
                      <p className="mt-0.5 text-[10px]">Profit margin is under 25% OR invoice total exceeds RM10,000. Ceo approval block activated.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 p-2 rounded bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 font-medium">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Auto-Approved Pipeline</p>
                      <p className="mt-0.5 text-[10px]">GP % is healthy (&ge;25%) and total amount is under RM10,000.</p>
                    </div>
                  </div>
                )}
                <p className="text-[9px] text-gray-400">Created by Sales Representative: {currentUser.name}</p>
              </div>
            </div>

            {/* Standard terms & conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Proposal Validity (Weeks)</label>
                <input
                  type="number"
                  min="1"
                  value={formQuote.validityWeeks}
                  onChange={(e) => setFormQuote({...formQuote, validityWeeks: Number(e.target.value)})}
                  className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Delivery SLA commitment (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={formQuote.deliveryDays}
                  onChange={(e) => setFormQuote({...formQuote, deliveryDays: Number(e.target.value)})}
                  className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Contract Lock-in Period (Months)</label>
                <input
                  type="number"
                  min="1"
                  value={formQuote.lockInMonths}
                  onChange={(e) => setFormQuote({...formQuote, lockInMonths: Number(e.target.value)})}
                  className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Commercial Terms Description</label>
                <input
                  type="text"
                  placeholder="e.g. Deposit 3mo upfront on PO"
                  value={formQuote.paymentTerms}
                  onChange={(e) => setFormQuote({...formQuote, paymentTerms: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg"
              >
                Cancel Draft
              </button>
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2 rounded-lg shadow-sm"
              >
                Save Proposal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Email dispatch modal */}
      {showEmailModal && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Email Proposal & Cloud Archive</h3>
                <p className="text-xs text-gray-400 mt-0.5">Send commercial proposal to corporate client and archive signed copy to Nextcloud</p>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-900 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="p-6 space-y-4">
              {emailSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium animate-fade-in">
                  {emailSuccess}
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-600 block">Recipient Client Email</label>
                    <input
                      type="email"
                      required
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded p-2 focus:ring-1 focus:ring-brand-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-600 block">Sender Agent</label>
                    <input
                      type="text"
                      disabled
                      value="Sarah Tan (AM) <sales@pois-connect.com.my>"
                      className="w-full bg-gray-100 text-gray-500 border border-gray-200 rounded p-2 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 block">Subject Header</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:ring-1 focus:ring-brand-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 block">Email Body Message</label>
                  <textarea
                    required
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded p-2 font-sans focus:ring-1 focus:ring-brand-600 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-brand-600" />
                    <div>
                      <p className="font-bold text-gray-700">Archive Signed Copy to Nextcloud</p>
                      <p className="text-[10px] text-gray-400">Path: {nextcloudConfig.enabled ? `${nextcloudConfig.url}/contracts/${selectedQuote.refNo}.pdf` : `(Enable Nextcloud in settings first)`}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={archiveNextcloud}
                    disabled={!nextcloudConfig.enabled}
                    onChange={(e) => setArchiveNextcloud(e.target.checked)}
                    className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end gap-3 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  {emailLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Delivering Mail...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Proposal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuotationsModule;
