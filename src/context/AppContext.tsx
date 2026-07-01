import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, UserRole, CatalogItem, Client, Quotation, Job, Invoice, Project, Payment, Technician, ProjectStep, InvoiceStatus, InvoiceLineItem, SlaSettings, TroubleTicket, TicketPriority, TicketStatus
} from '../types';
import { 
  getStoredData, setStoredData, initializeAppState, seedUsers, seedTechnicians, seedProjects 
} from '../data';
import { calculateTotals, calculateCosting, DEFAULT_SST_RATE } from '../domain/pricingEngine';

interface AppContextType {
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCurrentUser: (user: User) => void;
  isLoggedOut: boolean;
  logout: () => void;
  login: (user: User) => void;
  menuVisibility: Record<string, boolean>;
  setMenuVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  catalog: CatalogItem[];
  setCatalog: React.Dispatch<React.SetStateAction<CatalogItem[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  technicians: Technician[];
  
  // Workflows
  addClient: (client: Client) => void;
  updateClient: (client: Client, oldId?: string) => void;
  addCatalogItem: (item: CatalogItem) => void;
  updateCatalogItem: (item: CatalogItem) => void;
  deleteCatalogItem: (code: string) => void;
  
  saveQuotation: (quotation: Quotation) => void;
  verifyCosting: (quoteId: string) => void; // HOD Sales approval
  approveQuotation: (quoteId: string) => void; // CEO approval
  acceptQuotation: (quoteId: string) => void; // Client acceptance, converts to Job & issuing Deposit Invoice
  rejectQuotation: (quoteId: string) => void;
  
  scheduleJob: (jobId: string, techIds: string[], date: string) => void;
  addJobSchedule: (jobData: any) => void;
  deleteJobSchedule: (jobId: string) => void;
  completeJobSurvey: (jobId: string, cablingMeters: number, serials: string, router: string, mesh: string) => void;
  activateJobService: (jobId: string) => void;
  closeJob: (jobId: string) => void;
  
  addInvoice: (invoice: Invoice) => void;
  recordPayment: (invoiceId: string, amount: number, method: string, ref: string) => void;
  runMonthlyBillingCycle: (billingMonth: string) => { count: number; totalValue: number };
  nextcloudConfig: {
    url: string;
    username: string;
    token: string;
    enabled: boolean;
  };
  setNextcloudConfig: React.Dispatch<React.SetStateAction<{
    url: string;
    username: string;
    token: string;
    enabled: boolean;
  }>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  triggerClientCreate: boolean;
  setTriggerClientCreate: (val: boolean) => void;
  slaSettings: SlaSettings;
  setSlaSettings: React.Dispatch<React.SetStateAction<SlaSettings>>;
  troubleTickets: TroubleTicket[];
  setTroubleTickets: React.Dispatch<React.SetStateAction<TroubleTicket[]>>;
  addTroubleTicket: (ticket: TroubleTicket) => void;
  updateTroubleTicket: (ticket: TroubleTicket) => void;
  deleteTroubleTicket: (ticketId: string) => void;
  applyRebateToInvoice: (ticketId: string, invoiceId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Trigger initial seeds
  initializeAppState();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [triggerClientCreate, setTriggerClientCreate] = useState(false);

  const [currentUser, setCurrentUserRaw] = useState<User>(() => 
    getStoredData('pois_currentUser', seedUsers[0])
  );
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => 
    getStoredData('pois_catalog', [])
  );
  const [clients, setClients] = useState<Client[]>(() => 
    getStoredData('pois_clients', [])
  );
  const [quotations, setQuotations] = useState<Quotation[]>(() => 
    getStoredData('pois_quotations', [])
  );
  const [jobs, setJobs] = useState<Job[]>(() => 
    getStoredData('pois_jobs', [])
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() => 
    getStoredData('pois_invoices', [])
  );
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = getStoredData('pois_projects', []);
    if (stored.length > 0 && !stored.some(p => p.stage)) {
      setStoredData('pois_projects', seedProjects);
      return seedProjects;
    }
    if (stored.length === 0) {
      setStoredData('pois_projects', seedProjects);
      return seedProjects;
    }
    return stored;
  });

  const technicians = seedTechnicians;
  const [users, setUsers] = useState<User[]>(() => 
    getStoredData('pois_users', seedUsers)
  );
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(() => 
    getStoredData('pois_isLoggedOut', false)
  );
  const [menuVisibility, setMenuVisibility] = useState<Record<string, boolean>>(() => 
    getStoredData('pois_menuVisibility', {
      'global:dashboard': true,
      'global:clients': true,
      'global:catalog': true,
      'global:quotations': true,
      'global:invoices': true,
      'global:jobs': true,
      'global:projects': true,
      'global:selftests': true,
      'global:tickets': true,
      'global:settings': true,
    })
  );

  // Fetch initial menu visibility from the server once on mount
  useEffect(() => {
    fetch('/api/menu-visibility')
      .then(res => {
        if (!res.ok) throw new Error('API response error');
        return res.json();
      })
      .then(data => {
        if (data && data.menuVisibility && Object.keys(data.menuVisibility).length > 0) {
          setMenuVisibility(data.menuVisibility);
        }
      })
      .catch(err => console.warn('Could not fetch server-side menu visibility:', err));
  }, []);

  const [nextcloudConfig, setNextcloudConfig] = useState(() => 
    getStoredData('pois_nextcloudConfig', {
      url: 'https://nextcloud.pois-integrator.com.my',
      username: 'pois_erp_sync',
      token: 'nxc_token_8a3f9e2b1c4',
      enabled: true
    })
  );

  const [slaSettings, setSlaSettings] = useState<SlaSettings>(() => 
    getStoredData('pois_slaSettings', {
      targetUptime: 99.9,
      deliverySlaDays: 21,
      cablingAdjustmentRate: 20.00,
      outageRebatePercent: 5.0,
      resolutionSlaHours: 4,
      latencySlaMs: 15,
      packetLossSlaPercent: 0.1
    })
  );

  const [troubleTickets, setTroubleTickets] = useState<TroubleTicket[]>(() =>
    getStoredData('pois_troubleTickets', [
      {
        id: 'TKT-1082',
        clientId: 'C-001',
        title: 'Core Fiber Link Splicing Failure at NOC',
        description: 'Total loss of signal since 03:00 AM. Ground technicians dispatched for OTDR testing.',
        status: 'open',
        priority: 'critical',
        createdAt: '2026-07-01 03:15:00',
        isOutage: true,
        outageDurationHours: 6.5,
        slaBreached: true,
        rebateAmount: 487.50, // Calculated as: 6.5 hours * 5.0% * RM1500 MRC
        assignedTechnicianId: 'TECH-01'
      },
      {
        id: 'TKT-1083',
        clientId: 'C-003',
        title: 'High Packet Loss & Latency Spikes during peak hours',
        description: 'Ping responses exceeding 150ms to gateway. SLA limit is 15ms. Need NOC analysis.',
        status: 'investigating',
        priority: 'high',
        createdAt: '2026-06-29 18:22:00',
        isOutage: false,
        slaBreached: true,
        assignedTechnicianId: 'TECH-02'
      },
      {
        id: 'TKT-1084',
        clientId: 'C-001',
        title: 'Unscheduled Node Maintenance Downtime',
        description: 'Scheduled card replacement took 5.5 hours instead of 2. Resolved successfully.',
        status: 'resolved',
        priority: 'high',
        createdAt: '2026-06-28 01:00:00',
        resolvedAt: '2026-06-28 06:30:00',
        isOutage: true,
        outageDurationHours: 5.5,
        slaBreached: true,
        rebateAmount: 412.50, // Calculated as: 5.5 hours * 5.0% * RM1500 MRC
        assignedTechnicianId: 'TECH-01'
      }
    ])
  );

  // Sync to localStorage
  useEffect(() => { setStoredData('pois_nextcloudConfig', nextcloudConfig); }, [nextcloudConfig]);
  useEffect(() => { setStoredData('pois_slaSettings', slaSettings); }, [slaSettings]);
  useEffect(() => { setStoredData('pois_troubleTickets', troubleTickets); }, [troubleTickets]);
  useEffect(() => { setStoredData('pois_currentUser', currentUser); }, [currentUser]);
  useEffect(() => { setStoredData('pois_isLoggedOut', isLoggedOut); }, [isLoggedOut]);
  useEffect(() => { setStoredData('pois_catalog', catalog); }, [catalog]);
  useEffect(() => { setStoredData('pois_clients', clients); }, [clients]);
  useEffect(() => { setStoredData('pois_quotations', quotations); }, [quotations]);
  useEffect(() => { setStoredData('pois_jobs', jobs); }, [jobs]);
  useEffect(() => { setStoredData('pois_invoices', invoices); }, [invoices]);
  useEffect(() => { setStoredData('pois_projects', projects); }, [projects]);
  useEffect(() => { setStoredData('pois_users', users); }, [users]);
  
  useEffect(() => { 
    setStoredData('pois_menuVisibility', menuVisibility); 
    // Synchronize to persistent server-side store
    fetch('/api/menu-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuVisibility })
    }).catch(err => console.error('Failed to update server-side menu visibility:', err));
  }, [menuVisibility]);

  const setCurrentUser = (user: User) => {
    setCurrentUserRaw(user);
  };

  const logout = () => {
    setIsLoggedOut(true);
  };

  const login = (user: User) => {
    setCurrentUserRaw(user);
    setIsLoggedOut(false);
  };

  // Client database CRUD
  const addClient = (client: Client) => {
    setClients(prev => [...prev, client]);
  };

  const updateClient = (updatedClient: Client, oldId?: string) => {
    const targetId = oldId || updatedClient.id;
    setClients(prev => prev.map(c => c.id === targetId ? updatedClient : c));
    
    if (oldId && oldId !== updatedClient.id) {
      // Propagate client ID updates to other collections
      setQuotations(prev => prev.map(q => q.clientId === oldId ? { ...q, clientId: updatedClient.id } : q));
      setInvoices(prev => prev.map(inv => inv.clientId === oldId ? { ...inv, clientId: updatedClient.id } : inv));
      setProjects(prev => prev.map(p => p.clientId === oldId ? { ...p, clientId: updatedClient.id } : p));
    }
  };

  // Catalog CRUD
  const addCatalogItem = (item: CatalogItem) => {
    setCatalog(prev => [...prev, item]);
  };

  const updateCatalogItem = (updatedItem: CatalogItem) => {
    setCatalog(prev => prev.map(item => item.code === updatedItem.code ? updatedItem : item));
  };

  const deleteCatalogItem = (code: string) => {
    setCatalog(prev => prev.filter(item => item.code !== code));
  };

  // Quotation workflows
  const saveQuotation = (quote: Quotation) => {
    setQuotations(prev => {
      const exists = prev.some(q => q.id === quote.id);
      if (exists) {
        return prev.map(q => q.id === quote.id ? quote : q);
      } else {
        // Also spawn a project timeline in pending state
        const newProject: Project = {
          id: 'PRJ-' + Math.floor(1000 + Math.random() * 9000),
          clientId: quote.clientId,
          quotationId: quote.id,
          steps: [
            { key: 'quotation', label: 'Quotation Created', status: 'active', date: quote.date },
            { key: 'po_received', label: 'PO Received & Deposit Invoice Issued', status: 'pending' },
            { key: 'job_scheduled', label: 'Installation Work Order Scheduled', status: 'pending' },
            { key: 'site_survey', label: 'Site Survey & Rack Assessment', status: 'pending' },
            { key: 'installation', label: 'Fiber Splicing & Cabling Execution', status: 'pending' },
            { key: 'activation', label: 'ISP Backbone Activation & ping-test', status: 'pending' },
            { key: 'handover', label: 'Customer Acceptance Handover Signed', status: 'pending' },
            { key: 'billing_start', label: 'Monthly Recurring Billing Commenced', status: 'pending' }
          ],
          owner: quote.preparedBy,
          currentStage: 'Draft Quotation',
          daysInStage: 1,
          nextAction: 'Internal pricing approval workflow',
          lockInEndDate: '',
          atSlaRisk: false,
          stage: 'survey',
          progress: 10,
          isRenewalRisk: false,
          targetDeliveryDate: new Date(new Date().getTime() + (slaSettings.deliverySlaDays || 20) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          daysElapsed: 1,
          slaLimitDays: slaSettings.deliverySlaDays || 20,
          cycleTimes: { survey: 1 }
        };
        setProjects(p => [...p, newProject]);
        return [...prev, quote];
      }
    });
  };

  const verifyCosting = (quoteId: string) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, hodApproved: true };
      }
      return q;
    }));
  };

  const approveQuotation = (quoteId: string) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, ceoApproved: true };
      }
      return q;
    }));
  };

  const rejectQuotation = (quoteId: string) => {
    setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'rejected' as const } : q));
    setProjects(prev => prev.map(p => p.quotationId === quoteId ? { ...p, currentStage: 'Rejected', nextAction: 'Revise quotation' } : p));
  };

  // Client accepts the quote -> converted to Job & issuing deposit invoice
  const acceptQuotation = (quoteId: string) => {
    let targetQuote: Quotation | undefined;
    setQuotations(prev => prev.map(q => {
      if (q.id === quoteId) {
        targetQuote = q;
        return { ...q, status: 'accepted' as const, dateAccepted: new Date().toISOString().split('T')[0] };
      }
      return q;
    }));

    if (!targetQuote) return;

    // 1. Create a Job / Work order automatically
    const jobRef = 'POIS/JOB/' + targetQuote.refNo.split('-').pop();
    const jobId = 'JOB-' + Math.floor(1000 + Math.random() * 9000);
    const client = clients.find(c => c.id === targetQuote?.clientId);
    
    // SLA target is configured dynamically in settings
    const today = new Date();
    const dueDate = new Date(today.setDate(today.getDate() + (slaSettings.deliverySlaDays || 21))).toISOString().split('T')[0];

    const newJob: Job = {
      id: jobId,
      quotationId: quoteId,
      refNo: jobRef,
      clientId: targetQuote.clientId,
      siteAddress: client?.siteAddress || 'To be specified',
      serviceType: targetQuote.title,
      assignedTechnicians: [],
      status: 'pending_survey',
      slaDueDate: dueDate,
      surveyChecklist: {
        completed: false
      }
    };

    setJobs(prev => [...prev, newJob]);

    // 2. Spawn a One-Time invoice for initial deposit + setup cost
    // Deposits are exempt, activation & cabling is taxable.
    // Let's analyze quote items to see what was fiber pack / broadband / equipment
    const depositItems: any[] = [];
    const setupItems: any[] = [];

    targetQuote.items.forEach(item => {
      // Check if it's a fiber package to charge upfront 3mo deposit
      if (item.itemCode.startsWith('GF-') || item.itemCode === 'GF-100M' || item.itemCode === 'GF-300M' || item.itemCode === 'GF-500M' || item.itemCode === 'GF-1G') {
        const depositAmount = item.itemCode === 'GF-100M' ? 1190.40 : 
                            item.itemCode === 'GF-300M' ? 2985.00 :
                            item.itemCode === 'GF-500M' ? 3600.00 :
                            item.itemCode === 'GF-1G' ? 6120.00 : 1000;
        
        depositItems.push({
          id: 'ILI-' + Math.floor(10000 + Math.random() * 90000),
          description: `Refundable Security Deposit for ${item.description} (3mo upfront - SST Exempt)`,
          qty: 1,
          unitPrice: depositAmount,
          taxable: false,
          sstAmount: 0,
          totalAmount: depositAmount
        });
      } else if (item.itemCode.startsWith('OTC-') || item.itemCode.startsWith('EQ-') || item.isFoc) {
        // One-time setup / cabling / equipment
        const amount = item.isFoc ? 0 : item.qty * item.unitPrice;
        const sst = item.taxable ? amount * DEFAULT_SST_RATE : 0;
        setupItems.push({
          id: 'ILI-' + Math.floor(10000 + Math.random() * 90000),
          description: item.description + (item.isFoc ? ' (FOC Bundle)' : ''),
          qty: item.qty,
          unitPrice: item.unitPrice,
          taxable: item.taxable,
          sstAmount: Number(sst.toFixed(2)),
          totalAmount: Number((amount + sst).toFixed(2))
        });
      }
    });

    // If no fiber packages but it has internet access monthly rental, let's charge 1mo rental deposit as standard
    if (depositItems.length === 0) {
      const monthlyItem = targetQuote.items.find(item => item.itemCode.startsWith('IA-') || item.itemCode.startsWith('LL-'));
      if (monthlyItem && !monthlyItem.isFoc) {
        const depositAmount = monthlyItem.unitPrice;
        depositItems.push({
          id: 'ILI-' + Math.floor(10000 + Math.random() * 90000),
          description: `Refundable Security Deposit for ${monthlyItem.description} (1mo upfront - SST Exempt)`,
          qty: 1,
          unitPrice: depositAmount,
          taxable: false,
          sstAmount: 0,
          totalAmount: depositAmount
        });
      }
    }

    const allInvoiceItems = [...depositItems, ...setupItems];
    const subtotal = allInvoiceItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const sstTotal = allInvoiceItems.reduce((acc, item) => acc + item.sstAmount, 0);
    const grandTotal = Number((subtotal + sstTotal).toFixed(2));

    const invoiceId = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    const newInvoice: Invoice = {
      id: invoiceId,
      quotationId: quoteId,
      clientId: targetQuote.clientId,
      type: 'one-time',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      items: allInvoiceItems,
      subtotal: Number(subtotal.toFixed(2)),
      sstTotal: Number(sstTotal.toFixed(2)),
      grandTotal: grandTotal,
      status: 'issued',
      payments: []
    };

    setInvoices(prev => [...prev, newInvoice]);

    // 3. Update the CRM Client status to "active"
    setClients(prev => prev.map(c => c.id === targetQuote?.clientId ? { ...c, status: 'active' as const } : c));

    // 4. Update the Project timeline step
    setProjects(prev => prev.map(p => {
      if (p.quotationId === quoteId) {
        const updatedSteps = p.steps.map(step => {
          if (step.key === 'quotation') return { ...step, status: 'completed' as const };
          if (step.key === 'po_received') return { ...step, status: 'completed' as const, date: new Date().toISOString().split('T')[0] };
          if (step.key === 'job_scheduled') return { ...step, status: 'active' as const };
          return step;
        });

        return {
          ...p,
          jobId: jobId,
          steps: updatedSteps,
          currentStage: 'PO Received & Work Order Scheduled',
          nextAction: 'Technician dispatch & physical site survey'
        };
      }
      return p;
    }));
  };

  // Job operations
  const scheduleJob = (jobId: string, techIds: string[], date: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          assignedTechnicians: techIds,
          scheduledDate: date,
          status: 'scheduled' as const
        };
      }
      return j;
    }));

    setProjects(prev => prev.map(p => {
      if (p.jobId === jobId) {
        const updatedSteps = p.steps.map(step => {
          if (step.key === 'job_scheduled') return { ...step, status: 'completed' as const, date: date };
          if (step.key === 'site_survey') return { ...step, status: 'active' as const };
          return step;
        });

        return {
          ...p,
          steps: updatedSteps,
          currentStage: 'Installation Scheduled',
          nextAction: 'Execute site survey on ' + date
        };
      }
      return p;
    }));
  };

  const addJobSchedule = (jobData: any) => {
    const jobId = 'JOB-' + Math.floor(1000 + Math.random() * 9000);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refNo = `POIS/JOB/MAN-${randomSuffix}`;
    const newJob: Job = {
      id: jobId,
      refNo,
      surveyChecklist: { completed: false },
      ...jobData
    };

    setJobs(prev => [newJob, ...prev]);

    const projectId = 'PRJ-' + Math.floor(1000 + Math.random() * 9000);
    const newProject: Project = {
      id: projectId,
      quotationId: jobData.quotationId || 'Q-MANUAL',
      clientId: jobData.clientId,
      jobId: jobId,
      currentStage: jobData.status === 'scheduled' ? 'Installation Scheduled' : 'Physical Drop-cable Survey',
      nextAction: jobData.status === 'scheduled' ? 'Execute site survey on ' + jobData.scheduledDate : 'Assign Onsite Field Technicians & Schedule',
      steps: [
        { key: 'quotation', label: 'Quotation Signed & Accepted', status: 'completed' as const, date: new Date().toISOString().split('T')[0] },
        { key: 'po_received', label: 'DuitNow Deposit Paid (100%)', status: 'completed' as const, date: new Date().toISOString().split('T')[0] },
        { key: 'job_scheduled', label: 'Installation Work Order Scheduled', status: jobData.status === 'scheduled' ? ('completed' as const) : ('active' as const), date: jobData.scheduledDate },
        { key: 'site_survey', label: 'Physical Site Survey Conducted', status: jobData.status === 'scheduled' ? ('active' as const) : ('pending' as const) },
        { key: 'installation', label: 'Physical Drop-cable Installed', status: 'pending' as const },
        { key: 'activation', label: 'Core NOC Parameters Activated', status: 'pending' as const },
        { key: 'handover', label: 'Acceptance Certificate Signed', status: 'pending' as const },
        { key: 'billing_start', label: 'Commence Monthly Billing', status: 'pending' as const }
      ],
      owner: 'Sarah Tan',
      daysInStage: 1,
      lockInEndDate: '',
      atSlaRisk: false,
      stage: 'survey' as const,
      progress: 20,
      isRenewalRisk: false,
      targetDeliveryDate: new Date(new Date().getTime() + (slaSettings.deliverySlaDays || 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysElapsed: 1,
      slaLimitDays: slaSettings.deliverySlaDays || 15,
      cycleTimes: { survey: 1 }
    };

    setProjects(prev => [newProject, ...prev]);
  };

  const deleteJobSchedule = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setProjects(prev => prev.filter(p => p.jobId !== jobId));
  };

  // Site survey completed: Logs actual fiber cabling meters and equipment serials
  const completeJobSurvey = (jobId: string, cablingMeters: number, serials: string, router: string, mesh: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'installed' as const,
          surveyChecklist: {
            cablingMetersUsed: cablingMeters,
            equipmentSerials: serials,
            routerAssigned: router,
            apMeshAssigned: mesh,
            completed: true
          }
        };
      }
      return j;
    }));

    // Update quantities in the Client Project so we know actual cabling meters
    setProjects(prev => prev.map(p => {
      if (p.jobId === jobId) {
        const updatedSteps = p.steps.map(step => {
          if (step.key === 'site_survey') return { ...step, status: 'completed' as const, date: new Date().toISOString().split('T')[0] };
          if (step.key === 'installation') return { ...step, status: 'completed' as const, date: new Date().toISOString().split('T')[0] };
          if (step.key === 'activation') return { ...step, status: 'active' as const };
          return step;
        });

        // Let's check if actual fiber cabling exceeds the original quote. 
        // If it does, we will issue an adjusted invoice or reconcile later.
        return {
          ...p,
          steps: updatedSteps,
          currentStage: 'Fiber Physical Installed',
          nextAction: 'Coordinate with Telekom backbone NOC to activate fiber service'
        };
      }
      return p;
    }));
  };

  const activateJobService = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'activated' as const } : j));

    setProjects(prev => prev.map(p => {
      if (p.jobId === jobId) {
        const updatedSteps = p.steps.map(step => {
          if (step.key === 'activation') return { ...step, status: 'completed' as const, date: new Date().toISOString().split('T')[0] };
          if (step.key === 'handover') return { ...step, status: 'active' as const };
          return step;
        });

        return {
          ...p,
          steps: updatedSteps,
          currentStage: 'Broadband Service Active',
          nextAction: 'Deliver handover certification and acquire client sign-off'
        };
      }
      return p;
    }));
  };

  const closeJob = (jobId: string) => {
    let targetJob: Job | undefined;
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        targetJob = j;
        return { ...j, status: 'closed' as const };
      }
      return j;
    }));

    setProjects(prev => prev.map(p => {
      if (p.jobId === jobId) {
        const updatedSteps = p.steps.map(step => {
          if (step.key === 'handover') return { ...step, status: 'completed' as const, date: new Date().toISOString().split('T')[0] };
          if (step.key === 'billing_start') return { ...step, status: 'completed' as const, date: new Date().toISOString().split('T')[0] };
          return step;
        });

        // Calculate contract expiration (24 months from today)
        const today = new Date();
        const expiryDate = new Date(today.setMonth(today.getMonth() + 24)).toISOString().split('T')[0];

        // Also update the client contract expiry
        setClients(cls => cls.map(c => c.id === p.clientId ? { ...c, contractExpiryDate: expiryDate } : c));

        // Reconcile actual cabling meters on final invoice!
        // Find if we need to issue an adjusted invoice for excess fiber cabling
        const quote = quotations.find(q => q.id === p.quotationId);
        const originalCablingItem = quote?.items.find(item => item.itemCode === 'OTC-CABLING');
        const originalMeters = originalCablingItem?.qty || 0;
        const actualMeters = targetJob?.surveyChecklist?.cablingMetersUsed || 0;

        if (actualMeters > originalMeters) {
          const extraMeters = actualMeters - originalMeters;
          const cablingPrice = slaSettings.cablingAdjustmentRate || 20.00;
          const amount = extraMeters * cablingPrice;
          const sst = amount * DEFAULT_SST_RATE;

          const reconciliationInvoice: Invoice = {
            id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
            quotationId: p.quotationId,
            clientId: p.clientId,
            type: 'one-time',
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
            items: [{
              id: 'ILI-' + Math.floor(10000 + Math.random() * 90000),
              description: `Splicing reconciliation: Excess physical fiber drop-cable installed (${extraMeters}m @ RM${cablingPrice.toFixed(2)}/m)`,
              qty: extraMeters,
              unitPrice: cablingPrice,
              taxable: true,
              sstAmount: Number(sst.toFixed(2)),
              totalAmount: Number((amount + sst).toFixed(2))
            }],
            subtotal: amount,
            sstTotal: Number(sst.toFixed(2)),
            grandTotal: Number((amount + sst).toFixed(2)),
            status: 'issued',
            payments: []
          };
          
          setInvoices(invs => [...invs, reconciliationInvoice]);
        }

        return {
          ...p,
          steps: updatedSteps,
          currentStage: 'Activated & Handover Completed',
          nextAction: 'Active monthly recurring contract billing',
          lockInEndDate: expiryDate
        };
      }
      return p;
    }));
  };

  // Invoicing CRUD and Payment tracking
  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [...prev, invoice]);
  };

  const recordPayment = (invoiceId: string, amount: number, method: string, ref: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newPayment: Payment = {
          id: 'PAY-' + Math.floor(1000 + Math.random() * 9000),
          invoiceId,
          amount,
          date: new Date().toISOString().split('T')[0],
          method,
          reference: ref
        };

        const updatedPayments = [...inv.payments, newPayment];
        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);

        let status: InvoiceStatus = 'partially_paid';
        if (totalPaid >= inv.grandTotal) {
          status = 'paid';
        }

        return {
          ...inv,
          payments: updatedPayments,
          status
        };
      }
      return inv;
    }));
  };

  /**
   * RECURRING BILLING ENGINE:
   * Generates recurring monthly invoices for ALL active projects based on monthly rental elements in their original quotation contracts.
   */
  const runMonthlyBillingCycle = (billingMonth: string) => {
    let count = 0;
    let totalValue = 0;
    const newInvoices: Invoice[] = [];

    // Find all active projects
    const activeProjects = projects.filter(p => {
      // Completed activation and lock-in is defined
      return p.steps.find(s => s.key === 'billing_start' && s.status === 'completed');
    });

    activeProjects.forEach(project => {
      // Find original Quotation
      const quote = quotations.find(q => q.id === project.quotationId);
      if (!quote) return;

      // Extract only recurring monthly charges items
      const recurringItems = quote.items.filter(item => {
        const catItem = catalog.find(ci => ci.code === item.itemCode);
        return catItem?.unit === 'month' && !item.isFoc;
      });

      if (recurringItems.length === 0) return;

      // Check if this project has already been billed for this billing cycle month
      const alreadyBilled = invoices.some(inv => 
        inv.clientId === project.clientId && 
        inv.type === 'recurring' && 
        inv.billingCycleMonth === billingMonth
      );

      if (alreadyBilled) return;

      // Map to invoice line items
      const invoiceItems: InvoiceLineItem[] = recurringItems.map(item => {
        const lineAmount = item.qty * item.unitPrice;
        const sst = item.taxable ? lineAmount * DEFAULT_SST_RATE : 0;
        return {
          id: 'ILI-' + Math.floor(10000 + Math.random() * 90000),
          description: `Monthly Rental Lease: ${item.description}`,
          qty: item.qty,
          unitPrice: item.unitPrice,
          taxable: item.taxable,
          sstAmount: Number(sst.toFixed(2)),
          totalAmount: Number((lineAmount + sst).toFixed(2))
        };
      });

      const subtotal = invoiceItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
      const sstTotal = invoiceItems.reduce((acc, item) => acc + item.sstAmount, 0);
      const grandTotal = Number((subtotal + sstTotal).toFixed(2));

      const recurringInvoice: Invoice = {
        id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        quotationId: quote.id,
        clientId: project.clientId,
        type: 'recurring',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0], // 14-day terms
        items: invoiceItems,
        subtotal: Number(subtotal.toFixed(2)),
        sstTotal: Number(sstTotal.toFixed(2)),
        grandTotal: grandTotal,
        status: 'issued',
        payments: [],
        billingCycleMonth: billingMonth
      };

      newInvoices.push(recurringInvoice);
      count++;
      totalValue += grandTotal;
    });

    if (newInvoices.length > 0) {
      setInvoices(prev => [...prev, ...newInvoices]);
    }

    return { count, totalValue };
  };

  const addTroubleTicket = (ticket: TroubleTicket) => {
    setTroubleTickets(prev => [...prev, ticket]);
  };

  const updateTroubleTicket = (ticket: TroubleTicket) => {
    setTroubleTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
  };

  const deleteTroubleTicket = (ticketId: string) => {
    setTroubleTickets(prev => prev.filter(t => t.id !== ticketId));
  };

  const applyRebateToInvoice = (ticketId: string, invoiceId: string) => {
    // 1. Find the actual ticket to get rebate info
    const ticket = troubleTickets.find(t => t.id === ticketId);
    if (!ticket || !ticket.rebateAmount) return;

    // 2. Find and update the ticket to link it to the invoice
    setTroubleTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, appliedToInvoiceId: invoiceId, status: 'closed' };
      }
      return t;
    }));

    // 3. Add the rebate as a line item to the selected invoice
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const lineItemAmount = -Number(ticket.rebateAmount!.toFixed(2));
        const newItem: InvoiceLineItem = {
          id: 'ILI-' + Math.floor(10000 + Math.random() * 90000),
          description: `SLA Service Outage Rebate Adjustment — Ref: ${ticket.id}`,
          qty: 1,
          unitPrice: lineItemAmount,
          taxable: false,
          sstAmount: 0,
          totalAmount: lineItemAmount
        };

        const updatedItems = [...inv.items, newItem];
        const subtotal = updatedItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
        const sstTotal = updatedItems.reduce((acc, item) => acc + (item.sstAmount || 0), 0);
        const grandTotal = Number((subtotal + sstTotal).toFixed(2));

        return {
          ...inv,
          items: updatedItems,
          subtotal: Number(subtotal.toFixed(2)),
          sstTotal: Number(sstTotal.toFixed(2)),
          grandTotal: grandTotal < 0 ? 0 : grandTotal
        };
      }
      return inv;
    }));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      setUsers,
      setCurrentUser,
      isLoggedOut,
      logout,
      login,
      menuVisibility,
      setMenuVisibility,
      catalog,
      setCatalog,
      clients,
      setClients,
      quotations,
      setQuotations,
      jobs,
      setJobs,
      invoices,
      setInvoices,
      projects,
      setProjects,
      technicians,
      
      addClient,
      updateClient,
      addCatalogItem,
      updateCatalogItem,
      deleteCatalogItem,
      
      saveQuotation,
      verifyCosting,
      approveQuotation,
      acceptQuotation,
      rejectQuotation,
      
      scheduleJob,
      addJobSchedule,
      deleteJobSchedule,
      completeJobSurvey,
      activateJobService,
      closeJob,
      
      addInvoice,
      recordPayment,
      runMonthlyBillingCycle,
      nextcloudConfig,
      setNextcloudConfig,
      activeTab,
      setActiveTab,
      triggerClientCreate,
      setTriggerClientCreate,
      slaSettings,
      setSlaSettings,
      troubleTickets,
      setTroubleTickets,
      addTroubleTicket,
      updateTroubleTicket,
      deleteTroubleTicket,
      applyRebateToInvoice
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
