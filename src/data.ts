import { CatalogItem, Client, User, Technician, Quotation, Job, Invoice, Project } from './types';

// Seed product catalog items exactly from the instructions rate cards
export const seedCatalogItems: CatalogItem[] = [
  // A. Leased Line / PABX / ISDN monthly rentals
  {
    code: 'LL-PRI-REN',
    name: 'ISDN PRI Line Rental',
    category: 'line-rental',
    unit: 'month',
    unit_price: 1190.00,
    taxable: true,
    notes: 'Standard PRI connection for voice PABX'
  },
  {
    code: 'LL-BRI-BB',
    name: 'ISDN BRI Line Rental (Backbone)',
    category: 'line-rental',
    unit: 'month',
    unit_price: 50.00,
    taxable: true,
    notes: 'Backbone backup ISDN connectivity'
  },
  {
    code: 'LL-PABX-BRI',
    name: 'IP PABX BRI Line Rental (Backbone)',
    category: 'line-rental',
    unit: 'month',
    unit_price: 380.00,
    taxable: true,
    notes: 'IP PABX line trunk rental'
  },
  {
    code: 'LL-BACKBONE',
    name: 'Leased Line (Backbone)',
    category: 'line-rental',
    unit: 'month',
    unit_price: 200.00,
    taxable: true,
    notes: 'Corporate backbone connectivity'
  },
  {
    code: 'LL-SITA',
    name: 'SITA Line',
    category: 'line-rental',
    unit: 'month',
    unit_price: 250.00,
    taxable: true,
    notes: 'SITA network access lines'
  },
  {
    code: 'LL-PRI-BB',
    name: 'ISDN PRI Line (Backbone)',
    category: 'line-rental',
    unit: 'month',
    unit_price: 150.00,
    taxable: true,
    notes: 'ISDN PRI backbone trunk'
  },
  {
    code: 'LL-PRI-REN2',
    name: 'Leased ISDN PRI Line Rental',
    category: 'line-rental',
    unit: 'month',
    unit_price: 750.00,
    taxable: true,
    notes: 'Special rate PRI lease line'
  },
  {
    code: 'LL-F15-PO',
    name: 'First 15 Lines w/phone only',
    category: 'line-rental',
    unit: 'month',
    unit_price: 45.00,
    taxable: true,
    notes: 'Bundle for first 15 lines (phone rental only)'
  },
  {
    code: 'LL-TEL-T1',
    name: 'Telephone rental only (tier 1)',
    category: 'line-rental',
    unit: 'month',
    unit_price: 5.00,
    taxable: true,
    notes: 'Standard desk phone rental'
  },
  {
    code: 'LL-TEL-T2',
    name: 'Telephone rental only (tier 2)',
    category: 'line-rental',
    unit: 'month',
    unit_price: 8.00,
    taxable: true,
    notes: 'Executive desk phone rental'
  },
  {
    code: 'LL-DIG-T1',
    name: 'Digital Phone Model 4222(R) — tier 1',
    category: 'line-rental',
    unit: 'month',
    unit_price: 35.00,
    taxable: true,
    notes: 'High-end tier-1 digital handset lease'
  },
  {
    code: 'LL-DIG-T2',
    name: 'Digital Phone Model 4222(R) — tier 2',
    category: 'line-rental',
    unit: 'month',
    unit_price: 60.00,
    taxable: true,
    notes: 'Premium tier-2 conference desk phone lease'
  },
  {
    code: 'LL-F15-WP',
    name: 'First 15 lines w/phone',
    category: 'line-rental',
    unit: 'month',
    unit_price: 12.00,
    taxable: true,
    notes: 'Promotional bundle for starting lines'
  },
  {
    code: 'LL-N16-WP',
    name: 'Next 16–29 lines w/phone',
    category: 'line-rental',
    unit: 'month',
    unit_price: 40.00,
    taxable: true,
    notes: 'Standard business scale tier 1'
  },
  {
    code: 'LL-N16-WP2',
    name: 'Next 16–29+ lines w/phone (promo)',
    category: 'line-rental',
    unit: 'month',
    unit_price: 35.00,
    taxable: true,
    notes: 'Discounted rate for medium scale operations'
  },
  {
    code: 'LL-N30-T1',
    name: 'Next 30+ lines w/phone (tier 1)',
    category: 'line-rental',
    unit: 'month',
    unit_price: 35.00,
    taxable: true,
    notes: 'Corporate volume scale tier 1'
  },
  {
    code: 'LL-N30-T2',
    name: 'Next 30+ lines w/phone (tier 2)',
    category: 'line-rental',
    unit: 'month',
    unit_price: 35.00,
    taxable: true,
    notes: 'Corporate volume scale tier 2'
  },

  // B. Internet access monthly charges
  {
    code: 'IA-10ME',
    name: '10Mbps Dedicated Metro E',
    category: 'internet-access',
    unit: 'month',
    unit_price: 500.00,
    taxable: true,
    notes: 'Guaranteed symmetrical fiber bandwidth with SLA'
  },
  {
    code: 'IA-1000B',
    name: 'Broadband 1000Mbps',
    category: 'internet-access',
    unit: 'month',
    unit_price: 2080.00,
    taxable: true,
    notes: 'Ultra-high speed gigabit business broadband'
  },
  {
    code: 'IA-500BP',
    name: 'Broadband 500Mbps (promo yearly)',
    category: 'internet-access',
    unit: 'month',
    unit_price: 1456.00,
    taxable: true,
    notes: 'Yearly commitment promotion rate'
  },
  {
    code: 'IA-500B',
    name: 'Broadband 500Mbps',
    category: 'internet-access',
    unit: 'month',
    unit_price: 1280.00,
    taxable: true,
    notes: 'Standard business broadband 500Mbps'
  },
  {
    code: 'IA-300A',
    name: 'Broadband 300Mbps (option A)',
    category: 'internet-access',
    unit: 'month',
    unit_price: 930.00,
    taxable: true,
    notes: 'Option A with standard premium router lease'
  },
  {
    code: 'IA-300B',
    name: 'Broadband 300Mbps (option B)',
    category: 'internet-access',
    unit: 'month',
    unit_price: 930.00,
    taxable: true,
    notes: 'Option B with dual redundancy backup WAN'
  },
  {
    code: 'IA-100BIP',
    name: 'Broadband 100Mbps + Fixed IP x1',
    category: 'internet-access',
    unit: 'month',
    unit_price: 300.00,
    taxable: true,
    notes: 'Starter pack with single fixed IP included'
  },
  {
    code: 'IA-100B',
    name: 'Broadband 100Mbps',
    category: 'internet-access',
    unit: 'month',
    unit_price: 398.00,
    taxable: true,
    notes: 'Basic corporate high-speed fiber broadband'
  },
  {
    code: 'IA-FIP1',
    name: 'Fixed IP (1 IP)',
    category: 'internet-access',
    unit: 'month',
    unit_price: 300.00,
    taxable: true,
    notes: 'Additional Static Public IP add-on'
  },
  {
    code: 'IA-FIPS',
    name: '2nd and subsequent Fixed IP',
    category: 'internet-access',
    unit: 'month',
    unit_price: 250.00,
    taxable: true,
    notes: 'Static IP block additional items'
  },
  {
    code: 'IA-ROUTER',
    name: 'Router rental',
    category: 'internet-access',
    unit: 'month',
    unit_price: 30.00,
    taxable: true,
    notes: 'Leased corporate router'
  },
  {
    code: 'IA-AUTH',
    name: 'Authorization Code Add-on',
    category: 'internet-access',
    unit: 'month',
    unit_price: 2.00,
    taxable: true,
    notes: 'Security auth protocol code per line'
  },
  {
    code: 'IA-ITEM',
    name: 'Itemized Billing service',
    category: 'internet-access',
    unit: 'month',
    unit_price: 6.00,
    taxable: true,
    notes: 'Detailed tiered usage billing statements'
  },

  // C. GPON Fiber packages (with high deposits)
  {
    code: 'GF-100M',
    name: 'GPON Fiber 100Mbps (incl. Deposit)',
    category: 'fiber-package',
    unit: 'month',
    unit_price: 398.00,
    taxable: true,
    notes: 'Requires Refundable Deposit of RM1,190.40 (3mo upfront)'
  },
  {
    code: 'GF-300M',
    name: 'GPON Fiber 300Mbps (incl. Deposit)',
    category: 'fiber-package',
    unit: 'month',
    unit_price: 998.00,
    taxable: true,
    notes: 'Requires Refundable Deposit of RM2,985.00 (3mo upfront)'
  },
  {
    code: 'GF-500M',
    name: 'GPON Fiber 500Mbps (incl. Deposit)',
    category: 'fiber-package',
    unit: 'month',
    unit_price: 1200.00,
    taxable: true,
    notes: 'Requires Refundable Deposit of RM3,600.00 (3mo upfront)'
  },
  {
    code: 'GF-1G',
    name: 'GPON Fiber 1Gbps (incl. Deposit)',
    category: 'fiber-package',
    unit: 'month',
    unit_price: 2040.00,
    taxable: true,
    notes: 'Requires Refundable Deposit of RM6,120.00 (3mo upfront)'
  },

  // D. One-time / equipment charges
  {
    code: 'OTC-ACT',
    name: 'Activation & GPON router install',
    category: 'one-time',
    unit: 'one-time',
    unit_price: 350.00,
    taxable: true,
    notes: 'Standard engineer activation on-site'
  },
  {
    code: 'EQ-WF6R',
    name: 'WiFi 6 Router',
    category: 'equipment',
    unit: 'per-unit',
    unit_price: 0.00,
    taxable: false,
    notes: 'FOC Included in basic broadband contract'
  },
  {
    code: 'EQ-MESH',
    name: 'AP Mesh WiFi 6',
    category: 'equipment',
    unit: 'per-unit',
    unit_price: 0.00,
    taxable: false,
    notes: 'FOC Included with high speed broadband tiers'
  },
  {
    code: 'EQ-PATCH',
    name: 'Patch cord UTP CAT6, 3m/unit',
    category: 'equipment',
    unit: 'per-unit',
    unit_price: 50.00,
    taxable: true,
    notes: 'High-shielding patch cord for indoor PABX routing'
  },
  {
    code: 'OTC-CABLING',
    name: 'New fiber cabling (per meter)',
    category: 'one-time',
    unit: 'per-meter',
    unit_price: 20.00,
    taxable: true,
    notes: 'Outdoor/indoor fiber drop cabling execution'
  }
];

