export type UserRole = 'sales_rep' | 'hod_sales' | 'ceo' | 'technician' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
}

export type CatalogCategory = 'line-rental' | 'internet-access' | 'fiber-package' | 'one-time' | 'equipment';
export type CatalogUnit = 'month' | 'one-time' | 'per-meter' | 'per-unit';

export interface CatalogItem {
  code: string;
  name: string;
  category: CatalogCategory;
  unit: CatalogUnit;
  unit_price: number;
  taxable: boolean;
  notes: string;
}

export type ClientStatus = 'lead' | 'quoted' | 'active' | 'suspended' | 'churned';

export interface Client {
  id: string;
  name: string;
  regNo: string;
  billingAddress: string;
  siteAddress: string;
  phone: string;
  fax?: string;
  contactPerson: string;
  contactEmail: string;
  industry: string;
  status: ClientStatus;
  accountManager: string;
  contractExpiryDate?: string;
}

export interface QuotationLineItem {
  id: string;
  itemCode: string;
  description: string;
  qty: number;
  unitPrice: number;
  isFoc: boolean;
  taxable: boolean;
  notes?: string;
}

export interface CostingLine {
  itemCode: string;
  unitCost: number;
  supplier: string;
  poRef?: string;
  discount: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface Quotation {
  id: string;
  refNo: string;
  clientId: string;
  date: string;
  title: string;
  preparedBy: string;
  items: QuotationLineItem[];
  costings: CostingLine[];
  sstRate: number; // usually 0.08 (8%)
  subtotal: number;
  sstTotal: number;
  grandTotal: number;
  status: QuotationStatus;
  validityWeeks: number;
  deliveryDays: number;
  paymentTerms: string;
  lockInMonths: number;
  hodApproved: boolean;
  ceoApproved: boolean;
  notes?: string;
  totalUnitCost: number;
  grossProfitRm: number;
  grossProfitGpPercent: number;
  requiresCeoApproval: boolean;
  dateAccepted?: string;
  emailSent?: boolean;
  emailSentDate?: string;
  nextcloudPath?: string;
}

export type JobStatus = 'pending_survey' | 'scheduled' | 'in_progress' | 'installed' | 'activated' | 'closed';

export interface SiteSurveyChecklist {
  cablingMetersUsed?: number;
  equipmentSerials?: string;
  routerAssigned?: string;
  apMeshAssigned?: string;
  completed: boolean;
  opticalPower?: string;
  fusionLoss?: string;
  latency?: string;
  measuredSpeedDown?: string;
  measuredSpeedUp?: string;
  testingInstrument?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  customerFeedback?: string;
  reportDate?: string;
  reportSigned?: boolean;
}

export interface Job {
  id: string;
  quotationId: string;
  refNo: string;
  clientId: string;
  siteAddress: string;
  serviceType: string;
  assignedTechnicians: string[];
  scheduledDate?: string;
  slaDueDate: string;
  status: JobStatus;
  surveyChecklist: SiteSurveyChecklist;
  scheduleTime?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  notes?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  difficultyLevel?: 'Standard' | 'Complex' | 'Hazardous';
}

export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue';

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxable: boolean;
  sstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  quotationId?: string;
  clientId: string;
  type: 'one-time' | 'recurring';
  date: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotal: number;
  sstTotal: number;
  grandTotal: number;
  status: InvoiceStatus;
  payments: Payment[];
  billingCycleMonth?: string; // e.g. "2026-06"
  hodApproved?: boolean;
  approvedBy?: string;
  emailSent?: boolean;
  emailSentDate?: string;
  nextcloudPath?: string;
  nextcloudReceiptPath?: string;
  receiptUploaded?: boolean;
  receiptFileName?: string;
  receiptFileUrl?: string;
  receiptUploadedAt?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
}

export interface Technician {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

export type ProjectStepKey = 'quotation' | 'po_received' | 'job_scheduled' | 'site_survey' | 'installation' | 'activation' | 'handover' | 'billing_start';

export interface ProjectStep {
  key: ProjectStepKey;
  label: string;
  status: 'pending' | 'completed' | 'active';
  date?: string;
}

export interface Project {
  id: string;
  clientId: string;
  quotationId: string;
  jobId?: string;
  steps: ProjectStep[];
  owner: string;
  currentStage: string;
  daysInStage: number;
  nextAction: string;
  lockInEndDate: string;
  atSlaRisk: boolean;
  stage: 'survey' | 'cabling' | 'noc_activation' | 'uat' | 'billing_active';
  progress: number;
  isRenewalRisk: boolean;
  contractStartDate?: string;
  contractLockInMonths?: number;
  renewalAlertDate?: string;
  actualCablingMeters?: number;
  equipmentDetails?: string;
  targetDeliveryDate?: string;
  daysElapsed?: number;
  slaLimitDays?: number;
  cycleTimes?: {
    survey?: number;
    cabling?: number;
    noc_activation?: number;
    uat?: number;
    billing_active?: number;
  };
}
