// ─── Mock Data ────────────────────────────────────────────────────────────────
// All data is keyed by the three time-period filters the dashboard supports.
// When real backend endpoints are ready, replace the DASHBOARD_DATA object
// with actual API calls inside the service layer — components stay unchanged.
// ─────────────────────────────────────────────────────────────────────────────

// ── Neon colour constants (matches theme palette) ─────────────────────────────
export const RISK_COLORS = {
  Low:      '#00FF88',
  Medium:   '#FFB800',
  High:     '#FF6B35',
  Critical: '#FF3366',
};

export const SEVERITY_COLORS = {
  Critical: '#FF3366',
  High:     '#FF6B35',
  Medium:   '#FFB800',
  Low:      '#00FF88',
};

// ── Transaction Trend — hourly (Today) ────────────────────────────────────────
const trendToday = [
  { label: '00:00', count: 12,  flagged: 1,  amount: 45200  },
  { label: '01:00', count: 8,   flagged: 0,  amount: 28100  },
  { label: '02:00', count: 5,   flagged: 0,  amount: 18400  },
  { label: '03:00', count: 3,   flagged: 0,  amount: 11200  },
  { label: '04:00', count: 4,   flagged: 0,  amount: 14800  },
  { label: '05:00', count: 9,   flagged: 1,  amount: 33600  },
  { label: '06:00', count: 18,  flagged: 1,  amount: 67200  },
  { label: '07:00', count: 35,  flagged: 2,  amount: 134000 },
  { label: '08:00', count: 67,  flagged: 4,  amount: 245000 },
  { label: '09:00', count: 89,  flagged: 8,  amount: 345200 },
  { label: '10:00', count: 112, flagged: 12, amount: 456100 },
  { label: '11:00', count: 95,  flagged: 9,  amount: 389400 },
  { label: '12:00', count: 108, flagged: 11, amount: 423200 },
  { label: '13:00', count: 134, flagged: 15, amount: 521300 },
  { label: '14:00', count: 145, flagged: 18, amount: 578600 },
  { label: '15:00', count: 128, flagged: 14, amount: 498900 },
  { label: '16:00', count: 112, flagged: 12, amount: 445300 },
  { label: '17:00', count: 98,  flagged: 10, amount: 389100 },
  { label: '18:00', count: 87,  flagged: 8,  amount: 345600 },
  { label: '19:00', count: 76,  flagged: 7,  amount: 298200 },
  { label: '20:00', count: 68,  flagged: 6,  amount: 267400 },
  { label: '21:00', count: 54,  flagged: 5,  amount: 212300 },
  { label: '22:00', count: 38,  flagged: 3,  amount: 145100 },
  { label: '23:00', count: 24,  flagged: 2,  amount: 89200  },
];

