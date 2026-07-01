import React, { useState } from 'react';
import { runPricingEngineTests, UnitTestResult } from '../../domain/pricingEngine';
import { 
  ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, 
  HelpCircle, ShieldAlert, Award 
} from 'lucide-react';

export const SelfTestsModule: React.FC = () => {
  const [suiteResult, setSuiteResult] = useState(() => runPricingEngineTests());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRunTests = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSuiteResult(runPricingEngineTests());
      setIsRefreshing(false);
    }, 400);
  };

  const totalTests = suiteResult.results.length;
  const passedTests = suiteResult.results.filter(r => r.passed).length;
  const allGreen = passedTests === totalTests;

  return (
    <div className="space-y-6 text-xs">
      {/* Test Runner Overview Banner */}
      <div className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
        allGreen 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
          : 'bg-rose-50 border-rose-100 text-rose-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className={`w-6 h-6 ${allGreen ? 'text-emerald-600' : 'text-rose-600'}`} />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              Centralized Pricing Engine Unit Test Suite
            </h3>
          </div>
          <p className={`${allGreen ? 'text-emerald-700' : 'text-rose-700'} max-w-xl text-[11px] leading-relaxed mt-1`}>
            All financial equations, Malaysia SST 8% computation rules, GP gross margins, costing discounts, and multi-tier approval authorizations (CEO trigger) are locked. These tests run instantly in-browser.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Verification Status</span>
            <span className={`text-lg font-black font-mono ${allGreen ? 'text-emerald-600' : 'text-rose-600'}`}>
              {passedTests} / {totalTests} PASSED
            </span>
          </div>

          <button
            onClick={handleRunTests}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-3.5 rounded-lg transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Re-run Test Suite</span>
          </button>
        </div>
      </div>

      {/* Test items listed */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Active Equation Verification Cases</h4>
          <span className="text-[10px] font-bold text-gray-400 font-mono">2026-06-30T21:17:00-07:00</span>
        </div>

        <div className="divide-y divide-gray-100">
          {suiteResult.results.map((test, index) => (
            <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    test.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {test.passed ? '✓' : '✗'}
                  </span>
                  <p className="font-bold text-gray-900">{test.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-500 font-medium pl-7">
                  <p>Expected Output: <span className="font-mono text-brand-600 font-semibold">{test.expected}</span></p>
                  <p>Actual Calculated: <span className="font-mono text-emerald-600 font-semibold">{test.actual}</span></p>
                </div>
              </div>

              <div className="shrink-0 sm:text-right">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                  test.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {test.passed ? 'PASSING' : 'FAILED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Compliance Statement */}
      <div className="p-4 bg-slate-50 border border-gray-150 rounded-xl flex gap-3 text-[10px] text-gray-500 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-brand-950 uppercase tracking-widest text-[9px] mb-0.5">SST 8% & Audit Compliance Statement</p>
          <p>These unit tests verify compliance with the Malaysian Service Tax Act 2018 (SST Amendment 2024, set to 8%). Our system restricts decimal rounding issues by using fixed precision decimals (`toFixed(2)` and decimal parsing) prior to subtotal summarization. Internal pricing audits check all quotes automatically to protect reseller gross profit margins.</p>
        </div>
      </div>
    </div>
  );
};
export default SelfTestsModule;
