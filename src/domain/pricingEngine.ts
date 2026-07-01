import { QuotationLineItem, CostingLine } from '../types';

/**
 * Pricing Engine
 * Centralized logic for all financial, tax (SST), and costing calculations.
 */

export const DEFAULT_SST_RATE = 0.08; // 8% Malaysian Sales & Service Tax

/**
 * Calculate amount for a single line item, accounting for FOC (Free of Charge) override.
 */
export function calculateLineAmount(qty: number, unitPrice: number, isFoc: boolean): number {
  if (isFoc) return 0;
  return Number((qty * unitPrice).toFixed(2));
}

/**
 * Calculate SST amount for a single line item amount.
 */
export function calculateLineSst(amount: number, taxable: boolean, sstRate: number = DEFAULT_SST_RATE): number {
  if (!taxable) return 0;
  return Number((amount * sstRate).toFixed(2));
}

/**
 * Computes totals for an array of quotation or invoice items.
 */
export function calculateTotals(
  items: { qty: number; unitPrice: number; isFoc: boolean; taxable: boolean }[],
  sstRate: number = DEFAULT_SST_RATE
): { subtotal: number; sstTotal: number; grandTotal: number } {
  let subtotal = 0;
  let sstTotal = 0;

  items.forEach((item) => {
    const amount = calculateLineAmount(item.qty, item.unitPrice, item.isFoc);
    const sst = calculateLineSst(amount, item.taxable, sstRate);
    subtotal += amount;
    sstTotal += sst;
  });

  subtotal = Number(subtotal.toFixed(2));
  sstTotal = Number(sstTotal.toFixed(2));
  const grandTotal = Number((subtotal + sstTotal).toFixed(2));

  return { subtotal, sstTotal, grandTotal };
}

/**
 * Computes internal costing, Gross Profit (GP), GP%, and determines if HOD/CEO approvals are required.
 * Rule: CEO approval required if Grand Total > RM10,000 OR Gross Profit % < 25%.
 */
export function calculateCosting(
  items: QuotationLineItem[],
  costings: CostingLine[],
  grandTotal: number,
  sstRate: number = DEFAULT_SST_RATE
): {
  totalUnitCost: number;
  grossProfitRm: number;
  grossProfitGpPercent: number;
  requiresCeoApproval: boolean;
} {
  let totalUnitCost = 0;
  let quoteSubtotal = 0;

  items.forEach((item) => {
    const amount = calculateLineAmount(item.qty, item.unitPrice, item.isFoc);
    quoteSubtotal += amount;

    // Find costing corresponding to this item code
    const cost = costings.find((c) => c.itemCode === item.itemCode);
    if (cost) {
      const netUnitCost = Math.max(0, cost.unitCost - cost.discount);
      totalUnitCost += item.qty * netUnitCost;
    }
  });

  totalUnitCost = Number(totalUnitCost.toFixed(2));
  const grossProfitRm = Number((quoteSubtotal - totalUnitCost).toFixed(2));
  const grossProfitGpPercent = quoteSubtotal > 0 
    ? Number(((grossProfitRm / quoteSubtotal) * 100).toFixed(2)) 
    : 0;

  // CEO approval is triggered if total value > 10,000 RM OR GP% < 25% (or GP is negative)
  const requiresCeoApproval = grandTotal > 10000 || grossProfitGpPercent < 25 || grossProfitRm < 0;

  return {
    totalUnitCost,
    grossProfitRm,
    grossProfitGpPercent,
    requiresCeoApproval,
  };
}

/**
 * Simple Unit-Test Suite for verification.
 * Returns test result status and log entries.
 */
export interface UnitTestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export function runPricingEngineTests(): { passed: boolean; results: UnitTestResult[] } {
  const results: UnitTestResult[] = [];

  // Test 1: calculateLineAmount with normal item
  {
    const val = calculateLineAmount(5, 100, false);
    results.push({
      name: 'Line item amount calculation',
      passed: val === 500,
      expected: '500',
      actual: String(val),
    });
  }