// ── Transaction Trend — daily (This Month) ────────────────────────────────────
const trendMonth = [
  { label: 'Jul 1',  count: 1245, flagged: 89,  amount: 4560000 },
  { label: 'Jul 2',  count: 1389, flagged: 102, amount: 5123000 },
  { label: 'Jul 3',  count: 1102, flagged: 78,  amount: 4012000 },
  { label: 'Jul 4',  count: 978,  flagged: 65,  amount: 3567000 },
  { label: 'Jul 5',  count: 1456, flagged: 112, amount: 5312000 },
  { label: 'Jul 6',  count: 1623, flagged: 134, amount: 5934000 },
  { label: 'Jul 7',  count: 1789, flagged: 156, amount: 6523000 },
  { label: 'Jul 8',  count: 1534, flagged: 121, amount: 5612000 },
  { label: 'Jul 9',  count: 1298, flagged: 98,  amount: 4745000 },
  { label: 'Jul 10', count: 1478, flagged: 118, amount: 5401000 },
  { label: 'Jul 11', count: 1634, flagged: 138, amount: 5967000 },
  { label: 'Jul 12', count: 1812, flagged: 162, amount: 6623000 },
  { label: 'Jul 13', count: 1567, flagged: 129, amount: 5723000 },
  { label: 'Jul 14', count: 1345, flagged: 104, amount: 4912000 },
  { label: 'Jul 15', count: 1678, flagged: 143, amount: 6134000 },
  { label: 'Jul 16', count: 1823, flagged: 167, amount: 6656000 },
  { label: 'Jul 17', count: 1945, flagged: 189, amount: 7102000 },
  { label: 'Jul 18', count: 1712, flagged: 154, amount: 6256000 },
  { label: 'Jul 19', count: 1489, flagged: 123, amount: 5434000 },
  { label: 'Jul 20', count: 1567, flagged: 131, amount: 5723000 },
  { label: 'Jul 21', count: 1734, flagged: 148, amount: 6334000 },
  { label: 'Jul 22', count: 1856, flagged: 172, amount: 6778000 },
  { label: 'Jul 23', count: 1923, flagged: 181, amount: 7023000 },
  { label: 'Jul 24', count: 1678, flagged: 145, amount: 6134000 },
  { label: 'Jul 25', count: 1534, flagged: 128, amount: 5601000 },
  { label: 'Jul 26', count: 1689, flagged: 147, amount: 6167000 },
  { label: 'Jul 27', count: 1812, flagged: 165, amount: 6623000 },
  { label: 'Jul 28', count: 1934, flagged: 184, amount: 7067000 },
  { label: 'Jul 29', count: 2012, flagged: 198, amount: 7345000 },
  { label: 'Jul 30', count: 1876, flagged: 171, amount: 6856000 },
  { label: 'Jul 31', count: 1245, flagged: 112, amount: 4567000 },
];

// ── Transaction Trend — weekly (90 Days) ─────────────────────────────────────
const trend90Days = [
  { label: 'W1 May',  count: 8234,  flagged: 612,  amount: 30145000 },
  { label: 'W2 May',  count: 9156,  flagged: 734,  amount: 33456000 },
  { label: 'W3 May',  count: 8789,  flagged: 689,  amount: 32123000 },
  { label: 'W4 May',  count: 10234, flagged: 845,  amount: 37456000 },
  { label: 'W1 Jun',  count: 9678,  flagged: 789,  amount: 35345000 },
  { label: 'W2 Jun',  count: 11234, flagged: 934,  amount: 41056000 },
  { label: 'W3 Jun',  count: 10789, flagged: 898,  amount: 39456000 },
  { label: 'W4 Jun',  count: 12456, flagged: 1056, amount: 45567000 },
  { label: 'W1 Jul',  count: 11234, flagged: 945,  amount: 41056000 },
  { label: 'W2 Jul',  count: 12789, flagged: 1089, amount: 46734000 },
  { label: 'W3 Jul',  count: 13456, flagged: 1178, amount: 49123000 },
  { label: 'W4 Jul',  count: 12345, flagged: 1034, amount: 45123000 },
  { label: 'Jul 31',  count: 1245,  flagged: 112,  amount: 4567000  },
];

// ── Risk Distribution ─────────────────────────────────────────────────────────
const riskToday = [
  { name: 'Low',      value: 82,    color: RISK_COLORS.Low      },
  { name: 'Medium',   value: 28,    color: RISK_COLORS.Medium   },
  { name: 'High',     value: 13,    color: RISK_COLORS.High     },
  { name: 'Critical', value: 5,     color: RISK_COLORS.Critical },
];
const riskMonth = [
  { name: 'Low',      value: 30456, color: RISK_COLORS.Low      },
  { name: 'Medium',   value: 9234,  color: RISK_COLORS.Medium   },
  { name: 'High',     value: 3789,  color: RISK_COLORS.High     },
  { name: 'Critical', value: 1456,  color: RISK_COLORS.Critical },
];
const risk90Days = [
  { name: 'Low',      value: 89123, color: RISK_COLORS.Low      },
  { name: 'Medium',   value: 26789, color: RISK_COLORS.Medium   },
  { name: 'High',     value: 11234, color: RISK_COLORS.High     },
  { name: 'Critical', value: 4567,  color: RISK_COLORS.Critical },
];

