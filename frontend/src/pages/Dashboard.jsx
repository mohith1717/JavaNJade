import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getAllRules } from '../services/ruleService';
import { getAllTransactions } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, ROLES } from '../config/roles';
import AnimatedMetricValue from '../components/common/AnimatedMetricValue';

function formatDateTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function formatCurrency(amount, currency) {
  if (amount === null || amount === undefined) return 'N/A';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency ?? ''} ${Number(amount).toLocaleString()}`.trim();
  }
}

function getRiskColor(level, theme) {
  const isDark = theme.palette.mode === 'dark';
  switch (level) {
    case 'LOW':
      return isDark ? '#00FF88' : '#1B5E20';
    case 'MEDIUM':
      return '#FFB800';
    case 'HIGH':
      return '#FF6B35';
    case 'CRITICAL':
      return '#FF3366';
    default:
      return '#7A90A8';
  }
}

function getStatusColor(status, theme) {
  const isDark = theme.palette.mode === 'dark';
  switch (status) {
    case 'APPROVED':
    case 'VALIDATED':
    case 'ASSESSED':
      return isDark ? '#00FF88' : '#1B5E20';
    case 'VALIDATION_FAILED':
    case 'FAILED':
      return '#FF3366';
    case 'REVIEW_REQUIRED':
    case 'ASSESSING_RISK':
      return '#FFB800';
    case 'VALIDATING':
    case 'RECEIVED':
      return '#00D4FF';
    default:
      return theme.palette.text.secondary;
  }
}

function SummaryCard({ title, value, subtitle, icon: Icon, accent }) {
  return (
    <Card
      component={motion.div}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      sx={{ height: '100%' }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.75, fontWeight: 800, lineHeight: 1 }}>
              <AnimatedMetricValue value={value} />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${accent}15`, border: `1px solid ${accent}30` }}>
            <Icon sx={{ color: accent, fontSize: 22 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const transactionsQuery = useQuery({
    queryKey: ['transactions', 'all'],
    queryFn: () => getAllTransactions(),
    staleTime: 60 * 1000,
  });

  const rulesQuery = useQuery({
    queryKey: ['rules', 'all'],
    queryFn: () => getAllRules(),
    staleTime: 60 * 1000,
  });

  const transactions = Array.isArray(transactionsQuery.data)
    ? transactionsQuery.data
    : [];
  const rules = Array.isArray(rulesQuery.data) ? rulesQuery.data : [];
  const loading = transactionsQuery.isPending || rulesQuery.isPending;
  const error = transactionsQuery.error?.message || rulesQuery.error?.message || '';

  const refreshDashboard = async () => {
    setRefreshing(true);
    await Promise.all([transactionsQuery.refetch(), rulesQuery.refetch()]);
    setRefreshing(false);
  };

  const metrics = useMemo(() => {
    const totalTransactions = transactions.length;
    const validationFailed = transactions.filter((transaction) => transaction.processingStatus === 'VALIDATION_FAILED').length;
    const highRisk = transactions.filter((transaction) => ['HIGH', 'CRITICAL'].includes(transaction.riskLevel)).length;
    const pendingRisk = transactions.filter((transaction) => transaction.riskLevel === 'PENDING').length;
    const activeRules = rules.filter((rule) => rule.enabled).length;

    return {
      totalTransactions,
      validationFailed,
      highRisk,
      pendingRisk,
      activeRules,
    };
  }, [rules, transactions]);

  const statusSeries = useMemo(() => {
    const counts = transactions.reduce((accumulator, transaction) => {
      accumulator[transaction.processingStatus] = (accumulator[transaction.processingStatus] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([status, value]) => ({
      status,
      value,
      color: getStatusColor(status, theme),
    }));
  }, [theme, transactions]);

  const riskSeries = useMemo(() => {
    const counts = transactions.reduce((accumulator, transaction) => {
      accumulator[transaction.riskLevel] = (accumulator[transaction.riskLevel] ?? 0) + 1;
      return accumulator;
    }, {});

    return ['PENDING', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
      .map((riskLevel) => ({
        name: riskLevel,
        value: counts[riskLevel] ?? 0,
        color: getRiskColor(riskLevel, theme),
      }))
      .filter((entry) => entry.value > 0);
  }, [theme, transactions]);

  const ruleSeries = useMemo(() => {
    const counts = rules.reduce((accumulator, rule) => {
      accumulator[rule.type] = (accumulator[rule.type] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([type, value]) => ({ type, value, color: '#00D4FF' }));
  }, [rules]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime())
      .slice(0, 8);
  }, [transactions]);

  const roleHeadline = ROLE_LABELS[user?.role] ?? 'Dashboard';

  const visibleKpis = useMemo(() => {
    const baseCards = [
      {
        key: 'total',
        title: 'Total Transactions',
        value: metrics.totalTransactions,
        subtitle: 'Fetched from /api/transactions',
        icon: ReceiptLongRoundedIcon,
        accent: '#00D4FF',
      },
      {
        key: 'highRisk',
        title: 'High Risk',
        value: metrics.highRisk,
        subtitle: 'HIGH and CRITICAL risk levels',
        icon: WarningAmberRoundedIcon,
        accent: '#FF3366',
      },
      {
        key: 'validationFailed',
        title: 'Validation Failed',
        value: metrics.validationFailed,
        subtitle: 'Transactions with validation errors',
        icon: QueryStatsRoundedIcon,
        accent: '#FFB800',
      },
      {
        key: 'pendingRisk',
        title: 'Pending Risk',
        value: metrics.pendingRisk,
        subtitle: 'Transactions waiting for risk assessment',
        icon: QueryStatsRoundedIcon,
        accent: '#7B2FFF',
      },
      {
        key: 'activeRules',
        title: 'Active Rules',
        value: metrics.activeRules,
        subtitle: 'Enabled monitoring rules',
        icon: TuneRoundedIcon,
        accent: '#00FF88',
      },
    ];

    if (user?.role === ROLES.FRAUD_ANALYST) {
      return baseCards.filter((card) => ['highRisk', 'validationFailed', 'pendingRisk', 'total'].includes(card.key));
    }
    if (user?.role === ROLES.RISK_ANALYST) {
      return baseCards.filter((card) => ['highRisk', 'pendingRisk', 'activeRules', 'total'].includes(card.key));
    }
    return baseCards;
  }, [metrics.activeRules, metrics.highRisk, metrics.pendingRisk, metrics.totalTransactions, metrics.validationFailed, user?.role]);

  const roleFocus = useMemo(() => {
    const reviewRequired = transactions.filter((transaction) => transaction.processingStatus === 'REVIEW_REQUIRED').length;
    const assessed = transactions.filter((transaction) => transaction.processingStatus === 'ASSESSED').length;
    const approved = transactions.filter((transaction) => transaction.processingStatus === 'APPROVED').length;
    const failed = transactions.filter((transaction) => transaction.processingStatus === 'FAILED').length;

    if (user?.role === ROLES.FRAUD_ANALYST) {
      return {
        title: 'Fraud Analyst Focus',
        lines: [
          `Review-required queue: ${reviewRequired.toLocaleString()}`,
          `Validation failures to inspect: ${metrics.validationFailed.toLocaleString()}`,
          `High-risk transaction volume: ${metrics.highRisk.toLocaleString()}`,
        ],
      };
    }

    if (user?.role === ROLES.RISK_ANALYST) {
      return {
        title: 'Risk Analyst Focus',
        lines: [
          `Pending risk assessments: ${metrics.pendingRisk.toLocaleString()}`,
          `Risk-assessed transactions: ${assessed.toLocaleString()}`,
          `High-risk portfolio slice: ${metrics.highRisk.toLocaleString()}`,
        ],
      };
    }

    return {
      title: 'System Admin Focus',
      lines: [
        `Active rules: ${metrics.activeRules.toLocaleString()} of ${rules.length.toLocaleString()}`,
        `Approved transactions: ${approved.toLocaleString()}`,
        `Failed transactions needing triage: ${failed.toLocaleString()}`,
      ],
    };
  }, [metrics.activeRules, metrics.highRisk, metrics.pendingRisk, metrics.validationFailed, rules.length, transactions, user?.role]);

  if (loading) {
    return (
      <Stack spacing={2.5}>
        <Skeleton variant="rectangular" height={84} sx={{ borderRadius: 2 }} />
        <Grid container spacing={2.5}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Grid item xs={12} sm={6} xl={4} key={index}>
              <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.4px' }}>
            {roleHeadline}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Backend-driven overview of transactions and monitoring rules.
          </Typography>
        </Box>
        <Button
          onClick={refreshDashboard}
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshRoundedIcon />}
        >
          Refresh
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert> : null}

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {visibleKpis.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.key}>
            <SummaryCard
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              accent={card.accent}
            />
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
            {roleFocus.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Personalized backend-driven priorities for your current role.
          </Typography>
          <Stack spacing={0.8}>
            {roleFocus.lines.map((line) => (
              <Typography key={line} variant="body2" sx={{ fontWeight: 600 }}>
                {line}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Processing Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Distribution of transactions by backend processing status.
              </Typography>
              <Box sx={{ flex: 1, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusSeries} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <XAxis dataKey="status" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {statusSeries.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Risk Levels
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Backend risk distribution across all transactions.
              </Typography>
              <Box sx={{ flex: 1, minHeight: 280, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskSeries} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="78%" paddingAngle={3}>
                      {riskSeries.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Rule Inventory
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Active monitoring rule coverage by type.
              </Typography>
              <Box sx={{ flex: 1, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ruleSeries} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <XAxis dataKey="type" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#00D4FF" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Recent Transactions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Latest transactions returned by the backend.
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Risk</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTransactions.length ? recentTransactions.map((transaction) => {
                      const riskColor = getRiskColor(transaction.riskLevel, theme);
                      const statusColor = getStatusColor(transaction.processingStatus, theme);

                      return (
                        <TableRow key={transaction.id} hover>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{transaction.externalTransactionId}</TableCell>
                          <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                          <TableCell>
                            <Box component="span" sx={{ color: statusColor, fontWeight: 700 }}>{transaction.processingStatus}</Box>
                          </TableCell>
                          <TableCell>
                            <Box component="span" sx={{ color: riskColor, fontWeight: 700 }}>{transaction.riskLevel}</Box>
                          </TableCell>
                          <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              No transactions available.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