  // Test 2: calculateLineAmount with FOC item
  {
    const val = calculateLineAmount(5, 100, true);
    results.push({
      name: 'Line item amount with FOC override',
      passed: val === 0,
      expected: '0',
      actual: String(val),
    });
  }

  // Test 3: calculateLineSst for taxable item (8%)
  {
    const val = calculateLineSst(250, true, 0.08);
    results.push({
      name: 'Taxable SST calculation (8%)',
      passed: val === 20,
      expected: '20',
      actual: String(val),
    });
  }

  // Test 4: calculateLineSst for SST-exempt item
  {
    const val = calculateLineSst(1190.40, false, 0.08); // e.g. refundable deposit
    results.push({
      name: 'SST-exempt calculation',
      passed: val === 0,
      expected: '0',
      actual: String(val),
    });
  }

  // Test 5: calculateTotals
  {
    const testItems = [
      { qty: 1, unitPrice: 1000, isFoc: false, taxable: true }, // sub: 1000, sst: 80
      { qty: 2, unitPrice: 300, isFoc: false, taxable: false }, // sub: 600, sst: 0
      { qty: 1, unitPrice: 500, isFoc: true, taxable: true },   // sub: 0 (FOC)
    ];
    const { subtotal, sstTotal, grandTotal } = calculateTotals(testItems, 0.08);
    const passed = subtotal === 1600 && sstTotal === 80 && grandTotal === 1680;
    results.push({
      name: 'Group totals calculation (subtotal, tax, grand total)',
      passed,
      expected: 'subtotal=1600, sst=80, grand=1680',
      actual: `subtotal=${subtotal}, sst=${sstTotal}, grand=${grandTotal}`,
    });
  }

  // Test 6: Costing calculation & CEO approval triggers
  {
    const items: QuotationLineItem[] = [
      { id: '1', itemCode: 'LL-10', description: '10Mbps', qty: 2, unitPrice: 500, isFoc: false, taxable: true }, // sub: 1000
    ];
    const costings: CostingLine[] = [
      { itemCode: 'LL-10', unitCost: 350, supplier: 'TM', discount: 50 }, // net cost: 300 * 2 = 600
    ];
    const { totalUnitCost, grossProfitRm, grossProfitGpPercent, requiresCeoApproval } = calculateCosting(items, costings, 1080);
    // GP RM = 1000 - 600 = 400
    // GP% = 400 / 1000 = 40%
    // Total <= 10000 and GP% >= 25% -> CEO Approval should be FALSE
    const passed = totalUnitCost === 600 && grossProfitRm === 400 && grossProfitGpPercent === 40 && requiresCeoApproval === false;
    results.push({
      name: 'Internal costing and standard GP% check',
      passed,
      expected: 'cost=600, gp=400, gp%=40%, ceoApproval=false',
      actual: `cost=${totalUnitCost}, gp=${grossProfitRm}, gp%=${grossProfitGpPercent}%, ceoApproval=${requiresCeoApproval}`,
    });
  }

  // Test 7: CEO approval triggered by low GP%
  {
    const items: QuotationLineItem[] = [
      { id: '1', itemCode: 'LL-10', description: '10Mbps', qty: 1, unitPrice: 500, isFoc: false, taxable: true }, // sub: 500
    ];
    const costings: CostingLine[] = [
      { itemCode: 'LL-10', unitCost: 400, supplier: 'TM', discount: 0 }, // net cost: 400. GP: 100 (20%)
    ];
    const { grossProfitGpPercent, requiresCeoApproval } = calculateCosting(items, costings, 540);
    const passed = grossProfitGpPercent === 20 && requiresCeoApproval === true;
    results.push({
      name: 'CEO approval trigger: Low GP% (< 25%)',
      passed,
      expected: 'gp%=20%, ceoApproval=true',
      actual: `gp%=${grossProfitGpPercent}%, ceoApproval=${requiresCeoApproval}`,
    });
  }

  const allPassed = results.every(r => r.passed);
  return { passed: allPassed, results };
}