// Associated Deposits mapping for GPON fiber packages
export const depositRates: Record<string, number> = {
  'GF-100M': 1190.40,
  'GF-300M': 2985.00,
  'GF-500M': 3600.00,
  'GF-1G': 6120.00,
};

// Seed Clients database
export const seedClients: Client[] = [
  {
    id: 'C-001',
    name: 'Petronas Digital Sdn Bhd',
    regNo: '199801014529 (465652-X)',
    billingAddress: 'Level 52, Tower 1, Petronas Twin Towers, KLCC, 50088 Kuala Lumpur',
    siteAddress: 'Petronas Digital Hub, Level 12, Menara ExxonMobil, KLCC, 50088 Kuala Lumpur',
    phone: '+60 3-2331 5000',
    fax: '+60 3-2331 4000',
    contactPerson: 'Zulkipli Rahim',
    contactEmail: 'zulkipli.rahim@petronas.com.my',
    industry: 'Oil & Gas / Digital Infrastructure',
    status: 'active',
    accountManager: 'Sarah Tan',
    contractExpiryDate: '2028-06-30'
  },
  {
    id: 'C-002',
    name: 'Sime Darby Plantation Berhad',
    regNo: '200401032341 (669042-M)',
    billingAddress: 'Main Block, Plantation Tower, No. 2, Jalan PJU 1A/7, Ara Damansara, 47301 Petaling Jaya, Selangor',
    siteAddress: 'Sime Darby Research Centre, KM 10, Jalan Banting-Dengkil, 42700 Banting, Selangor',
    phone: '+60 3-7848 4000',
    contactPerson: 'Melissa Wong',
    contactEmail: 'melissa.wong@simedarbyplantation.com',
    industry: 'Agriculture / Agritech',
    status: 'quoted',
    accountManager: 'Sarah Tan',
    contractExpiryDate: '2026-07-15'
  },
  {
    id: 'C-003',
    name: 'Maybank HQ (Menara Maybank)',
    regNo: '196001000142 (3813-K)',
    billingAddress: '100, Jalan Tun Perak, Bukit Bintang, 50050 Kuala Lumpur',
    siteAddress: 'Maybank Data Centre, Cyberjaya Tech Park, 63000 Cyberjaya, Selangor',
    phone: '+60 3-2070 8833',
    fax: '+60 3-2070 2211',
    contactPerson: 'Anwar Ibrahim',
    contactEmail: 'anwar.ibrahim@maybank.com.my',
    industry: 'Financial Services / Banking',
    status: 'active',
    accountManager: 'Sarah Tan',
    contractExpiryDate: '2027-12-31'
  },
  {
    id: 'C-004',
    name: 'Tenaga Nasional Berhad (TNB)',
    regNo: '199001009717 (200866-W)',
    billingAddress: 'No. 129, Jalan Bangsar, 59200 Kuala Lumpur',
    siteAddress: 'TNB Regional Substation Office, 43000 Kajang, Selangor',
    phone: '+60 3-2296 5566',
    contactPerson: 'Siti Aminah',
    contactEmail: 'siti.aminah@tnb.com.my',
    industry: 'Utilities / Power',
    status: 'lead',
    accountManager: 'Sarah Tan'
  },
  {
    id: 'C-005',
    name: 'Top Glove Corporation Bhd',
    regNo: '199801018291 (471194-V)',
    billingAddress: 'Lot 1389, Jalan Teratai, Batu 5, Off Jalan Meru, 41050 Klang, Selangor',
    siteAddress: 'Top Glove Factory 25, Lot 4010, Jalan Haji Abdul Manan, 42200 Kapar, Selangor',
    phone: '+60 3-3392 1992',
    fax: '+60 3-3392 1291',
    contactPerson: 'Mr. Lim Chee Wei',
    contactEmail: 'cwlim@topglove.com.my',
    industry: 'Manufacturing',
    status: 'churned',
    accountManager: 'Sarah Tan',
    contractExpiryDate: '2026-02-15'
  }
];

