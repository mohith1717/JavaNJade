// ─── Transaction Mock Data ────────────────────────────────────────────────────
// Fields mirror TransactionRecord + TransactionDecisionResponse from the backend.
// Replace MOCK_TRANSACTIONS with real API data (transactionService.getAllTransactions)
// when the GET /api/transactions endpoint is implemented.
// ─────────────────────────────────────────────────────────────────────────────

// ── Risk level from score ─────────────────────────────────────────────────────
export function getRiskLevel(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

export const RISK_LEVEL_COLORS = {
  CRITICAL: '#FF3366',
  HIGH:     '#FF6B35',
  MEDIUM:   '#FFB800',
  LOW:      '#00FF88',
};

export const STATUS_COLORS = {
  APPROVED: '#00FF88',
  PENDING:  '#00D4FF',
  DENIED:   '#FF3366',
};

// ── Transaction hop type icons ────────────────────────────────────────────────
// type: 'originating' | 'correspondent' | 'intermediary' | 'receiving'

// ── Build lifecycle for a transaction ────────────────────────────────────────
function buildLifecycle(tx) {
  const base = tx.createdAt;
  const pad  = (s) => `${base.slice(0, 11)}${s}`;
  const isDenied   = tx.status === 'DENIED';
  const isCritical = tx.riskScore >= 80;
  const isHigh     = tx.riskScore >= 60;

  return {
    submitted: {
      status: 'COMPLETED',
      timestamp: pad(base.slice(11)),
      detail: `Transaction ${tx.tid} received for processing. Amount: ${tx.currency} ${tx.amount.toLocaleString()}. Device: ${tx.deviceId}.`,
    },
    validation: {
      status: 'PASSED',
      timestamp: pad(incrementSec(base.slice(11), 1)),
      checks: [
        { name: 'Amount Range',         result: 'PASS', note: `${tx.currency} ${tx.amount.toLocaleString()} within acceptable range` },
        { name: 'Account Format',       result: 'PASS', note: 'Sender & receiver account IDs valid' },
        { name: 'Currency Validity',    result: 'PASS', note: `${tx.currency} is a supported currency` },
        { name: 'Country Blacklist',    result: isCritical ? 'WARN' : 'PASS', note: isCritical ? `${tx.senderCountry} flagged as elevated-risk jurisdiction` : 'No blacklist match' },
        { name: 'Device Fingerprint',   result: tx.creditScore < 400 ? 'WARN' : 'PASS', note: tx.creditScore < 400 ? 'Device associated with prior flagged activity' : 'Device fingerprint clear' },
      ],
    },
    ruleEngine: {
      status: isHigh ? 'TRIGGERED' : 'PASSED',
      timestamp: pad(incrementSec(base.slice(11), 2)),
      triggeredRules: tx.triggeredRules ?? [],
    },
    riskScoring: {
      status: isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : tx.riskScore >= 40 ? 'MEDIUM' : 'LOW',
      timestamp: pad(incrementSec(base.slice(11), 3)),
      score: tx.riskScore,
      explanation: tx.primaryReason,
      factors: tx.riskFactors ?? [],
    },
    alertGeneration: {
      status: isHigh ? 'GENERATED' : 'SKIPPED',
      timestamp: pad(incrementSec(base.slice(11), 4)),
      alertId: isHigh ? `ALT-${String(Math.abs(hashCode(tx.tid)) % 9000 + 1000).padStart(4, '0')}` : null,
      severity: isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : null,
    },
    caseManagement: {
      status: isDenied ? 'OPEN' : isHigh ? 'ASSIGNED' : 'CLEAN',
      timestamp: pad(incrementSec(base.slice(11), 5)),
      caseId: (isDenied || isHigh) ? `CASE-${String(Math.abs(hashCode(tx.tid + 'c')) % 9000 + 1000).padStart(4, '0')}` : null,
      priority: tx.casePriority ?? null,
      assignedTo: (isDenied || isHigh) ? 'Fraud Investigation Team' : null,
    },
  };
}

function incrementSec(timeStr, secs) {
  const [h, m, s] = timeStr.split(':').map(Number);
  const total = h * 3600 + m * 60 + s + secs;
  const nh = Math.floor(total / 3600) % 24;
  const nm = Math.floor((total % 3600) / 60);
  const ns = total % 60;
  return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}:${String(ns).padStart(2,'0')}`;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return h;
}

// ── Raw transaction records ───────────────────────────────────────────────────
const RAW = [
  {
    tid: 'TXN-2026-9921', amount: 89450,    currency: 'USD',
    senderAccountId: 'ACC-NG-4821', senderCountry: 'Nigeria',
    receiverAccountId: 'ACC-US-9923', receiverCountry: 'USA',
    location: 'Lagos, Nigeria', deviceId: 'MOB-4521-Android', creditScore: 320,
    status: 'DENIED', riskScore: 94,
    primaryReason: 'High-risk jurisdiction + velocity breach (3rd transfer in 2h) + blacklisted sender pattern',
    casePriority: 'CRITICAL',
    hops: [
      { name: 'First Bank Nigeria',     type: 'originating',   country: 'NG', city: 'Lagos'     },
      { name: 'SWIFT Hub Dubai',         type: 'correspondent', country: 'AE', city: 'Dubai'     },
      { name: 'NY Fed Correspondent',    type: 'intermediary',  country: 'US', city: 'New York'  },
      { name: 'JPMorgan Chase',          type: 'receiving',     country: 'US', city: 'New York'  },
    ],
    riskFactors: ['High-risk jurisdiction (Nigeria)', 'Velocity breach', 'Low credit score (320)', 'Unusual hour'],
    triggeredRules: [
      { ruleName: 'HIGH_RISK_JURISDICTION', reason: 'Sender country Nigeria flagged', riskWeight: 35 },
      { ruleName: 'VELOCITY_CHECK',         reason: '3 transactions in 2 hours',      riskWeight: 28 },
      { ruleName: 'AMOUNT_THRESHOLD',       reason: 'Amount exceeds $50,000',         riskWeight: 20 },
    ],
    createdAt: '2026-07-31T14:32:00',
  },
  {
    tid: 'TXN-2026-9920', amount: 3200,     currency: 'GBP',
    senderAccountId: 'ACC-UK-3312', senderCountry: 'United Kingdom',
    receiverAccountId: 'ACC-DE-8821', receiverCountry: 'Germany',
    location: 'London, UK', deviceId: 'DESK-3312-Win11', creditScore: 780,
    status: 'APPROVED', riskScore: 18,
    primaryReason: 'Routine SEPA transaction, low-risk sender profile',
    casePriority: null,
    hops: [
      { name: 'Barclays Bank UK',    type: 'originating',  country: 'UK', city: 'London'    },
      { name: 'SEPA Clearing Hub',   type: 'intermediary', country: 'EU', city: 'Frankfurt' },
      { name: 'Deutsche Bank DE',    type: 'receiving',    country: 'DE', city: 'Berlin'    },
    ],
    riskFactors: [],
    triggeredRules: [],
    createdAt: '2026-07-31T14:28:00',
  },
  {
    tid: 'TXN-2026-9919', amount: 45600,    currency: 'EUR',
    senderAccountId: 'ACC-RO-2291', senderCountry: 'Romania',
    receiverAccountId: 'ACC-NL-7743', receiverCountry: 'Netherlands',
    location: 'Bucharest, Romania', deviceId: 'MOB-2291-iOS', creditScore: 410,
    status: 'DENIED', riskScore: 88,
    primaryReason: 'Cross-border fraud pattern detected + amount anomaly + device risk',
    casePriority: 'CRITICAL',
    hops: [
      { name: 'Banca Transilvania',  type: 'originating',  country: 'RO', city: 'Bucharest' },
      { name: 'EBA STEP2',           type: 'intermediary', country: 'EU', city: 'Brussels'  },
      { name: 'ING Bank Netherlands',type: 'receiving',    country: 'NL', city: 'Amsterdam' },
    ],
    riskFactors: ['Cross-border fraud pattern', 'Amount anomaly', 'Device previously flagged', 'Unusual transaction hour'],
    triggeredRules: [
      { ruleName: 'CROSS_BORDER_FRAUD_PATTERN', reason: 'Pattern matches known fraud signature', riskWeight: 40 },
      { ruleName: 'AMOUNT_ANOMALY',             reason: 'Amount 8x sender monthly average',     riskWeight: 30 },
      { ruleName: 'DEVICE_RISK',                reason: 'Device flagged in prior investigation', riskWeight: 18 },
    ],
    createdAt: '2026-07-31T14:21:00',
  },
  {
    tid: 'TXN-2026-9918', amount: 1200,     currency: 'USD',
    senderAccountId: 'ACC-US-8834', senderCountry: 'USA',
    receiverAccountId: 'ACC-US-4421', receiverCountry: 'USA',
    location: 'New York, USA', deviceId: 'DESK-8834-MacOS', creditScore: 820,
    status: 'APPROVED', riskScore: 12,
    primaryReason: 'Domestic ACH, verified sender, within normal range',
    casePriority: null,
    hops: [
      { name: 'Bank of America',  type: 'originating', country: 'US', city: 'New York' },
      { name: 'ACH Network',      type: 'intermediary',country: 'US', city: 'Atlanta'  },
      { name: 'Wells Fargo',      type: 'receiving',   country: 'US', city: 'New York' },
    ],
    riskFactors: [],
    triggeredRules: [],
    createdAt: '2026-07-31T14:18:00',
  },
  {
    tid: 'TXN-2026-9917', amount: 256000,   currency: 'USD',
    senderAccountId: 'ACC-CN-5521', senderCountry: 'China',
    receiverAccountId: 'ACC-KY-1198', receiverCountry: 'Cayman Islands',
    location: 'Shanghai, China', deviceId: 'DESK-5521-Win10', creditScore: 510,
    status: 'DENIED', riskScore: 96,
    primaryReason: 'Offshore destination (Cayman Islands) + capital flight pattern + amount exceeds $200k',
    casePriority: 'CRITICAL',
    hops: [
      { name: 'ICBC Shanghai',           type: 'originating',   country: 'CN', city: 'Shanghai'      },
      { name: 'SWIFT Correspondent HK',  type: 'correspondent', country: 'HK', city: 'Hong Kong'     },
      { name: 'Citibank NY',             type: 'intermediary',  country: 'US', city: 'New York'      },
      { name: 'Cayman National Bank',    type: 'intermediary',  country: 'KY', city: 'Grand Cayman'  },
      { name: 'Offshore Trust Co.',      type: 'receiving',     country: 'KY', city: 'Grand Cayman'  },
    ],
    riskFactors: ['Offshore destination', 'Capital flight pattern', 'Amount >$200k', 'Multiple hops through non-FATF jurisdiction'],
    triggeredRules: [
      { ruleName: 'OFFSHORE_DESTINATION',  reason: 'Cayman Islands — FATF high-risk list',   riskWeight: 40 },
      { ruleName: 'AMOUNT_THRESHOLD',      reason: 'Amount exceeds $200,000 single transfer', riskWeight: 30 },
      { ruleName: 'CAPITAL_FLIGHT',        reason: 'Pattern consistent with capital flight',  riskWeight: 26 },
    ],
    createdAt: '2026-07-31T14:15:00',
  },
  {
    tid: 'TXN-2026-9916', amount: 890,      currency: 'GBP',
    senderAccountId: 'ACC-UK-9912', senderCountry: 'United Kingdom',
    receiverAccountId: 'ACC-UK-3345', receiverCountry: 'United Kingdom',
    location: 'Manchester, UK', deviceId: 'MOB-9912-iOS', creditScore: 760,
    status: 'APPROVED', riskScore: 8,
    primaryReason: 'Domestic UK Faster Payments, routine purchase',
    casePriority: null,
    hops: [
      { name: 'HSBC UK',           type: 'originating', country: 'UK', city: 'Manchester' },
      { name: 'Faster Payments',   type: 'intermediary',country: 'UK', city: 'London'     },
      { name: 'Lloyds Bank UK',    type: 'receiving',   country: 'UK', city: 'Manchester' },
    ],
    riskFactors: [],
    triggeredRules: [],
    createdAt: '2026-07-31T14:12:00',
  },
  {
    tid: 'TXN-2026-9915', amount: 12300,    currency: 'USD',
    senderAccountId: 'ACC-RU-1145', senderCountry: 'Russia',
    receiverAccountId: 'ACC-MT-6678', receiverCountry: 'Malta',
    location: 'Moscow, Russia', deviceId: 'MOB-1145-Android', creditScore: 390,
    status: 'DENIED', riskScore: 76,
    primaryReason: 'Sanctions-adjacent jurisdiction + smurfing pattern (multiple small transfers)',
    casePriority: 'HIGH',
    hops: [
      { name: 'Sberbank Russia',       type: 'originating',   country: 'RU', city: 'Moscow'   },
      { name: 'VTB Cyprus Branch',     type: 'correspondent', country: 'CY', city: 'Nicosia'  },
      { name: 'BOV Malta',             type: 'receiving',     country: 'MT', city: 'Valletta' },
    ],
    riskFactors: ['Sanctions-adjacent jurisdiction (Russia)', 'Smurfing pattern detected', 'Low credit score'],
    triggeredRules: [
      { ruleName: 'SANCTIONS_ADJACENT',  reason: 'Sender from Russia (OFAC watchlist adjacency)', riskWeight: 35 },
      { ruleName: 'SMURFING_PATTERN',    reason: '7 transactions under $15k in 24h',              riskWeight: 25 },
    ],
    createdAt: '2026-07-31T14:08:00',
  },
  {
    tid: 'TXN-2026-9914', amount: 5400,     currency: 'USD',
    senderAccountId: 'ACC-US-6677', senderCountry: 'USA',
    receiverAccountId: 'ACC-IN-2234', receiverCountry: 'India',
    location: 'Chicago, USA', deviceId: 'DESK-6677-Win11', creditScore: 640,
    status: 'PENDING', riskScore: 52,
    primaryReason: 'Cross-border wire under review — amount at medium threshold',
    casePriority: 'MEDIUM',
    hops: [
      { name: 'Chase Bank USA',    type: 'originating',   country: 'US', city: 'Chicago' },
      { name: 'SWIFT Hub London',  type: 'correspondent', country: 'UK', city: 'London'  },
      { name: 'HDFC Bank India',   type: 'receiving',     country: 'IN', city: 'Mumbai'  },
    ],
    riskFactors: ['Cross-border transfer', 'Medium risk jurisdiction', 'Amount at threshold'],
    triggeredRules: [
      { ruleName: 'CROSS_BORDER_REVIEW', reason: 'Cross-border transfer requires additional review', riskWeight: 25 },
      { ruleName: 'AMOUNT_REVIEW',       reason: 'Amount between $5,000-$10,000 threshold',         riskWeight: 20 },
    ],
    createdAt: '2026-07-31T14:05:00',
  },
  {
    tid: 'TXN-2026-9913', amount: 78900,    currency: 'EUR',
    senderAccountId: 'ACC-RU-3381', senderCountry: 'Russia',
    receiverAccountId: 'ACC-CY-9911', receiverCountry: 'Cyprus',
    location: 'St. Petersburg, Russia', deviceId: 'DESK-3381-Win10', creditScore: 445,
    status: 'DENIED', riskScore: 91,
    primaryReason: 'Russia-Cyprus corridor (known money laundering route) + large amount + unusual time',
    casePriority: 'CRITICAL',
    hops: [
      { name: 'Gazprombank Russia',    type: 'originating',   country: 'RU', city: 'St. Petersburg' },
      { name: 'BNP Paribas Paris',     type: 'correspondent', country: 'FR', city: 'Paris'          },
      { name: 'Hellenic Bank Cyprus',  type: 'receiving',     country: 'CY', city: 'Nicosia'        },
    ],
    riskFactors: ['Known laundering corridor (RU-CY)', 'Large amount >€75k', 'Unusual hour (02:15)', 'Sanctions-adjacent'],
    triggeredRules: [
      { ruleName: 'KNOWN_ML_CORRIDOR',    reason: 'Russia-Cyprus is monitored corridor',       riskWeight: 40 },
      { ruleName: 'AMOUNT_THRESHOLD',     reason: 'Amount exceeds €75,000',                    riskWeight: 28 },
      { ruleName: 'UNUSUAL_HOUR',         reason: 'Transaction at 02:15 local time',           riskWeight: 15 },
    ],
    createdAt: '2026-07-31T02:15:00',
  },
  {
    tid: 'TXN-2026-9912', amount: 450,      currency: 'USD',
    senderAccountId: 'ACC-US-4492', senderCountry: 'USA',
    receiverAccountId: 'ACC-US-7731', receiverCountry: 'USA',
    location: 'San Francisco, USA', deviceId: 'MOB-4492-iOS', creditScore: 810,
    status: 'APPROVED', riskScore: 15,
    primaryReason: 'Low-value domestic payment, verified device',
    casePriority: null,
    hops: [
      { name: 'Stripe Payments',   type: 'originating', country: 'US', city: 'San Francisco' },
      { name: 'Visa Network',      type: 'intermediary',country: 'US', city: 'Foster City'   },
      { name: 'Citibank USA',      type: 'receiving',   country: 'US', city: 'New York'      },
    ],
    riskFactors: [],
    triggeredRules: [],
    createdAt: '2026-07-31T13:45:00',
  },
  {
    tid: 'TXN-2026-9911', amount: 34000,    currency: 'USD',
    senderAccountId: 'ACC-BR-7712', senderCountry: 'Brazil',
    receiverAccountId: 'ACC-PA-3312', receiverCountry: 'Panama',
    location: 'São Paulo, Brazil', deviceId: 'DESK-7712-MacOS', creditScore: 490,
    status: 'PENDING', riskScore: 68,
    primaryReason: 'Brazil-Panama corridor under enhanced monitoring; amount near threshold',
    casePriority: 'HIGH',
    hops: [
      { name: 'Itaú Unibanco Brazil',  type: 'originating',   country: 'BR', city: 'São Paulo'   },
      { name: 'Citibank Miami',        type: 'correspondent', country: 'US', city: 'Miami'        },
      { name: 'Banco General Panamá',  type: 'receiving',     country: 'PA', city: 'Panama City'  },
    ],
    riskFactors: ['High-risk corridor (BR-PA)', 'Amount near threshold', 'Low credit score'],
    triggeredRules: [
      { ruleName: 'HIGH_RISK_CORRIDOR', reason: 'Brazil-Panama known trade-based laundering route', riskWeight: 35 },
      { ruleName: 'AMOUNT_REVIEW',      reason: 'Amount $34k near $50k reporting threshold',        riskWeight: 20 },
    ],
    createdAt: '2026-07-31T13:30:00',
  },
  {
    tid: 'TXN-2026-9910', amount: 2100,     currency: 'EUR',
    senderAccountId: 'ACC-FR-8821', senderCountry: 'France',
    receiverAccountId: 'ACC-DE-5544', receiverCountry: 'Germany',
    location: 'Paris, France', deviceId: 'DESK-8821-MacOS', creditScore: 790,
    status: 'APPROVED', riskScore: 22,
    primaryReason: 'SEPA transaction within EU, normal profile',
    casePriority: null,
    hops: [
      { name: 'BNP Paribas France', type: 'originating', country: 'FR', city: 'Paris'    },
      { name: 'EBA STEP2',          type: 'intermediary',country: 'EU', city: 'Brussels' },
      { name: 'Commerzbank DE',     type: 'receiving',   country: 'DE', city: 'Frankfurt'},
    ],
    riskFactors: [],
    triggeredRules: [],
    createdAt: '2026-07-31T13:15:00',
  },
  {
    tid: 'TXN-2026-9909', amount: 18900,    currency: 'GBP',
    senderAccountId: 'ACC-NG-9923', senderCountry: 'Nigeria',
    receiverAccountId: 'ACC-UK-4411', receiverCountry: 'United Kingdom',
    location: 'Abuja, Nigeria', deviceId: 'MOB-9923-Android', creditScore: 360,
    status: 'PENDING', riskScore: 72,
    primaryReason: 'Nigeria-UK corridor — enhanced due diligence required; device risk elevated',
    casePriority: 'HIGH',
    hops: [
      { name: 'GTBank Nigeria',    type: 'originating',   country: 'NG', city: 'Abuja'  },
      { name: 'Standard Chartered',type: 'correspondent', country: 'SG', city: 'Singapore'},
      { name: 'NatWest UK',        type: 'receiving',     country: 'UK', city: 'London'  },
    ],
    riskFactors: ['High-risk jurisdiction (Nigeria)', 'Previously flagged device', 'Velocity check failed'],
    triggeredRules: [
      { ruleName: 'HIGH_RISK_JURISDICTION', reason: 'Nigeria — FATF grey list country',   riskWeight: 35 },
      { ruleName: 'DEVICE_RISK',            reason: 'Device associated with prior incident', riskWeight: 25 },
    ],
    createdAt: '2026-07-31T12:55:00',
  },
  {
    tid: 'TXN-2026-9908', amount: 890,      currency: 'CAD',
    senderAccountId: 'ACC-CA-2211', senderCountry: 'Canada',
    receiverAccountId: 'ACC-CA-5512', receiverCountry: 'Canada',
    location: 'Toronto, Canada', deviceId: 'MOB-2211-iOS', creditScore: 800,
    status: 'APPROVED', riskScore: 11,
    primaryReason: 'Domestic Interac transaction, verified sender',
    casePriority: null,
    hops: [
      { name: 'TD Bank Canada',   type: 'originating', country: 'CA', city: 'Toronto'   },
      { name: 'Interac Network',  type: 'intermediary',country: 'CA', city: 'Toronto'   },
      { name: 'RBC Canada',       type: 'receiving',   country: 'CA', city: 'Vancouver' },
    ],
    riskFactors: [],
    triggeredRules: [],
    createdAt: '2026-07-31T12:40:00',
  },
  {
    tid: 'TXN-2026-9907', amount: 125000,   currency: 'USD',
    senderAccountId: 'ACC-RU-7734', senderCountry: 'Russia',
    receiverAccountId: 'ACC-VG-0021', receiverCountry: 'British Virgin Islands',
    location: 'Moscow, Russia', deviceId: 'DESK-7734-Win11', creditScore: 380,
    status: 'DENIED', riskScore: 97,
    primaryReason: 'Shell company transfer to BVI offshore — potential sanctions evasion + money laundering',
    casePriority: 'CRITICAL',
    hops: [
      { name: 'VTB Bank Russia',        type: 'originating',   country: 'RU', city: 'Moscow'         },
      { name: 'Alfa Bank Cyprus',       type: 'correspondent', country: 'CY', city: 'Nicosia'        },
      { name: 'Credit Suisse Zürich',   type: 'intermediary',  country: 'CH', city: 'Zürich'         },
      { name: 'FirstCaribbean BVI',     type: 'receiving',     country: 'VG', city: 'Road Town, BVI' },
    ],
    riskFactors: ['Offshore BVI destination', 'Russia sanctions-adjacent', 'Shell company pattern', 'Multiple jurisdiction hops', 'Amount >$100k'],
    triggeredRules: [
      { ruleName: 'OFFSHORE_DESTINATION',   reason: 'BVI — zero-tax offshore jurisdiction',         riskWeight: 40 },
      { ruleName: 'SANCTIONS_ADJACENT',     reason: 'Russian originator (OFAC watchlist adjacency)',riskWeight: 35 },
      { ruleName: 'SHELL_COMPANY_PATTERN',  reason: 'Account profile matches shell company',        riskWeight: 22 },
    ],
    createdAt: '2026-07-31T12:10:00',
  },
  {
    tid: 'TXN-2026-9906', amount: 6700,     currency: 'AUD',
    senderAccountId: 'ACC-AU-3310', senderCountry: 'Australia',
    receiverAccountId: 'ACC-US-8823', receiverCountry: 'USA',
    location: 'Sydney, Australia', deviceId: 'DESK-3310-MacOS', creditScore: 720,
    status: 'APPROVED', riskScore: 45,
    primaryReason: 'Cross-border wire at medium threshold — auto-approved after velocity check',
    casePriority: null,
    hops: [
      { name: 'ANZ Bank Australia',   type: 'originating',   country: 'AU', city: 'Sydney'    },
      { name: 'Citibank Singapore',   type: 'correspondent', country: 'SG', city: 'Singapore' },
      { name: 'Citibank USA',         type: 'receiving',     country: 'US', city: 'New York'  },
    ],
    riskFactors: ['Cross-border transfer', 'Amount at medium threshold'],
    triggeredRules: [
      { ruleName: 'CROSS_BORDER_REVIEW', reason: 'Cross-border transfer flagged for review',  riskWeight: 25 },
    ],
    createdAt: '2026-07-31T11:55:00',
  },
  {
    tid: 'TXN-2026-9905', amount: 45000,    currency: 'USD',
    senderAccountId: 'ACC-IN-6612', senderCountry: 'India',
    receiverAccountId: 'ACC-AE-3309', receiverCountry: 'UAE',
    location: 'Mumbai, India', deviceId: 'MOB-6612-Android', creditScore: 560,
    status: 'PENDING', riskScore: 56,
    primaryReason: 'India-UAE corridor: large remittance under enhanced review',
    casePriority: 'MEDIUM',
    hops: [
      { name: 'SBI India',            type: 'originating',   country: 'IN', city: 'Mumbai' },
      { name: 'SWIFT Hub Bahrain',    type: 'correspondent', country: 'BH', city: 'Manama' },
      { name: 'Emirates NBD UAE',     type: 'receiving',     country: 'AE', city: 'Dubai'  },
    ],
    riskFactors: ['Cross-border large remittance', 'Medium risk corridor (IN-AE)', 'Amount at threshold'],
    triggeredRules: [
      { ruleName: 'LARGE_REMITTANCE',   reason: 'Remittance > $40,000 requires review',   riskWeight: 28 },
      { ruleName: 'CROSS_BORDER_REVIEW',reason: 'Cross-border transfer flagged',          riskWeight: 20 },
    ],
    createdAt: '2026-07-31T11:30:00',
  },
  {
    tid: 'TXN-2026-9904', amount: 280,      currency: 'JPY',
    senderAccountId: 'ACC-JP-1122', senderCountry: 'Japan',
    receiverAccountId: 'ACC-JP-3344', receiverCountry: 'Japan',
    location: 'Tokyo, Japan', deviceId: 'MOB-1122-iOS', creditScore: 850,
    status: 'APPROVED', riskScore: 5,
    primaryReason: 'Low-value domestic transfer, verified sender with excellent credit profile',
    casePriority: null,
    hops: [
      { name: 'Mizuho Bank Japan',  type: 'originating', country: 'JP', city: 'Tokyo' },
      { name: 'Zengin Network',     type: 'intermediary',country: 'JP', city: 'Tokyo' },
      { name: 'SMBC Japan',         type: 'receiving',   country: 'JP', city: 'Osaka' },
    ],
    riskFactors: [],
    triggeredRules: [],
    createdAt: '2026-07-31T10:45:00',
  },
  {
    tid: 'TXN-2026-9903', amount: 93000,    currency: 'EUR',
    senderAccountId: 'ACC-RO-4412', senderCountry: 'Romania',
    receiverAccountId: 'ACC-BS-9910', receiverCountry: 'Bahamas',
    location: 'Cluj-Napoca, Romania', deviceId: 'DESK-4412-Win10', creditScore: 415,
    status: 'DENIED', riskScore: 89,
    primaryReason: 'Caribbean offshore destination + Eastern Europe origin + large amount — high ML risk',
    casePriority: 'CRITICAL',
    hops: [
      { name: 'Raiffeisen Romania',     type: 'originating',   country: 'RO', city: 'Cluj-Napoca' },
      { name: 'EBA STEP2',              type: 'intermediary',  country: 'EU', city: 'Brussels'    },
      { name: 'BAWAG Group Austria',    type: 'correspondent', country: 'AT', city: 'Vienna'      },
      { name: 'Commonwealth Bank Bahamas', type: 'receiving',  country: 'BS', city: 'Nassau'      },
    ],
    riskFactors: ['Caribbean offshore destination', 'Eastern Europe origin', 'Large amount > €90k', 'Multiple hops through non-EEA'],
    triggeredRules: [
      { ruleName: 'OFFSHORE_DESTINATION',   reason: 'Bahamas — FATF monitored offshore centre',riskWeight: 38 },
      { ruleName: 'HIGH_RISK_JURISDICTION', reason: 'Romania — enhanced monitoring country',   riskWeight: 25 },
      { ruleName: 'AMOUNT_THRESHOLD',       reason: 'Amount exceeds €90,000',                  riskWeight: 20 },
    ],
    createdAt: '2026-07-31T10:05:00',
  },
  {
    tid: 'TXN-2026-9902', amount: 15600,    currency: 'CHF',
    senderAccountId: 'ACC-AE-5521', senderCountry: 'UAE',
    receiverAccountId: 'ACC-CH-1192', receiverCountry: 'Switzerland',
    location: 'Dubai, UAE', deviceId: 'DESK-5521-MacOS', creditScore: 690,
    status: 'APPROVED', riskScore: 38,
    primaryReason: 'UAE-Switzerland trade wire, within normal range for sender profile',
    casePriority: null,
    hops: [
      { name: 'Emirates NBD UAE',    type: 'originating',   country: 'AE', city: 'Dubai'  },
      { name: 'SWIFT Correspondent', type: 'correspondent', country: 'EU', city: 'Frankfurt'},
      { name: 'UBS Switzerland',     type: 'receiving',     country: 'CH', city: 'Zürich' },
    ],
    riskFactors: ['Cross-border transfer', 'UAE origin — moderate monitoring'],
    triggeredRules: [
      { ruleName: 'CROSS_BORDER_REVIEW', reason: 'Cross-border transfer under review', riskWeight: 18 },
    ],
    createdAt: '2026-07-31T09:30:00',
  },
];

// ── Build final enriched transaction array ────────────────────────────────────
export const MOCK_TRANSACTIONS = RAW.map((tx) => ({
  ...tx,
  riskLevel:  getRiskLevel(tx.riskScore),
  lifecycle:  buildLifecycle(tx),
}));

// ── Lookup by ID ──────────────────────────────────────────────────────────────
export function getTransactionById(tid) {
  return MOCK_TRANSACTIONS.find((t) => t.tid === tid) ?? null;
}

// ── Summary stats (for the table header) ─────────────────────────────────────
export const TRANSACTION_STATS = {
  total:    MOCK_TRANSACTIONS.length,
  approved: MOCK_TRANSACTIONS.filter((t) => t.status === 'APPROVED').length,
  pending:  MOCK_TRANSACTIONS.filter((t) => t.status === 'PENDING').length,
  denied:   MOCK_TRANSACTIONS.filter((t) => t.status === 'DENIED').length,
};
