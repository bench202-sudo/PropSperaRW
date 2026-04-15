import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalculatorIcon, ChevronDownIcon, InfoIcon, TrashIcon } from '@/components/icons/Icons';
import { useLanguage } from '@/contexts/AuthContext';
 
interface MortgageCalculatorProps {
  propertyId: string;
  propertyPrice: number;
  propertyTitle: string;
  currency?: string;
}
 
interface MortgageSettings {
  price: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
}
 
interface AmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  totalPrincipal: number;
  totalInterest: number;
}
 
interface SavedComparison {
  propertyId: string;
  propertyTitle: string;
  settings: MortgageSettings;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  savedAt: string;
}
 
const STORAGE_KEY_PREFIX = 'mortgage_settings_';
const COMPARISONS_KEY = 'mortgage_saved_comparisons';
 
const getSavedSettings = (propertyId: string): MortgageSettings | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${propertyId}`);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};
 
const saveSettingsToStorage = (propertyId: string, settings: MortgageSettings) => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${propertyId}`, JSON.stringify(settings));
  } catch { /* ignore */ }
};
 
const getSavedComparisons = (): SavedComparison[] => {
  try {
    const stored = localStorage.getItem(COMPARISONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};
 
const saveComparisonToStorage = (comparison: SavedComparison) => {
  try {
    const existing = getSavedComparisons();
    const filtered = existing.filter(c => c.propertyId !== comparison.propertyId);
    filtered.unshift(comparison);
    localStorage.setItem(COMPARISONS_KEY, JSON.stringify(filtered.slice(0, 10)));
  } catch { /* ignore */ }
};
 
const removeComparisonFromStorage = (propertyId: string) => {
  try {
    const existing = getSavedComparisons();
    const filtered = existing.filter(c => c.propertyId !== propertyId);
    localStorage.setItem(COMPARISONS_KEY, JSON.stringify(filtered));
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${propertyId}`);
  } catch { /* ignore */ }
};
 
// SVG Donut Pie Chart
const PieChart: React.FC<{ principal: number; interest: number; monthlyPayment: number; currency: string; principalLabel: string; interestLabel: string }> = 
  ({ principal, interest, monthlyPayment, currency, principalLabel, interestLabel }) => {
  const total = principal + interest;
  if (total === 0) return null;
  
  const principalPercent = (principal / total) * 100;
  const interestPercent = (interest / total) * 100;
  const principalAngle = (principal / total) * 360;
  const r = 80;
  const cx = 100;
  const cy = 100;
  
  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  
  const start = polarToCartesian(0);
  const end = polarToCartesian(principalAngle);
  const largeArc = principalAngle > 180 ? 1 : 0;
  
  const principalPath = principalAngle >= 359.9
    ? `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.01},${cy - r} Z`
    : `M ${cx},${cy} L ${start.x},${start.y} A ${r},${r} 0 ${largeArc},1 ${end.x},${end.y} Z`;
  
  const interestStartPt = polarToCartesian(principalAngle);
  const interestEndPt = polarToCartesian(359.99);
  const interestLargeArc = (360 - principalAngle) > 180 ? 1 : 0;
  
  const interestPath = interestPercent <= 0.1
    ? ''
    : `M ${cx},${cy} L ${interestStartPt.x},${interestStartPt.y} A ${r},${r} 0 ${interestLargeArc},1 ${interestEndPt.x},${interestEndPt.y} Z`;
 
  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-lg">
        <circle cx={cx} cy={cy} r={r} fill="#e5e7eb" />
        {interestPath && <path d={interestPath} fill="#f97316" className="transition-all duration-500" />}
        <path d={principalPath} fill="#3b82f6" className="transition-all duration-500" />
        <circle cx={cx} cy={cy} r={50} fill="white" />
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-400" style={{ fontSize: '10px' }}>Monthly</text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-gray-900 font-bold" style={{ fontSize: '13px' }}>
          {formatCompact(monthlyPayment)}
        </text>
        <text x={cx} y={cy + 24} textAnchor="middle" className="fill-gray-400" style={{ fontSize: '9px' }}>{currency}</text>
      </svg>
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <div>
            <p className="text-xs text-gray-500">{principalLabel}</p>
            <p className="text-sm font-semibold text-gray-900">{principalPercent.toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <div>
            <p className="text-xs text-gray-500">{interestLabel}</p>
            <p className="text-sm font-semibold text-gray-900">{interestPercent.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
 
const formatCompact = (value: number): string => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toFixed(0);
};
 
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(value);
};
 
const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  propertyId,
  propertyPrice,
  propertyTitle,
  currency = 'RWF',
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);
  const [showComparisons, setShowComparisons] = useState(false);
  const [amortizationView, setAmortizationView] = useState<'monthly' | 'yearly'>('yearly');
  const [savedNotice, setSavedNotice] = useState(false);
  
  const savedSettings = getSavedSettings(propertyId);
  
  const [price, setPrice] = useState(savedSettings?.price || propertyPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(savedSettings?.downPaymentPercent || 20);
  const [interestRate, setInterestRate] = useState(savedSettings?.interestRate || 16);
  const [loanTermYears, setLoanTermYears] = useState(savedSettings?.loanTermYears || 20);
  const [comparisons, setComparisons] = useState<SavedComparison[]>(getSavedComparisons());
 
  // Core calculations
  const calculations = useMemo(() => {
    const downPayment = price * (downPaymentPercent / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;
    
    if (loanAmount <= 0 || monthlyRate <= 0 || totalMonths <= 0) {
      return { downPayment, loanAmount: Math.max(0, loanAmount), monthlyPayment: 0, totalPayment: 0, totalInterest: 0, totalPrincipal: Math.max(0, loanAmount) };
    }
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - loanAmount;
    
    return { downPayment, loanAmount, monthlyPayment, totalPayment, totalInterest, totalPrincipal: loanAmount };
  }, [price, downPaymentPercent, interestRate, loanTermYears]);
 
  // Amortization schedule
  const amortizationSchedule = useMemo((): AmortizationRow[] => {
    const { loanAmount, monthlyPayment } = calculations;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;
    if (loanAmount <= 0 || monthlyRate <= 0 || totalMonths <= 0) return [];
    
    const schedule: AmortizationRow[] = [];
    let balance = loanAmount;
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    
    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = Math.max(0, balance - principalPayment);
      totalPrincipalPaid += principalPayment;
      totalInterestPaid += interestPayment;
      schedule.push({ month, year: Math.ceil(month / 12), payment: monthlyPayment, principal: principalPayment, interest: interestPayment, balance, totalPrincipal: totalPrincipalPaid, totalInterest: totalInterestPaid });
    }
    return schedule;
  }, [calculations, interestRate, loanTermYears]);
 
  // Yearly summary
  const yearlySummary = useMemo(() => {
    const years: { year: number; principal: number; interest: number; balance: number; totalPaid: number }[] = [];
    for (let y = 1; y <= loanTermYears; y++) {
      const yearRows = amortizationSchedule.filter(r => r.year === y);
      if (yearRows.length === 0) continue;
      years.push({
        year: y,
        principal: yearRows.reduce((s, r) => s + r.principal, 0),
        interest: yearRows.reduce((s, r) => s + r.interest, 0),
        balance: yearRows[yearRows.length - 1].balance,
        totalPaid: yearRows.reduce((s, r) => s + r.payment, 0),
      });
    }
    return years;
  }, [amortizationSchedule, loanTermYears]);
 
  // Auto-save settings
  useEffect(() => {
    saveSettingsToStorage(propertyId, { price, downPaymentPercent, interestRate, loanTermYears });
  }, [propertyId, price, downPaymentPercent, interestRate, loanTermYears]);
 
  const handleSaveComparison = useCallback(() => {
    saveComparisonToStorage({
      propertyId, propertyTitle,
      settings: { price, downPaymentPercent, interestRate, loanTermYears },
      monthlyPayment: calculations.monthlyPayment,
      totalInterest: calculations.totalInterest,
      totalCost: calculations.totalPayment + calculations.downPayment,
      savedAt: new Date().toISOString(),
    });
    setComparisons(getSavedComparisons());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  }, [propertyId, propertyTitle, price, downPaymentPercent, interestRate, loanTermYears, calculations]);
 
  const handleRemoveComparison = (pid: string) => {
    removeComparisonFromStorage(pid);
    setComparisons(getSavedComparisons());
  };
 
  const loanTermPresets = [10, 15, 20, 25, 30];
 
  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl px-4 py-3.5 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <CalculatorIcon size={20} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">{t('mortgageCalculator')}</h3>
            <p className="text-xs text-gray-500">
              Est. {formatNumber(calculations.monthlyPayment)} {currency}{t('mcMonthly')}
            </p>
          </div>
        </div>
        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDownIcon size={20} className="text-gray-500" />
        </div>
      </button>
 
      {/* Calculator Panel */}
      {isExpanded && (
        <div className="mt-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5">
            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Property Price */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('mcPropertyPrice')} ({currency})</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
 
              {/* Down Payment */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('mcDownPayment')} ({downPaymentPercent}%)</label>
                <input
                  type="range" min={0} max={90} step={1}
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-gray-400">0%</span>
                  <span className="text-xs font-semibold text-blue-600">{formatNumber(price * downPaymentPercent / 100)} {currency}</span>
                  <span className="text-[10px] text-gray-400">90%</span>
                </div>
              </div>
 
              {/* Interest Rate */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('mcAnnualRate')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0.1, Math.min(50, Number(e.target.value))))}
                    step={0.1} min={0.1} max={50}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <span className="text-sm text-gray-500 font-medium">%</span>
                </div>
              </div>
 
              {/* Loan Term */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('mcLoanTerm')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {loanTermPresets.map((term) => (
                    <button
                      key={term}
                      onClick={() => setLoanTermYears(term)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        loanTermYears === term ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {term}{t('yearsLabel')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
 
            {/* Results Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 mb-5 border border-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">{t('mcMonthlyPayment')}</p>
                  <p className="text-lg font-bold text-blue-600">{formatNumber(calculations.monthlyPayment)}</p>
                  <p className="text-[10px] text-gray-400">{currency}{t('mcMonthly')}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">{t('mcTotalInterest')}</p>
                  <p className="text-lg font-bold text-orange-600">{formatCompact(calculations.totalInterest)}</p>
                  <p className="text-[10px] text-gray-400">{currency}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">{t('mcLoanAmount')}</p>
                  <p className="text-lg font-bold text-gray-900">{formatCompact(calculations.loanAmount)}</p>
                  <p className="text-[10px] text-gray-400">{currency}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">{t('mcTotalCost')}</p>
                  <p className="text-lg font-bold text-gray-900">{formatCompact(calculations.totalPayment + calculations.downPayment)}</p>
                  <p className="text-[10px] text-gray-400">{currency}</p>
                </div>
              </div>
            </div>
 
            {/* Pie Chart */}
            <div className="flex justify-center mb-5">
              <PieChart
                principal={calculations.totalPrincipal}
                interest={calculations.totalInterest}
                monthlyPayment={calculations.monthlyPayment}
                currency={currency}
                principalLabel={t('mcPrincipal')}
                interestLabel={t('mcInterest')}
              />
            </div>
 
            {/* Payment Breakdown Bar */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-600 mb-2">{t('mcPaymentBreakdown')}</p>
              <div className="h-4 rounded-full overflow-hidden flex bg-gray-200">
                {calculations.totalPayment > 0 && (
                  <>
                    <div className="bg-blue-500 transition-all duration-500" style={{ width: `${(calculations.totalPrincipal / calculations.totalPayment) * 100}%` }} />
                    <div className="bg-orange-500 transition-all duration-500" style={{ width: `${(calculations.totalInterest / calculations.totalPayment) * 100}%` }} />
                  </>
                )}
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-blue-600 font-medium">{t('mcPrincipal')}: {formatNumber(calculations.totalPrincipal)} {currency}</span>
                <span className="text-[10px] text-orange-600 font-medium">{t('mcInterest')}: {formatNumber(calculations.totalInterest)} {currency}</span>
              </div>
            </div>
 
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={handleSaveComparison}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                {savedNotice ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {t('mcSaved')}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                    </svg>
                    {t('mcSaveComparison')}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                {showAmortization ? t('mcHideSchedule') : t('mcViewSchedule')}
              </button>
              {comparisons.length > 0 && (
                <button
                  onClick={() => setShowComparisons(!showComparisons)}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors border border-indigo-200"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
                  </svg>
                  {t('mcCompare')} ({comparisons.length})
                </button>
              )}
            </div>
 
            {/* Amortization Schedule */}
            {showAmortization && (
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900">{t('mcAmortizationSchedule')}</h4>
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 p-0.5">
                    <button
                      onClick={() => setAmortizationView('yearly')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${amortizationView === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >{t('mcYearly')}</button>
                    <button
                      onClick={() => setAmortizationView('monthly')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${amortizationView === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >{t('mcMonthlyView')}</button>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-500 font-medium">{amortizationView === 'yearly' ? t('mcYearLabel') : t('mcMonthLabel')}</th>
                        <th className="text-right px-3 py-2 text-gray-500 font-medium">{t('mcPayment')}</th>
                        <th className="text-right px-3 py-2 text-gray-500 font-medium">{t('mcPrincipal')}</th>
                        <th className="text-right px-3 py-2 text-gray-500 font-medium">{t('mcInterest')}</th>
                        <th className="text-right px-3 py-2 text-gray-500 font-medium">{t('mcBalance')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {amortizationView === 'yearly' ? (
                        yearlySummary.map((row) => (
                          <tr key={row.year} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-3 py-2 font-medium text-gray-900">{t('mcYearLabel')} {row.year}</td>
                            <td className="px-3 py-2 text-right text-gray-700">{formatNumber(row.totalPaid)}</td>
                            <td className="px-3 py-2 text-right text-blue-600 font-medium">{formatNumber(row.principal)}</td>
                            <td className="px-3 py-2 text-right text-orange-600 font-medium">{formatNumber(row.interest)}</td>
                            <td className="px-3 py-2 text-right text-gray-700">{formatNumber(row.balance)}</td>
                          </tr>
                        ))
                      ) : (
                        amortizationSchedule.slice(0, 60).map((row) => (
                          <tr key={row.month} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-3 py-2 font-medium text-gray-900">{row.month}</td>
                            <td className="px-3 py-2 text-right text-gray-700">{formatNumber(row.payment)}</td>
                            <td className="px-3 py-2 text-right text-blue-600 font-medium">{formatNumber(row.principal)}</td>
                            <td className="px-3 py-2 text-right text-orange-600 font-medium">{formatNumber(row.interest)}</td>
                            <td className="px-3 py-2 text-right text-gray-700">{formatNumber(row.balance)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {amortizationView === 'monthly' && amortizationSchedule.length > 60 && (
                    <div className="px-4 py-3 bg-gray-50 text-center">
                      <p className="text-xs text-gray-500">
                        {t('mcShowingFirst').replace('{count}', '60').replace('{total}', String(amortizationSchedule.length))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
 
            {/* Saved Comparisons */}
            {showComparisons && comparisons.length > 0 && (
              <div className="border border-indigo-200 rounded-xl overflow-hidden mb-4">
                <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
                  <h4 className="text-sm font-semibold text-indigo-900">{t('mcSavedComparisons')}</h4>
                  <p className="text-[10px] text-indigo-600 mt-0.5">{t('mcCompareFinancing')}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {comparisons.map((comp) => (
                    <div key={comp.propertyId} className={`px-4 py-3 flex items-center justify-between gap-3 ${comp.propertyId === propertyId ? 'bg-blue-50/50' : 'bg-white'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {comp.propertyTitle}
                          {comp.propertyId === propertyId && (
                            <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">{t('mcCurrent')}</span>
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          <span className="text-[10px] text-gray-500">{comp.settings.downPaymentPercent}% {t('mcDownShort')}</span>
                          <span className="text-[10px] text-gray-500">{comp.settings.interestRate}% {t('mcRateShort')}</span>
                          <span className="text-[10px] text-gray-500">{comp.settings.loanTermYears}{t('mcTermShort')}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-blue-600">{formatNumber(comp.monthlyPayment)}</p>
                        <p className="text-[10px] text-gray-400">{currency}{t('mcMonthly')}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveComparison(comp.propertyId)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                        title="Remove"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
 
            {/* Info Notice */}
            <div className="flex items-start gap-2 text-[10px] text-gray-400">
              <InfoIcon size={14} className="flex-shrink-0 mt-0.5" />
              <p>{t('mcDisclaimer')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default MortgageCalculator;