// Seed Users representing roles
export const seedUsers: User[] = [
  { id: 'U-01', name: 'Sarah Tan', role: 'sales_rep', email: 'demo@pois-integrator.com.my', password: 'demo123' },
  { id: 'U-02', name: 'Keith Lim', role: 'hod_sales', email: 'keith.lim@pois-integrator.com.my', password: 'demo123' },
  { id: 'U-03', name: 'Dr. Azman Ismail', role: 'ceo', email: 'azman.ismail@pois-integrator.com.my', password: 'demo123' },
  { id: 'U-04', name: 'Nizam Razak', role: 'technician', email: 'nizam.r@pois-integrator.com.my', password: 'demo123' },
  { id: 'U-05', name: 'Sys Admin', role: 'admin', email: 'admin@pois-integrator.com.my', password: 'admin123' }
];

export const seedTechnicians: Technician[] = [
  { id: 'TECH-01', name: 'Nizam Razak', status: 'active' },
  { id: 'TECH-02', name: 'Haris Lee', status: 'active' },
  { id: 'TECH-03', name: 'Vignesh Nair', status: 'active' }
];

// Seed standard Quotations
export const seedQuotations: Quotation[] = [
  {
    id: 'Q-1001',
    refNo: 'POIS/2026/QT-1001',
    clientId: 'C-001',
    date: '2026-06-15',
    title: 'High-Speed Dedicated Internet Access Bundle',
    preparedBy: 'Sarah Tan',
    items: [
      {
        id: 'QLI-01',
        itemCode: 'GF-1G',
        description: 'GPON Fiber 1Gbps Dedicated Internet Connection',
        qty: 1,
        unitPrice: 2040.00,
        isFoc: false,
        taxable: true
      },
      {
        id: 'QLI-02',
        itemCode: 'OTC-ACT',
        description: 'Activation & GPON Fiber Router Installation (OTC)',
        qty: 1,
        unitPrice: 350.00,
        isFoc: false,
        taxable: true
      },
      {
        id: 'QLI-03',
        itemCode: 'EQ-WF6R',
        description: 'Premium WiFi 6 Enterprise Gateway Router',
        qty: 1,
        unitPrice: 0.00,
        isFoc: true,
        taxable: false
      },
      {
        id: 'QLI-04',
        itemCode: 'OTC-CABLING',
        description: 'New Fiber Drop-cable routing to server rack',
        qty: 45, // 45 meters
        unitPrice: 20.00,
        isFoc: false,
        taxable: true
      }
    ],
    costings: [
      { itemCode: 'GF-1G', unitCost: 1200.00, supplier: 'Telekom Malaysia', discount: 100 }, // Net: 1100
      { itemCode: 'OTC-ACT', unitCost: 150.00, supplier: 'Subcon Infratech', discount: 0 },   // Net: 150
      { itemCode: 'OTC-CABLING', unitCost: 8.00, supplier: 'Cabling Corp', discount: 0 }      // Net: 8 * 45 = 360
    ],
    sstRate: 0.08,
    subtotal: 3290.00, // 2040 + 350 + 900
    sstTotal: 263.20,  // 3290 * 0.08
    grandTotal: 3553.20,
    status: 'accepted',
    validityWeeks: 2,
    deliveryDays: 14,
    paymentTerms: 'Refundable Deposit on PO + remaining balance upon delivery/activation',
    lockInMonths: 24,
    hodApproved: true,
    ceoApproved: true,
    totalUnitCost: 1610.00, // 1100 + 150 + 360
    grossProfitRm: 1680.00, // 3290 - 1610
    grossProfitGpPercent: 51.06,
    requiresCeoApproval: false, // total GP is > 25%, but since it is under 10k it passed CEO easily. Both signed.
    dateAccepted: '2026-06-18',
    notes: 'Approved Petronas corporate scale infrastructure bundle.'
  },
  {
    id: 'Q-1002',
    refNo: 'POIS/2026/QT-1002',
    clientId: 'C-002',
    date: '2026-06-25',
    title: 'Sime Darby Office IP PABX & Backup Line trunking',
    preparedBy: 'Sarah Tan',
    items: [
      {
        id: 'QLI-05',
        itemCode: 'LL-PRI-REN',
        description: 'ISDN PRI Line Trunk Rental (Voice)',
        qty: 1,
        unitPrice: 1190.00,
        isFoc: false,
        taxable: true
      },
      {
        id: 'QLI-06',
        itemCode: 'LL-DIG-T1',
        description: 'Digital Desk Phone Model 4222(R) Tier-1 Handsets',
        qty: 12,
        unitPrice: 35.00,
        isFoc: false,
        taxable: true
      },
      {
        id: 'QLI-07',
        itemCode: 'EQ-PATCH',
        description: 'CAT6 UTP Patch Cord 3m (Server connectivity)',
        qty: 15,
        unitPrice: 50.00,
        isFoc: false,
        taxable: true
      }
    ],
    costings: [
      { itemCode: 'LL-PRI-REN', unitCost: 850.00, supplier: 'Maxis', discount: 50 }, // Net: 800
      { itemCode: 'LL-DIG-T1', unitCost: 20.00, supplier: 'Ericsson Distributor', discount: 0 }, // Net: 240
      { itemCode: 'EQ-PATCH', unitCost: 15.00, supplier: 'Cabling Corp', discount: 0 } // Net: 225
    ],
    sstRate: 0.08,
    subtotal: 2360.00, // 1190 + 420 + 750
    sstTotal: 188.80,
    grandTotal: 2548.80,
    status: 'sent',
    validityWeeks: 2,
    deliveryDays: 30,
    paymentTerms: 'Deposit 100% of first month rental on PO',
    lockInMonths: 24,
    hodApproved: true,
    ceoApproved: false, // still waiting or not strictly triggered (GP: 46.4%)
    totalUnitCost: 1265.00,
    grossProfitRm: 1095.00,
    grossProfitGpPercent: 46.40,
    requiresCeoApproval: false
  },
  {
    id: 'Q-1003',
    refNo: 'POIS/2026/QT-1003',
    clientId: 'C-004',
    date: '2026-06-28',
    title: 'High-capacity 500Mbps Broadband Provisioning',
    preparedBy: 'Sarah Tan',
    items: [
      {
        id: 'QLI-08',
        itemCode: 'GF-500M',
        description: 'GPON Fiber Broadband 500Mbps Line Lease',
        qty: 1,
        unitPrice: 1200.00,
        isFoc: false,
        taxable: true
      },
      {
        id: 'QLI-09',
        itemCode: 'OTC-ACT',
        description: 'Activation fee & setup charges',
        qty: 1,
        unitPrice: 350.00,
        isFoc: false,
        taxable: true
      }
    ],
    costings: [
      { itemCode: 'GF-500M', unitCost: 1100.00, supplier: 'TM', discount: 0 }, // net 1100. GP is low! (sub: 1200, cost: 1100. GP is 8.33%)
      { itemCode: 'OTC-ACT', unitCost: 150.00, supplier: 'Self', discount: 0 }
    ],
    sstRate: 0.08,
    subtotal: 1550.00,
    sstTotal: 124.00,
    grandTotal: 1674.00,
    status: 'draft',
    validityWeeks: 2,
    deliveryDays: 14,
    paymentTerms: 'Deposit 3mo upfront on PO',
    lockInMonths: 24,
    hodApproved: false,
    ceoApproved: false,
    totalUnitCost: 1250.00,
    grossProfitRm: 300.00,
    grossProfitGpPercent: 19.35, // Below 25%! Requires CEO Approval block.
    requiresCeoApproval: true
  }
];