// ── Risk by Location ──────────────────────────────────────────────────────────
const locationToday = [
  { country: 'Nigeria',  high: 4, medium: 7, low: 8   },
  { country: 'Romania',  high: 3, medium: 5, low: 12  },
  { country: 'China',    high: 3, medium: 9, low: 21  },
  { country: 'Russia',   high: 5, medium: 6, low: 4   },
  { country: 'Brazil',   high: 2, medium: 8, low: 16  },
  { country: 'India',    high: 1, medium: 12, low: 42 },
  { country: 'UK',       high: 1, medium: 4, low: 22  },
  { country: 'USA',      high: 3, medium: 15, low: 72 },
];
const locationMonth = [
  { country: 'Nigeria',  high: 145, medium: 278, low: 389  },
  { country: 'Romania',  high: 129, medium: 245, low: 467  },
  { country: 'China',    high: 138, medium: 412, low: 934  },
  { country: 'Russia',   high: 152, medium: 267, low: 345  },
  { country: 'Brazil',   high: 93,  medium: 289, low: 678  },
  { country: 'India',    high: 78,  medium: 534, low: 1456 },
  { country: 'UK',       high: 52,  medium: 145, low: 734  },
  { country: 'USA',      high: 134, medium: 556, low: 2789 },
];
const location90Days = [
  { country: 'Nigeria',  high: 445, medium: 778,  low: 1289  },
  { country: 'Romania',  high: 389, medium: 645,  low: 1467  },
  { country: 'China',    high: 438, medium: 1012, low: 3234  },
  { country: 'Russia',   high: 452, medium: 867,  low: 1345  },
  { country: 'Brazil',   high: 293, medium: 889,  low: 2278  },
  { country: 'India',    high: 278, medium: 1534, low: 5456  },
  { country: 'UK',       high: 152, medium: 545,  low: 2734  },
  { country: 'USA',      high: 434, medium: 1556, low: 8789  },
];

// ── Alert Severity Breakdown ──────────────────────────────────────────────────
const alertsToday  = [
  { severity: 'Critical', count: 3,   color: SEVERITY_COLORS.Critical },
  { severity: 'High',     count: 8,   color: SEVERITY_COLORS.High     },
  { severity: 'Medium',   count: 12,  color: SEVERITY_COLORS.Medium   },
  { severity: 'Low',      count: 5,   color: SEVERITY_COLORS.Low      },
];
const alertsMonth  = [
  { severity: 'Critical', count: 45,  color: SEVERITY_COLORS.Critical },
  { severity: 'High',     count: 112, color: SEVERITY_COLORS.High     },
  { severity: 'Medium',   count: 234, color: SEVERITY_COLORS.Medium   },
  { severity: 'Low',      count: 89,  color: SEVERITY_COLORS.Low      },
];
const alerts90Days = [
  { severity: 'Critical', count: 120, color: SEVERITY_COLORS.Critical },
  { severity: 'High',     count: 310, color: SEVERITY_COLORS.High     },
  { severity: 'Medium',   count: 680, color: SEVERITY_COLORS.Medium   },
  { severity: 'Low',      count: 245, color: SEVERITY_COLORS.Low      },
];

