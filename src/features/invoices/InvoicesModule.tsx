import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceStatus, Payment, Client } from '../../types';
import { 
  Search, Receipt, Landmark, Printer, DollarSign, 
  CheckCircle, Clock, Plus, HelpCircle, Play,
  Mail, Cloud, ShieldCheck, UploadCloud, Check, FileText, Download
} from 'lucide-react';
import { PoisLogo } from '../../components/ui/PoisLogo';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';


export const InvoicesModule: React.FC = () => {
  const { 
    invoices, clients, recordPayment, runMonthlyBillingCycle, currentUser, setInvoices, nextcloudConfig 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Record Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Telegraphic Transfer');
  const [paymentRef, setPaymentRef] = useState('');

  // --- EMAIL SENDING STATES ---
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [archiveNextcloud, setArchiveNextcloud] = useState(true);

  // --- DUITNOW RECEIPT UPLOAD STATES ---
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptSuccessMsg, setReceiptSuccessMsg] = useState('');
  const [receiptErrorMsg, setReceiptErrorMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Billing cycle simulation state
  const [billingMonth, setBillingMonth] = useState('2026-07');
  const [billingCycleReport, setBillingCycleReport] = useState<{ count: number; totalValue: number } | null>(null);

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'issued': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'partially_paid': return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'overdue': return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
    }
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (paymentAmount <= 0) {
      alert('Payment amount must be greater than RM0.00');
      return;
    }

    recordPayment(selectedInvoice.id, Number(paymentAmount), paymentMethod, paymentRef);
    setShowPayModal(false);
    
    // Refresh selected invoice inside UI view
    const updated = invoices.find(inv => inv.id === selectedInvoice.id);
    if (updated) {
      setSelectedInvoice(updated);
    } else {
      setSelectedInvoice(null);
    }

    setPaymentAmount(0);
    setPaymentRef('');
  };

  const handleRunBilling = () => {
    const report = runMonthlyBillingCycle(billingMonth);
    setBillingCycleReport(report);
    setTimeout(() => {
      setBillingCycleReport(null);
    }, 6000); // clear report after 6 seconds
  };

  const handleOpenInvoiceEmail = () => {
    if (!selectedInvoice) return;
    const client = clients.find(c => c.id === selectedInvoice.clientId);
    setEmailRecipient(client?.contactEmail || '');
    setEmailSubject(`[Tax Invoice] POIS CONNECT — Invoice #${selectedInvoice.id}`);
    setEmailBody(`Dear ${client?.contactPerson || 'Client'},\n\nPlease find attached Tax Invoice #${selectedInvoice.id} for services rendered by POIS Solutions Sdn Bhd.\n\nSummary:\n- Invoice Ref: ${selectedInvoice.id}\n- Due Date: ${selectedInvoice.dueDate}\n- Amount Owed: RM ${selectedInvoice.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}\n\nKindly perform an electronic fund transfer to our bank account or scan the DuitNow QR inside your invoice viewer to make payment.\n\nBest Regards,\nFinance Accounts Department\nPOIS Solutions Sdn Bhd`);
    setEmailSuccess('');
    setShowEmailModal(true);
  };

  const handleSendInvoiceEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setEmailLoading(true);

    setTimeout(() => {
      setEmailLoading(false);
      setEmailSuccess('Tax Invoice email sent successfully to ' + emailRecipient + '!');

      const updatedInvoice: Invoice = {
        ...selectedInvoice,
        emailSent: true,
        emailSentDate: new Date().toISOString().split('T')[0],
        nextcloudPath: archiveNextcloud ? `/billing/${selectedInvoice.id}.pdf` : selectedInvoice.nextcloudPath
      };

      setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv));
      setSelectedInvoice(updatedInvoice);

      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess('');
      }, 1800);
    }, 1200);
  };

  const handleApproveInvoice = () => {
    if (!selectedInvoice) return;
    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      hodApproved: true,
      approvedBy: currentUser.name
    };
    setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv));
    setSelectedInvoice(updatedInvoice);
  };

  const handleReceiptUpload = (file: File) => {
    if (!selectedInvoice) return;
    setIsUploadingReceipt(true);
    setReceiptErrorMsg('');
    setReceiptSuccessMsg('');

    setTimeout(() => {
      setIsUploadingReceipt(false);
      setReceiptSuccessMsg(`Receipt "${file.name}" uploaded successfully!`);

      const paymentId = 'PAY-' + Math.floor(1000 + Math.random() * 9000);
      const newPayment = {
        id: paymentId,
        invoiceId: selectedInvoice.id,
        amount: selectedInvoice.grandTotal,
        date: new Date().toISOString().split('T')[0],
        method: 'DuitNow QR / Instant Transfer',
        reference: `DNC-${Math.floor(100000 + Math.random()*900000)}`
      };

      const updatedInvoice: Invoice = {
        ...selectedInvoice,
        receiptUploaded: true,
        receiptFileName: file.name,
        receiptUploadedAt: new Date().toLocaleString(),
        receiptFileUrl: URL.createObjectURL(file),
        nextcloudReceiptPath: nextcloudConfig.enabled ? `${nextcloudConfig.url}/receipts/${selectedInvoice.id}_receipt.pdf` : `/receipts/${selectedInvoice.id}_receipt.pdf`,
        payments: [...selectedInvoice.payments, newPayment],
        status: 'paid' as const
      };

      setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv));
      setSelectedInvoice(updatedInvoice);
    }, 1500);
  };

  const filteredInvoices = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const clientOfSelected = clients.find(c => c.id === selectedInvoice?.clientId);
  
  // Calculate running balance for this client
  const totalInvoicedForClient = invoices
    .filter(inv => inv.clientId === selectedInvoice?.clientId)
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPaidForClient = invoices
    .filter(inv => inv.clientId === selectedInvoice?.clientId)
    .reduce((sum, inv) => sum + inv.payments.reduce((pSum, p) => pSum + p.amount, 0), 0);
  const outstandingClientBalance = totalInvoicedForClient - totalPaidForClient;

  const isAdminOrBilling = currentUser.role === 'admin' || currentUser.role === 'sales_rep';

  return (
    <div className="space-y-6">
      {/* Simulation Box for Recurring monthly billing */}
      <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs">
        <div className="space-y-1">
          <h3 className="font-bold text-brand-500 text-sm flex items-center gap-1.5 uppercase tracking-wider">
            <Play className="w-4 h-4" />
            <span>Recurring Contract Billing Engine</span>
          </h3>
          <p className="text-slate-400 max-w-xl text-[11px]">
            ISP Reseller billing simulation. Scans all activated GPON Fiber & PABX contracts and auto-generates recurring monthly invoices for the active speed rentals based on the catalog rate at contract time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 block uppercase">Billing Target Cycle</label>
            <input
              type="month"
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded p-1.5 focus:outline-none"
            />
          </div>
          <button
            onClick={handleRunBilling}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-all self-end"
          >
            <span>Run Billing Cycle</span>
          </button>
        </div>
      </div>

      {billingCycleReport && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3 animate-fade-in text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Recurring Monthly Billing Cycle Executed Successfully!</p>
            <p className="mt-0.5 text-emerald-700">Issued <strong>{billingCycleReport.count}</strong> monthly recurring tax invoices worth <strong>RM {billingCycleReport.totalValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</strong> for cycle {billingMonth}.</p>
          </div>
        </div>
      )}

      {/* Filter inputs */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full max-w-2xl text-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices by code or company name..."
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
            <option value="all">All Statuses</option>
            <option value="issued">Issued / Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All Types</option>
            <option value="one-time">One-time Setup / OTC</option>
            <option value="recurring">Monthly Rental lease</option>
          </select>
        </div>
      </div>

      {/* Invoicing Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Invoices directory */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Tax Invoices Queue</h3>
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {filteredInvoices.map((inv) => {
              const client = clients.find(c => c.id === inv.clientId);
              const isSelected = selectedInvoice?.id === inv.id;
              const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
              const balance = inv.grandTotal - totalPaid;
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 cursor-pointer hover:bg-slate-50/40 transition-all text-xs space-y-2 ${
                    isSelected ? 'bg-brand-50/20 border-l-4 border-brand-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-700">{inv.id}</span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 truncate">{client?.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium capitalize mt-0.5">Billing: {inv.type} {inv.billingCycleMonth ? `(${inv.billingCycleMonth})` : ''}</p>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-50 text-[10px]">
                    <span className="text-gray-500">Value: <strong>RM {inv.grandTotal.toLocaleString('en-MY')}</strong></span>
                    {balance > 0 && <span className="text-rose-600 font-semibold">Owed: RM {balance.toLocaleString('en-MY')}</span>}
                  </div>
                </div>
              );
            })}
            {filteredInvoices.length === 0 && (
              <p className="text-center py-12 text-gray-400 text-xs">No matching invoices issued.</p>
            )}
          </div>
        </div>

        {/* Right detailed invoice letters */}
        <div className="lg:col-span-2 space-y-6">
          {selectedInvoice ? (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-xs">
                <span className="text-xs text-gray-400 font-semibold uppercase">Invoice viewport</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-xs px-3 py-1.5 rounded-lg"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Invoice</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (selectedInvoice) {
                        setDownloadingPdf(true);
                        try {
                          await downloadInvoicePDF(selectedInvoice, clientOfSelected, outstandingClientBalance);
                        } finally {
                          setDownloadingPdf(false);
                        }
                      }
                    }}
                    disabled={downloadingPdf}
                    className={`flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-brand-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-all ${
                      downloadingPdf ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    <Download className={`w-4 h-4 text-brand-600 ${downloadingPdf ? 'animate-bounce' : ''}`} />
                    <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                  </button>

                  {/* HOD Sales Approval */}
                  {currentUser.role === 'hod_sales' && !selectedInvoice.hodApproved && (
                    <button
                      onClick={handleApproveInvoice}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approve Invoice (HOD Sign-off)</span>
                    </button>
                  )}

                  {/* Send via Email Button (Requires HOD approval) */}
                  <div className="relative group">
                    <button
                      onClick={handleOpenInvoiceEmail}
                      disabled={!selectedInvoice.hodApproved}
                      className={`flex items-center gap-1.5 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm ${
                        selectedInvoice.hodApproved
                          ? 'bg-brand-600 hover:bg-brand-700 text-white cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send via Email</span>
                    </button>
                    {!selectedInvoice.hodApproved && (
                      <span className="absolute bottom-full mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-md w-48 text-center -left-6 z-10 leading-normal">
                        ⚠️ Requires HOD sales signoff approval before sending.
                      </span>
                    )}
                  </div>

                  {/* Payment recorder */}
                  {isAdminOrBilling && selectedInvoice.status !== 'paid' && (
                    <button
                      onClick={() => {
                        const totalPaid = selectedInvoice.payments.reduce((sum, p) => sum + p.amount, 0);
                        setPaymentAmount(selectedInvoice.grandTotal - totalPaid); // default to full outstanding amount
                        setShowPayModal(true);
                      }}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Record Wire Payment</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Invoice printable block */}
              <div 
                id="pois-print-invoice"
                className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0 text-xs"
              >
                {/* Malaysia Branded tax letterhead */}
                <div className="flex justify-between items-start border-b-2 border-brand-700 pb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <PoisLogo className="w-10 h-10" />
                      <span className="font-black text-lg text-brand-950 tracking-wider">POIS CONNECT</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">POIS Solutions Sdn Bhd (1093412-M)</p>
                    <p className="text-[10px] text-gray-500 mt-2 max-w-sm leading-relaxed">
                      Level 12, Menara CelcomDigi, No. 6, Persiaran Barat, Seksyen 52, 46200 Petaling Jaya, Selangor, Malaysia
                    </p>
                    <p className="text-[10px] text-gray-500">Tel: +60 3-7962 1000 | Web: www.pois.com.my</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-extrabold text-brand-950 tracking-tight">TAX INVOICE</h2>
                    <div className="mt-4 space-y-1 text-[11px] text-gray-600 font-medium">
                      <p>Invoice No: <span className="font-mono font-bold text-gray-900">{selectedInvoice.id}</span></p>
                      <p>Date: <span className="font-semibold text-gray-900">{selectedInvoice.date}</span></p>
                      <p>Due Date: <span className="font-semibold text-rose-700">{selectedInvoice.dueDate}</span></p>
                      <p>Terms: <span className="font-semibold text-gray-900">COD / 14 Days</span></p>
                    </div>
                  </div>
                </div>

                {/* Client invoice profile */}
                <div className="grid grid-cols-2 gap-8 text-xs">
                  <div className="space-y-1.5 p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="font-bold text-brand-950 uppercase tracking-wider text-[10px]">Billed To (Corporate Profile)</p>
                    <p className="font-bold text-gray-900 text-sm">{clientOfSelected?.name}</p>
                    <p className="text-gray-500">Reg No: {clientOfSelected?.regNo}</p>
                    <p className="text-gray-500 mt-1 leading-relaxed">{clientOfSelected?.billingAddress}</p>
                  </div>
                  <div className="space-y-1.5 p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="font-bold text-brand-950 uppercase tracking-wider text-[10px]">Corporate Ledger Summary</p>
                    <div className="space-y-1 mt-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>Client CRM Code:</span>
                        <span className="font-mono font-bold">{clientOfSelected?.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account AM:</span>
                        <span>{clientOfSelected?.accountManager}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1 text-[11px] font-bold text-brand-700">
                        <span>Running CRM Balance:</span>
                        <span>RM {outstandingClientBalance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice items table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b-2 border-brand-950 bg-slate-50 font-bold text-brand-950 text-[10px] uppercase">
                        <th className="py-2.5 px-3">Specification Service Rendered</th>
                        <th className="py-2.5 px-3 text-center w-16">Qty</th>
                        <th className="py-2.5 px-3 text-right w-28">Unit Price (RM)</th>
                        <th className="py-2.5 px-3 text-right w-24">Tax (SST)</th>
                        <th className="py-2.5 px-3 text-right w-28">Total Amount (RM)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 font-semibold text-gray-800">{item.description}</td>
                          <td className="py-3 px-3 text-center">{item.qty}</td>
                          <td className="py-3 px-3 text-right">RM {item.unitPrice.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3 px-3 text-right text-gray-500 font-medium">
                            {item.taxable ? 'SST 8%' : 'Exempt'}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-gray-900">
                            RM {item.totalAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Balance Block */}
                <div className="flex justify-end text-xs">
                  <div className="w-80 space-y-2 border-t border-brand-950 pt-4">
                    <div className="flex justify-between font-semibold text-gray-600">
                      <span>Subtotal:</span>
                      <span>RM {selectedInvoice.subtotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-600">
                      <span>SST Service Tax (8%):</span>
                      <span>RM {selectedInvoice.sstTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-black text-brand-950">
                      <span>INVOICE GRAND TOTAL:</span>
                      <span>RM {selectedInvoice.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* Paid elements list */}
                    {selectedInvoice.payments.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <p className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">Payments Logs</p>
                        {selectedInvoice.payments.map((p) => (
                          <div key={p.id} className="flex justify-between text-[10px] text-gray-500">
                            <span>{p.date} - {p.method} ({p.reference})</span>
                            <span className="font-bold text-emerald-600">- RM {p.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Wire Bank coordinates block */}
                <div className="grid grid-cols-2 gap-8 text-[10px] text-gray-500 leading-relaxed border-t border-gray-100 pt-6">
                  <div>
                    <p className="font-bold text-brand-950 uppercase tracking-widest text-[9px] mb-1">Electronic Fund Bank Coordinates</p>
                    <p className="font-bold text-gray-800">MALAYAN BANKING BERHAD (MAYBANK)</p>
                    <p>Account Holder: <span className="font-medium text-gray-700">POIS SOLUTIONS SDN BHD</span></p>
                    <p>Account No: <span className="font-mono font-bold text-gray-800">5142-9904-8931</span></p>
                    <p>SWIFT BIC: <span className="font-mono font-bold text-gray-800">MBBEMYKL</span></p>
                    <p className="text-[9px] mt-1 text-slate-400">Please quote Invoice Ref No upon wire execution.</p>
                  </div>
                  <div>
                    <p className="font-bold text-brand-950 uppercase tracking-widest text-[9px] mb-1">Company SST Declaration</p>
                    <p>Company SST Reg Number: <span className="font-bold">W10-1808-32000041</span></p>
                    <p className="mt-1">All disputes regarding billing specification must be logged with corporate finance accounts within 7 working days from tax invoice issuance date.</p>
                  </div>
                </div>
              </div>

              {/* DuitNow Transfer & Receipt Uploader (Non-printable) */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6 print:hidden text-xs">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="bg-rose-50 p-2.5 rounded-lg flex items-center justify-center">
                    <span className="text-rose-600 font-black tracking-tighter text-sm">DuitNow</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-800">DuitNow Instant Transfer & QR Code Gateway</h3>
                    <p className="text-[10px] text-gray-400">Perform direct bank scan or instant corporate bank transfers, then upload the receipt to verify</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left Column: QR Code Visualizer */}
                  <div className="md:col-span-4 flex flex-col items-center p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    {/* QR Code Mockup Graphic */}
                    <div className="relative w-36 h-36 bg-white border-4 border-rose-600 p-2 rounded-lg flex flex-col justify-between overflow-hidden shadow-xs select-none">
                      {/* Stylized QR Code Pixels */}
                      <div className="w-full h-full flex flex-wrap gap-0.5 opacity-90">
                        {Array.from({ length: 400 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1 h-1 ${
                              (i % 5 === 0 || i % 7 === 0 || (i > 100 && i < 120) || (i > 300 && i < 340) || (i % 13 === 0 && i % 2 === 0)) 
                                ? 'bg-slate-900' 
                                : 'bg-white'
                            }`}
                          />
                        ))}
                      </div>
                      {/* Core DuitNow logo overlay */}
                      <div className="absolute inset-0 m-auto w-10 h-10 bg-rose-600 border border-white text-white font-black rounded-lg flex items-center justify-center text-[8px] select-none shadow-sm">
                        DuitNow
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase text-center">SCAN TO PAY<br />(RM {selectedInvoice.grandTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })})</span>
                  </div>

                  {/* Middle Column: Bank Transfer Details */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/60">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Maybank Account</span>
                        <p className="font-extrabold text-gray-800 mt-0.5 select-all">5142-9904-8931</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/60">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Maybank Holder Name</span>
                        <p className="font-bold text-gray-800 mt-0.5 truncate">POIS SOLUTIONS SDN BHD</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/60">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Transfer Method</span>
                        <p className="font-bold text-rose-600 mt-0.5">DuitNow QR / Instant Transfer</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/60">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Payment Reference ID</span>
                        <p className="font-mono font-black text-gray-800 mt-0.5 select-all">{selectedInvoice.id}</p>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 leading-normal">
                      💡 <strong>Job Scheduling Unlock</strong>: Once the DuitNow transfer is done, upload your receipt below. The system will sync the PDF to Nextcloud secure storage and instantly unlock dispatch scheduling for your physical survey or activation job.
                    </p>
                  </div>
                </div>

                {/* Bottom Part: File Drag & Drop & Upload Receipt */}
                <div className="pt-2">
                  {selectedInvoice.receiptUploaded ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-emerald-500 text-white rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">DuitNow Payment Receipt Successfully Confirmed!</p>
                          <p className="text-[10px] text-emerald-600 font-medium">Uploaded At: {selectedInvoice.receiptUploadedAt}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] bg-white p-3 rounded-lg border border-emerald-100 font-medium text-gray-600">
                        <p>📁 Filename: <span className="font-bold text-gray-800">{selectedInvoice.receiptFileName}</span></p>
                        <p>☁️ Nextcloud Path: <span className="font-mono font-bold text-indigo-700">{selectedInvoice.nextcloudReceiptPath}</span></p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleReceiptUpload(e.dataTransfer.files[0]); }}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        dragActive ? 'border-brand-600 bg-brand-50/50 shadow-inner' : 'border-gray-200 hover:border-brand-500 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="receipt-file-uploader" 
                        accept="image/*,application/pdf"
                        className="hidden" 
                        onChange={(e) => { if (e.target.files?.[0]) handleReceiptUpload(e.target.files[0]); }}
                      />
                      <label htmlFor="receipt-file-uploader" className="cursor-pointer space-y-2 block">
                        <UploadCloud className="w-10 h-10 text-gray-400 mx-auto" />
                        <div className="space-y-1">
                          <p className="font-extrabold text-gray-700">Drag & Drop Bank Receipt Here</p>
                          <p className="text-[10px] text-gray-400">or click to browse local files (Supports JPEG, PNG, PDF receipts)</p>
                        </div>
                      </label>
                      
                      {isUploadingReceipt && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-brand-600 font-bold">
                          <span className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></span>
                          <span>Reconciling payment and archiving receipt to Nextcloud...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-16 rounded-xl border border-gray-100 shadow-xs text-center text-gray-400">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">Select Tax Invoice</p>
              <p className="text-xs mt-1">Select an active tax invoice from the ledger queue to record telegraphic wire payments or inspect letterheads.</p>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Record Telegraphic Payment</h3>
                <p className="text-xs text-gray-400 mt-0.5">Log bank wire transfer receipts to reconcile ledger balance</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-900 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Payment Date</label>
                <input
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white border border-gray-200 rounded p-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Amount Received (RM) <span className="text-rose-600">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded p-2 font-black text-emerald-600 text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Transfer Channel / Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded p-2"
                >
                  <option value="Telegraphic Transfer">Telegraphic Transfer / Wire</option>
                  <option value="JomPAY / IBG">JomPAY / IBG Transfer</option>
                  <option value="Corporate Check">Corporate Check / Bankers Draft</option>
                  <option value="Cash Deposit">Cash Deposit Terminal</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Telegraphic Reference / Tx ID <span className="text-rose-600">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBB-TT-98012389"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded p-2 font-mono font-bold"
                />
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end gap-3 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm"
                >
                  Confirm Wire Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email dispatch modal */}
      {showEmailModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Email Tax Invoice & Cloud Archive</h3>
                <p className="text-xs text-gray-400 mt-0.5">Send tax invoice to corporate client and archive PDF copy to Nextcloud</p>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-900 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSendInvoiceEmailSubmit} className="p-6 space-y-4">
              {emailSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg font-medium animate-fade-in">
                  {emailSuccess}
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-600 block">Recipient Billing Email</label>
                    <input
                      type="email"
                      required
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded p-2 focus:ring-1 focus:ring-brand-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-600 block">Sender Billing Dept</label>
                    <input
                      type="text"
                      disabled
                      value="POIS Solutions Finance <finance@pois.com.my>"
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
                      <p className="font-bold text-gray-700">Archive Tax Invoice PDF to Nextcloud</p>
                      <p className="text-[10px] text-gray-400">Path: {nextcloudConfig.enabled ? `${nextcloudConfig.url}/billing/${selectedInvoice.id}.pdf` : `(Enable Nextcloud in settings first)`}</p>
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
                      <span>Send Invoice</span>
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
export default InvoicesModule;
function CheckCircle2(props: any) {
  return <CheckCircle className={props.className} />
}
