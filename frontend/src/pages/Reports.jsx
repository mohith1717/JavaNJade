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
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getAllRules } from '../services/ruleService';
import { getAllTransactions } from '../services/transactionService';
import { getAllValidationErrors } from '../services/validationService';
import { exportRowsToCsv } from '../utils/exportUtils';
import { exportRowsToPdf } from '../utils/pdfExportUtils';
import AnimatedMetricValue from '../components/common/AnimatedMetricValue';

function formatDateTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
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

export default function Reports() {
  const theme = useTheme();
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

  const validationErrorsQuery = useQuery({
    queryKey: ['validation-errors', 'all'],
    queryFn: () => getAllValidationErrors(),
    staleTime: 60 * 1000,
  });

  const transactions = Array.isArray(transactionsQuery.data)
    ? transactionsQuery.data
    : [];
  const rules = Array.isArray(rulesQuery.data) ? rulesQuery.data : [];
  const validationErrors = Array.isArray(validationErrorsQuery.data)
    ? validationErrorsQuery.data
    : [];

  const loading =
    transactionsQuery.isPending
    || rulesQuery.isPending
    || validationErrorsQuery.isPending;

  const error =
    transactionsQuery.error?.message
    || rulesQuery.error?.message
    || validationErrorsQuery.error?.message
    || '';

  const refreshReportData = async () => {
    setRefreshing(true);
    await Promise.all([
      transactionsQuery.refetch(),
      rulesQuery.refetch(),
      validationErrorsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const metrics = useMemo(() => {
    const totalTransactions = transactions.length;
    const validationFailed = transactions.filter((transaction) => transaction.processingStatus === 'VALIDATION_FAILED').length;
    const highRisk = transactions.filter((transaction) => ['HIGH', 'CRITICAL'].includes(transaction.riskLevel)).length;
    const totalRules = rules.length;
    const activeRules = rules.filter((rule) => rule.enabled).length;

    return {
      totalTransactions,
      validationFailed,
      highRisk,
      totalRules,
      activeRules,
    };
  }, [rules, transactions]);

  const errorSeries = useMemo(() => {
    const counts = validationErrors.reduce((accumulator, validationError) => {
      accumulator[validationError.code] = (accumulator[validationError.code] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([code, value]) => ({ code, value, color: '#FF3366' }));
  }, [validationErrors]);

  const ruleSeries = useMemo(() => {
    const counts = rules.reduce((accumulator, rule) => {
      accumulator[rule.type] = (accumulator[rule.type] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([type, value]) => ({ type, value, color: '#00D4FF' }));
  }, [rules]);

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

  const topValidationErrors = useMemo(() => {
    return [...validationErrors]
      .sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime())
      .slice(0, 8);
  }, [validationErrors]);

  const handleExportCsv = () => {
    const columns = [
      { key: 'externalTransactionId', label: 'External Transaction ID' },
      { key: 'senderAccountId', label: 'Sender Account' },
      { key: 'receiverAccountId', label: 'Receiver Account' },
      { key: 'amount', label: 'Amount' },
      { key: 'currency', label: 'Currency' },
      { key: 'processingStatus', label: 'Processing Status' },
      { key: 'riskLevel', label: 'Risk Level' },
      { key: 'riskScore', label: 'Risk Score' },
      { key: 'createdAt', label: 'Created At' },
    ];
    exportRowsToCsv('report-transactions.csv', columns, transactions);
  };

  const handleExportPdf = () => {
    const columns = [
      { key: 'externalTransactionId', label: 'External Transaction ID' },
      { key: 'senderAccountId', label: 'Sender Account' },
      { key: 'receiverAccountId', label: 'Receiver Account' },
      { key: 'amount', label: 'Amount' },
      { key: 'currency', label: 'Currency' },
      { key: 'processingStatus', label: 'Processing Status' },
      { key: 'riskLevel', label: 'Risk Level' },
      { key: 'riskScore', label: 'Risk Score' },
      { key: 'createdAt', label: 'Created At' },
    ];
    exportRowsToPdf('report-transactions.pdf', 'Transactions Report', columns, transactions);
  };

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
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Reports are computed entirely from live backend transaction, rule, and validation data.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={handleExportCsv}
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            disabled={!transactions.length}
          >
            Export CSV
          </Button>
          <Button
            onClick={handleExportPdf}
            variant="outlined"
            startIcon={<PictureAsPdfRoundedIcon />}
            disabled={!transactions.length}
          >
            Export PDF
          </Button>
          <Button
            onClick={refreshReportData}
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshRoundedIcon />}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert> : null}

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard title="Transactions" value={metrics.totalTransactions} subtitle="Across the current backend dataset" icon={ReceiptLongRoundedIcon} accent="#00D4FF" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard title="Validation Failed" value={metrics.validationFailed} subtitle="Transactions with validation errors" icon={ErrorOutlineRoundedIcon} accent="#FF3366" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard title="High Risk" value={metrics.highRisk} subtitle="HIGH and CRITICAL risk levels" icon={AssessmentRoundedIcon} accent="#FF6B35" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard title="Rules" value={metrics.totalRules} subtitle={`${metrics.activeRules} enabled`} icon={TuneRoundedIcon} accent="#00FF88" />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Validation Error Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Counts by backend validation error code.
              </Typography>
              <Box sx={{ flex: 1, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={errorSeries} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <XAxis dataKey="code" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#FF3366" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Risk Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current risk levels across all transactions.
              </Typography>
              <Box sx={{ flex: 1, minHeight: 280 }}>
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
                Processing Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Transaction processing outcomes from the backend.
              </Typography>
              <Box sx={{ flex: 1, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusSeries} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <XAxis dataKey="status" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
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

        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Rule Type Inventory
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Rule coverage by monitoring type.
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
      </Grid>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
            Recent Validation Errors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The latest validation failures recorded by the backend.
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Error Code</TableCell>
                  <TableCell>Transaction</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topValidationErrors.length ? topValidationErrors.map((validationError) => (
                  <TableRow key={validationError.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{validationError.code}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{validationError.transactionId}</TableCell>
                    <TableCell>{validationError.field}</TableCell>
                    <TableCell>{validationError.message}</TableCell>
                    <TableCell>{formatDateTime(validationError.createdAt)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No validation errors available.
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
    </Box>
  );
}