// ── KPI Metrics ───────────────────────────────────────────────────────────────
const kpiToday = {
  totalTransactions: 1284,  totalTrend: +5.2,
  highRisk: 18,             highRiskTrend: +18.3,
  openAlerts: 28,           alertsTrend: -12.5,
  activeCases: 9,           casesTrend: +4.1,
  trendLabel: 'vs yesterday',
};
const kpiMonth = {
  totalTransactions: 44935, totalTrend: +8.7,
  highRisk: 5245,           highRiskTrend: +11.2,
  openAlerts: 480,          alertsTrend: -5.3,
  activeCases: 142,         casesTrend: +7.8,
  trendLabel: 'vs last month',
};
const kpi90Days = {
  totalTransactions: 131713, totalTrend: +15.4,
  highRisk: 15801,           highRiskTrend: +9.6,
  openAlerts: 1355,          alertsTrend: +2.1,
  activeCases: 401,          casesTrend: +12.3,
  trendLabel: 'vs prev 90 days',
};

// ── Recent Transactions (shared across all periods) ───────────────────────────
export const RECENT_TRANSACTIONS = [
  { id: 'TXN-9921', account: 'ACC-4821', merchant: 'Lagos Wire Transfer',   amount: 89450,  currency: 'USD', riskScore: 94, riskLevel: 'Critical', status: 'BLOCKED',  time: '14:32' },
  { id: 'TXN-9920', account: 'ACC-3312', merchant: 'Amazon.com',            amount: 3200,   currency: 'USD', riskScore: 67, riskLevel: 'High',     status: 'FLAGGED',  time: '14:28' },
  { id: 'TXN-9919', account: 'ACC-7743', merchant: 'Stripe Payment',        amount: 540,    currency: 'USD', riskScore: 18, riskLevel: 'Low',      status: 'APPROVED', time: '14:25' },
  { id: 'TXN-9918', account: 'ACC-2291', merchant: 'Bucharest ACH',         amount: 45600,  currency: 'EUR', riskScore: 88, riskLevel: 'Critical', status: 'BLOCKED',  time: '14:21' },
  { id: 'TXN-9917', account: 'ACC-8834', merchant: 'PayPal Transfer',       amount: 1200,   currency: 'USD', riskScore: 42, riskLevel: 'Medium',   status: 'REVIEW',   time: '14:18' },
  { id: 'TXN-9916', account: 'ACC-5521', merchant: 'SWIFT Wire - Shanghai', amount: 256000, currency: 'USD', riskScore: 82, riskLevel: 'High',     status: 'FLAGGED',  time: '14:15' },
  { id: 'TXN-9915', account: 'ACC-9912', merchant: 'Apple Pay',             amount: 89,     currency: 'USD', riskScore: 12, riskLevel: 'Low',      status: 'APPROVED', time: '14:12' },
  { id: 'TXN-9914', account: 'ACC-1145', merchant: 'Western Union',         amount: 12300,  currency: 'USD', riskScore: 76, riskLevel: 'High',     status: 'FLAGGED',  time: '14:08' },
  { id: 'TXN-9913', account: 'ACC-6677', merchant: 'Klarna Purchase',       amount: 459,    currency: 'EUR', riskScore: 28, riskLevel: 'Low',      status: 'APPROVED', time: '14:05' },
  { id: 'TXN-9912', account: 'ACC-3381', merchant: 'Moscow SEPA Transfer',  amount: 78900,  currency: 'EUR', riskScore: 91, riskLevel: 'Critical', status: 'BLOCKED',  time: '14:01' },
];

// ── Master data object ────────────────────────────────────────────────────────
export const DASHBOARD_DATA = {
  today: {
    kpi:             kpiToday,
    transactionTrend: trendToday,
    riskDistribution: riskToday,
    riskByLocation:  locationToday,
    alertSeverity:   alertsToday,
  },
  month: {
    kpi:             kpiMonth,
    transactionTrend: trendMonth,
    riskDistribution: riskMonth,
    riskByLocation:  locationMonth,
    alertSeverity:   alertsMonth,
  },
  days90: {
    kpi:             kpi90Days,
    transactionTrend: trend90Days,
    riskDistribution: risk90Days,
    riskByLocation:  location90Days,
    alertSeverity:   alerts90Days,
  },
};
