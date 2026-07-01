import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus } from '../../types';
import { 
  Plus, Search, User, Mail, Phone, MapPin, 
  Building2, Briefcase, CalendarCheck, FileText, 
  ArrowRight, ShieldCheck, CheckCircle 
} from 'lucide-react';

export const ClientsModule: React.FC = () => {
  const { 
    clients, addClient, quotations, invoices, projects, currentUser,
    triggerClientCreate, setTriggerClientCreate
  } = useApp();
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [renewalFilter, setRenewalFilter] = useState(false);

  // Selected client for detail pane
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // New Client Form Modal State
  const [showAddModal, setShowAddModal] = useState(false);

  React.useEffect(() => {
    if (triggerClientCreate) {
      setShowAddModal(true);
      setTriggerClientCreate(false);
    }
  }, [triggerClientCreate, setTriggerClientCreate]);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    regNo: '',
    billingAddress: '',
    siteAddress: '',
    phone: '',
    fax: '',
    contactPerson: '',
    contactEmail: '',
    industry: '',
    status: 'lead',
    accountManager: currentUser.name
  });

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'quoted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'lead': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'suspended': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'churned': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.contactPerson || !newClient.contactEmail) {
      alert('Please fill in required fields (Name, Contact Person, Contact Email)');
      return;
    }

    const client: Client = {
      id: 'C-' + Math.floor(100 + Math.random() * 900),
      name: newClient.name,
      regNo: newClient.regNo || 'Pending Reg No.',
      billingAddress: newClient.billingAddress || 'To be specified',
      siteAddress: newClient.siteAddress || newClient.billingAddress || 'To be specified',
      phone: newClient.phone || '',
      fax: newClient.fax || '',
      contactPerson: newClient.contactPerson,
      contactEmail: newClient.contactEmail,
      industry: newClient.industry || 'General Business',
      status: (newClient.status as ClientStatus) || 'lead',
      accountManager: currentUser.name,
      contractExpiryDate: newClient.contractExpiryDate || ''
    };

    addClient(client);
    setShowAddModal(false);
    setSelectedClient(client); // focus detail on new client
    setNewClient({
      name: '',
      regNo: '',
      billingAddress: '',
      siteAddress: '',
      phone: '',
      fax: '',
      contactPerson: '',
      contactEmail: '',
      industry: '',
      status: 'lead',
      accountManager: currentUser.name
    });
  };

  // Filter list
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.accountManager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesRenewal = !renewalFilter || (c.contractExpiryDate && new Date(c.contractExpiryDate) < new Date('2028-01-01'));
    return matchesSearch && matchesStatus && matchesRenewal;
  });

  // Calculate stats for selected client
  const clientQuotes = quotations.filter(q => q.clientId === selectedClient?.id);
  const clientInvoices = invoices.filter(inv => inv.clientId === selectedClient?.id);
  const clientProject = projects.find(p => p.clientId === selectedClient?.id);

  // Check permissions: Sales reps can only manage clients where they are AM
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'sales_rep';

  return (
    <div className="space-y-6">
      {/* Top action and search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company name, contact person, or AM..."
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
            <option value="lead">Leads</option>
            <option value="quoted">Quoted</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="churned">Churned</option>
          </select>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={renewalFilter}
              onChange={(e) => setRenewalFilter(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-600 border-gray-300 h-4 w-4"
            />
            <span>Approaching Renewal Expire</span>
          </label>
          
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register Corporate</span>
            </button>
          )}
        </div>
      </div>

      {/* Main CRM Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Clients Table list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Corporate Directory</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filteredClients.length} Records found</span>
          </div>

          <div className="divide-y divide-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Company Name</th>
                  <th className="px-6 py-3.5">Contact Person</th>
                  <th className="px-6 py-3.5">Account Manager</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`hover:bg-slate-50/50 cursor-pointer transition-all ${
                      selectedClient?.id === client.id ? 'bg-brand-50/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      <div>
                        <p className="text-gray-900 font-bold">{client.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{client.industry}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-700 font-medium">{client.contactPerson}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{client.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{client.accountManager}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="text-brand-600 hover:text-brand-950 font-bold text-xs inline-flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client);
                        }}
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      No matching clients found. Use 'Register Corporate' to append records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client details pane */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-xs p-6 space-y-6">
          {selectedClient ? (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded border ${getStatusColor(selectedClient.status)}`}>
                    {selectedClient.status}
                  </span>
                  <span className="text-xs font-mono text-gray-400">{selectedClient.id}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">{selectedClient.name}</h3>
                <p className="text-xs text-gray-400 mt-1">Reg: {selectedClient.regNo}</p>
              </div>

              {/* Company Info details */}
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Industry / Segment</p>
                    <p className="mt-0.5">{selectedClient.industry}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Contact Person</p>
                    <p className="mt-0.5">{selectedClient.contactPerson}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Email Address</p>
                    <p className="mt-0.5 text-brand-600">{selectedClient.contactEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Direct Telephone</p>
                    <p className="mt-0.5">{selectedClient.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Billing Address</p>
                    <p className="mt-0.5">{selectedClient.billingAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800">Installation Site Address</p>
                    <p className="mt-0.5">{selectedClient.siteAddress}</p>
                  </div>
                </div>

                {selectedClient.contractExpiryDate && (
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-brand-50 border border-brand-100">
                    <CalendarCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-brand-900">Contract Lock-in Valid</p>
                      <p className="text-[11px] text-brand-700 mt-0.5">Expires: {selectedClient.contractExpiryDate}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Records Summary */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Linked Records Summary</h4>
                
                {/* Linked Quotations */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quotation History ({clientQuotes.length})</p>
                  {clientQuotes.map(q => (
                    <div key={q.id} className="flex justify-between p-2 rounded bg-gray-50 border border-gray-100 text-xs">
                      <div>
                        <span className="font-bold text-gray-700">{q.refNo}</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">{q.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-800">RM {q.grandTotal.toLocaleString()}</span>
                        <span className="block text-[9px] font-bold text-brand-600 uppercase mt-0.5">{q.status}</span>
                      </div>
                    </div>
                  ))}
                  {clientQuotes.length === 0 && <p className="text-[11px] text-gray-400">No linked quotations recorded.</p>}
                </div>

                {/* Linked Invoices */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoices & Billing ({clientInvoices.length})</p>
                  {clientInvoices.map(inv => (
                    <div key={inv.id} className="flex justify-between p-2 rounded bg-gray-50 border border-gray-100 text-xs">
                      <div>
                        <span className="font-bold text-gray-700">{inv.id} ({inv.type})</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">{inv.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-800">RM {inv.grandTotal.toLocaleString()}</span>
                        <span className={`block text-[9px] font-bold uppercase mt-0.5 ${inv.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{inv.status}</span>
                      </div>
                    </div>
                  ))}
                  {clientInvoices.length === 0 && <p className="text-[11px] text-gray-400">No invoices generated yet.</p>}
                </div>

                {/* Project Pipeline tracker */}
                {clientProject && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-gray-100 text-xs space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project Status</p>
                    <p className="font-bold text-gray-800">{clientProject.currentStage}</p>
                    <p className="text-[10px] text-gray-400">Owner: {clientProject.owner}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">No Client Selected</p>
              <p className="text-xs mt-1">Select a corporate client from the directory to expand details & financial logs.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Client Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Register New Corporate Corporate Account</h3>
                <p className="text-xs text-gray-400 mt-0.5">Initialize corporate CRM logs for quotations & fiber provisioning SLA</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-900 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Company Legal Name <span className="text-rose-600">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maxis Broadband Sdn Bhd"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Company Registration No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 199201018291 (471194-V)"
                    value={newClient.regNo}
                    onChange={(e) => setNewClient({...newClient, regNo: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Primary Contact Person <span className="text-rose-600">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Melissa Wong"
                    value={newClient.contactPerson}
                    onChange={(e) => setNewClient({...newClient, contactPerson: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Contact Email Address <span className="text-rose-600">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. melissa@corp.com"
                    value={newClient.contactEmail}
                    onChange={(e) => setNewClient({...newClient, contactEmail: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Primary Office Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +60 3-7848 4000"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Office Fax</label>
                  <input
                    type="text"
                    placeholder="e.g. +60 3-7848 4111"
                    value={newClient.fax}
                    onChange={(e) => setNewClient({...newClient, fax: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Industry Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Utilities / Oil & Gas"
                    value={newClient.industry}
                    onChange={(e) => setNewClient({...newClient, industry: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Lead Status</label>
                  <select
                    value={newClient.status}
                    onChange={(e) => setNewClient({...newClient, status: e.target.value as ClientStatus})}
                    className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  >
                    <option value="lead">Early CRM Lead</option>
                    <option value="quoted">Active Quote Sent</option>
                    <option value="active">Active Signed Contract</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Billing Postal Address</label>
                <textarea
                  placeholder="Enter full legal billing address..."
                  value={newClient.billingAddress}
                  onChange={(e) => setNewClient({...newClient, billingAddress: e.target.value})}
                  rows={2}
                  className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Installation Site Address (If different from Billing)</label>
                <textarea
                  placeholder="Enter physical site fiber drop termination coordinates/address..."
                  value={newClient.siteAddress}
                  onChange={(e) => setNewClient({...newClient, siteAddress: e.target.value})}
                  rows={2}
                  className="w-full bg-white border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientsModule;