// Seed Jobs corresponding to accepted Quotation 1001
export const seedJobs: Job[] = [
  {
    id: 'JOB-2001',
    quotationId: 'Q-1001',
    refNo: 'POIS/JOB/2026-2001',
    clientId: 'C-001',
    siteAddress: 'Petronas Digital Hub, Level 12, Menara ExxonMobil, KLCC, 50088 Kuala Lumpur',
    serviceType: 'GPON Fiber 1Gbps Installation',
    assignedTechnicians: ['Nizam Razak', 'Haris Lee'],
    scheduledDate: '2026-07-05',
    slaDueDate: '2026-07-16', // 28 working days from PO June 18
    status: 'scheduled',
    surveyChecklist: {
      completed: false
    }
  }
];

// Seed Invoices (One-time and monthly)
export const seedInvoices: Invoice[] = [
  {
    id: 'INV-3001',
    quotationId: 'Q-1001',
    clientId: 'C-001',
    type: 'one-time',
    date: '2026-06-19',
    dueDate: '2026-07-19',
    items: [
      {
        id: 'ILI-01',
        description: 'GPON Fiber Refundable Security Deposit (3mo upfront - Tax Exempt)',
        qty: 1,
        unitPrice: 6120.00,
        taxable: false,
        sstAmount: 0.00,
        totalAmount: 6120.00
      },
      {
        id: 'ILI-02',
        description: 'New Fiber Cabling drop connection charges (Estimated 45 meters)',
        qty: 45,
        unitPrice: 20.00,
        taxable: true,
        sstAmount: 72.00, // 45 * 20 * 0.08
        totalAmount: 972.00
      },
      {
        id: 'ILI-03',
        description: 'Activation & GPON Router setup engineering service charges',
        qty: 1,
        unitPrice: 350.00,
        taxable: true,
        sstAmount: 28.00,
        totalAmount: 378.00
      }
    ],
    subtotal: 7370.00, // 6120 + 900 + 350
    sstTotal: 100.00, // only cabling & activation taxable -> (900+350)*0.08 = 100
    grandTotal: 7470.00,
    status: 'paid',
    payments: [
      {
        id: 'PAY-4001',
        invoiceId: 'INV-3001',
        amount: 7470.00,
        date: '2026-06-20',
        method: 'Telegraphic Transfer',
        reference: 'MBB-TT-89302194'
      }
    ]
  }
];

