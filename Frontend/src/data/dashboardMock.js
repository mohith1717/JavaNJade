export const dashboardSummary = {
  greeting: "Good afternoon, System Admin",
  dateText: "Sunday, August 2, 2026",
  status: "All Systems Operational",
  stats: [
    { label: "Total Transactions", value: "1,284", change: "+5.2%", trend: "up", note: "vs yesterday" },
    { label: "High Risk Transactions", value: "18", change: "+18.3%", trend: "up", note: "vs yesterday" },
    { label: "Open Alerts", value: "28", change: "-12.5%", trend: "down", note: "vs yesterday" },
    { label: "Active Cases", value: "9", change: "+4.1%", trend: "up", note: "vs yesterday" },
  ],
  riskDistribution: [
    { level: "Low", percent: 64.1, count: 82 },
    { level: "Medium", percent: 21.9, count: 28 },
    { level: "High", percent: 10.2, count: 13 },
    { level: "Critical", percent: 3.9, count: 5 },
  ],
  locationRisk: [
    { country: "Nigeria", high: 82, medium: 31, low: 18 },
    { country: "Romania", high: 61, medium: 29, low: 24 },
    { country: "China", high: 48, medium: 33, low: 40 },
    { country: "Russia", high: 44, medium: 27, low: 35 },
    { country: "Brazil", high: 36, medium: 22, low: 38 },
    { country: "India", high: 31, medium: 26, low: 54 },
    { country: "UK", high: 15, medium: 20, low: 42 },
    { country: "USA", high: 12, medium: 18, low: 59 },
  ],
  alertSeverity: [
    { level: "Critical", count: 3 },
    { level: "High", count: 8 },
    { level: "Medium", count: 12 },
    { level: "Low", count: 5 },
  ],
};

export const recentTransactions = [
  { id: "TXN-9921", account: "ACC-4821", merchant: "Lagos Wire Transfer", amount: "USD 89,450", risk: 94, status: "BLOCKED", time: "14:32" },
  { id: "TXN-9920", account: "ACC-3312", merchant: "Amazon.com", amount: "USD 3,200", risk: 67, status: "FLAGGED", time: "14:28" },
  { id: "TXN-9919", account: "ACC-7743", merchant: "Stripe Payment", amount: "USD 540", risk: 18, status: "APPROVED", time: "14:25" },
  { id: "TXN-9918", account: "ACC-2291", merchant: "Bucharest ACH", amount: "EUR 45,600", risk: 88, status: "BLOCKED", time: "14:21" },
  { id: "TXN-9917", account: "ACC-8834", merchant: "PayPal Transfer", amount: "USD 1,200", risk: 42, status: "REVIEW", time: "14:18" },
  { id: "TXN-9916", account: "ACC-5521", merchant: "SWIFT Wire - Shanghai", amount: "USD 256,000", risk: 82, status: "FLAGGED", time: "14:15" },
  { id: "TXN-9915", account: "ACC-9912", merchant: "Apple Pay", amount: "USD 89", risk: 12, status: "APPROVED", time: "14:12" },
  { id: "TXN-9914", account: "ACC-1145", merchant: "Western Union", amount: "USD 12,300", risk: 76, status: "FLAGGED", time: "14:08" },
  { id: "TXN-9913", account: "ACC-6677", merchant: "Klarna Purchase", amount: "EUR 459", risk: 28, status: "APPROVED", time: "14:05" },
  { id: "TXN-9912", account: "ACC-3381", merchant: "Moscow SEPA Transfer", amount: "EUR 78,900", risk: 91, status: "BLOCKED", time: "14:01" },
];