// Seed Projects
export const seedProjects: Project[] = [
  {
    id: 'PRJ-5001',
    clientId: 'C-001',
    quotationId: 'Q-1001',
    jobId: 'JOB-2001',
    steps: [
      { key: 'quotation', label: 'Quotation Approved', status: 'completed', date: '2026-06-18' },
      { key: 'po_received', label: 'PO Received & Deposit Invoice Issued', status: 'completed', date: '2026-06-19' },
      { key: 'job_scheduled', label: 'Installation Work Order Scheduled', status: 'completed', date: '2026-06-25' },
      { key: 'site_survey', label: 'Site Survey & Rack Assessment', status: 'completed', date: '2026-06-28' },
      { key: 'installation', label: 'Fiber Splicing & Cabling Execution', status: 'active', date: '2026-06-29' },
      { key: 'activation', label: 'ISP Backbone Activation & ping-test', status: 'pending' },
      { key: 'handover', label: 'Customer Acceptance Handover Signed', status: 'pending' },
      { key: 'billing_start', label: 'Monthly Recurring Billing Commenced', status: 'pending' }
    ],
    owner: 'Sarah Tan',
    currentStage: 'Cabling Trunking',
    daysInStage: 2,
    nextAction: 'Complete core splicing at local DP box (target completion July 2nd)',
    lockInEndDate: '2028-06-30',
    atSlaRisk: false,
    stage: 'cabling',
    progress: 40,
    isRenewalRisk: false,
    targetDeliveryDate: '2026-07-15',
    daysElapsed: 12,
    slaLimitDays: 25,
    actualCablingMeters: 85,
    equipmentDetails: 'Pending NOC Handover',
    cycleTimes: {
      survey: 3,
      cabling: 2
    }
  },
  {
    id: 'PRJ-5002',
    clientId: 'C-003',
    quotationId: 'Q-1003',
    steps: [
      { key: 'quotation', label: 'Quotation Approved', status: 'completed', date: '2026-06-15' },
      { key: 'po_received', label: 'PO Received & Deposit Invoice Issued', status: 'completed', date: '2026-06-16' },
      { key: 'job_scheduled', label: 'Installation Work Order Scheduled', status: 'completed', date: '2026-06-17' },
      { key: 'site_survey', label: 'Site Survey & Rack Assessment', status: 'completed', date: '2026-06-20' },
      { key: 'installation', label: 'Fiber Splicing & Cabling Execution', status: 'completed', date: '2026-06-25' },
      { key: 'activation', label: 'ISP Backbone Activation & ping-test', status: 'active', date: '2026-06-28' },
      { key: 'handover', label: 'Customer Acceptance Handover Signed', status: 'pending' },
      { key: 'billing_start', label: 'Monthly Recurring Billing Commenced', status: 'pending' }
    ],
    owner: 'Sarah Tan',
    currentStage: 'NOC Routing',
    daysInStage: 3,
    nextAction: 'NOC IP core routing alignment and route ping verification',
    lockInEndDate: '2028-06-30',
    atSlaRisk: false,
    stage: 'noc_activation',
    progress: 75,
    isRenewalRisk: false,
    targetDeliveryDate: '2026-07-05',
    daysElapsed: 15,
    slaLimitDays: 20,
    actualCablingMeters: 140,
    equipmentDetails: 'Nokia 7750 SR-1e Router, Fiber Transceiver 10G',
    cycleTimes: {
      survey: 3,
      cabling: 5,
      noc_activation: 3
    }
  },
  {
    id: 'PRJ-5003',
    clientId: 'C-002',
    quotationId: 'Q-1002',
    steps: [
      { key: 'quotation', label: 'Quotation Approved', status: 'completed', date: '2026-06-10' },
      { key: 'po_received', label: 'PO Received & Deposit Invoice Issued', status: 'completed', date: '2026-06-12' },
      { key: 'job_scheduled', label: 'Installation Work Order Scheduled', status: 'active', date: '2026-06-25' },
      { key: 'site_survey', label: 'Site Survey & Rack Assessment', status: 'pending' },
      { key: 'installation', label: 'Fiber Splicing & Cabling Execution', status: 'pending' },
      { key: 'activation', label: 'ISP Backbone Activation & ping-test', status: 'pending' },
      { key: 'handover', label: 'Customer Acceptance Handover Signed', status: 'pending' },
      { key: 'billing_start', label: 'Monthly Recurring Billing Commenced', status: 'pending' }
    ],
    owner: 'Sarah Tan',
    currentStage: 'Site Survey Pending (Delayed)',
    daysInStage: 18,
    nextAction: 'Escalate to Telekom Malaysia for DP box access keys approval',
    lockInEndDate: '2028-06-30',
    atSlaRisk: true,
    stage: 'survey',
    progress: 15,
    isRenewalRisk: true, // Marked as risk due to delay
    targetDeliveryDate: '2026-07-02',
    daysElapsed: 18,
    slaLimitDays: 20,
    actualCablingMeters: 0,
    equipmentDetails: 'Pending site access clearance',
    cycleTimes: {
      survey: 18
    }
  },
  {
    id: 'PRJ-5004',
    clientId: 'C-005',
    quotationId: 'Q-1004',
    steps: [
      { key: 'quotation', label: 'Quotation Approved', status: 'completed', date: '2026-05-10' },
      { key: 'po_received', label: 'PO Received & Deposit Invoice Issued', status: 'completed', date: '2026-05-12' },
      { key: 'job_scheduled', label: 'Installation Work Order Scheduled', status: 'completed', date: '2026-05-15' },
      { key: 'site_survey', label: 'Site Survey & Rack Assessment', status: 'completed', date: '2026-05-18' },
      { key: 'installation', label: 'Fiber Splicing & Cabling Execution', status: 'completed', date: '2026-05-24' },
      { key: 'activation', label: 'ISP Backbone Activation & ping-test', status: 'completed', date: '2026-05-27' },
      { key: 'handover', label: 'Customer Acceptance Handover Signed', status: 'completed', date: '2026-05-29' },
      { key: 'billing_start', label: 'Monthly Recurring Billing Commenced', status: 'completed', date: '2026-06-01' }
    ],
    owner: 'Sarah Tan',
    currentStage: 'Active Lease',
    daysInStage: 30,
    nextAction: 'Automated monthly recurring billing active',
    lockInEndDate: '2028-05-31',
    atSlaRisk: false,
    stage: 'billing_active',
    progress: 100,
    isRenewalRisk: false,
    targetDeliveryDate: '2026-06-10',
    daysElapsed: 20,
    slaLimitDays: 30,
    contractStartDate: '2026-06-01',
    contractLockInMonths: 24,
    renewalAlertDate: '2028-03-01',
    actualCablingMeters: 230,
    equipmentDetails: 'Juniper SRX300, 24-Core OS2 Singlemode Fiber Cabling',
    cycleTimes: {
      survey: 3,
      cabling: 6,
      noc_activation: 3,
      uat: 2,
      billing_active: 30
    }
  }
];

/**
 * Loads data from localStorage, falling back to seed data if not present.
 */
export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading key: ' + key, e);
  }
  return fallback;
}

/**
 * Persists data to localStorage.
 */
export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving key: ' + key, e);
  }
}

/**
 * Initialize all state files with seed values
 */
export function initializeAppState() {
  if (!localStorage.getItem('pois_catalog')) setStoredData('pois_catalog', seedCatalogItems);
  if (!localStorage.getItem('pois_clients')) setStoredData('pois_clients', seedClients);
  if (!localStorage.getItem('pois_quotations')) setStoredData('pois_quotations', seedQuotations);
  if (!localStorage.getItem('pois_jobs')) setStoredData('pois_jobs', seedJobs);
  if (!localStorage.getItem('pois_invoices')) setStoredData('pois_invoices', seedInvoices);
  if (!localStorage.getItem('pois_projects')) setStoredData('pois_projects', seedProjects);
  if (!localStorage.getItem('pois_users')) setStoredData('pois_users', seedUsers);
  if (!localStorage.getItem('pois_currentUser')) setStoredData('pois_currentUser', seedUsers[0]); // Default: Sarah Tan (Sales Rep)
}
