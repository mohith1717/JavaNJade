import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useQuery } from '@tanstack/react-query';
import { getAllTransactions } from '../services/transactionService';
import { exportRowsToCsv } from '../utils/exportUtils';
import { exportRowsToPdf } from '../utils/pdfExportUtils';

const PROCESSING_STATUSES = [
  'RECEIVED',
  'VALIDATING',
  'VALIDATED',
  'VALIDATION_FAILED',
  'ASSESSING_RISK',
  'ASSESSED',
  'REVIEW_REQUIRED',
  'APPROVED',
  'FAILED',
];

const RISK_LEVELS = ['PENDING', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

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

function SummaryCard({ title, value, subtitle, icon: Icon, accent }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.75, fontWeight: 800, lineHeight: 1 }}>
              {value}
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

export default function Transactions() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const transactionsQuery = useQuery({
    queryKey: ['transactions', 'all'],
    queryFn: () => getAllTransactions(),
    staleTime: 60 * 1000,
  });

  const transactions = Array.isArray(transactionsQuery.data)
    ? transactionsQuery.data
    : [];
  const loading = transactionsQuery.isPending;
  const error = transactionsQuery.error?.message ?? '';

  const refreshTransactions = async () => {
    setRefreshing(true);
    await transactionsQuery.refetch();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const total = transactions.length;
    const validationFailed = transactions.filter((transaction) => transaction.processingStatus === 'VALIDATION_FAILED').length;
    const highRisk = transactions.filter((transaction) => ['HIGH', 'CRITICAL'].includes(transaction.riskLevel)).length;
    const pendingRisk = transactions.filter((transaction) => transaction.riskLevel === 'PENDING').length;

    return { total, validationFailed, highRisk, pendingRisk };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    let data = [...transactions];

    if (query) {
      data = data.filter((transaction) => {
        return [
          transaction.externalTransactionId,
          transaction.senderAccountId,
          transaction.receiverAccountId,
          transaction.currency,
          transaction.processingStatus,
          transaction.riskLevel,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
    }

    if (statusFilter !== 'ALL') {
      data = data.filter((transaction) => transaction.processingStatus === statusFilter);
    }

    if (riskFilter !== 'ALL') {
      data = data.filter((transaction) => transaction.riskLevel === riskFilter);
    }

    data.sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];
      let comparison = 0;

      if (sortKey === 'amount') {
        comparison = Number(leftValue ?? 0) - Number(rightValue ?? 0);
      } else if (sortKey.includes('At')) {
        comparison = new Date(leftValue ?? 0).getTime() - new Date(rightValue ?? 0).getTime();
      } else {
        comparison = String(leftValue ?? '').localeCompare(String(rightValue ?? ''));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return data;
  }, [transactions, riskFilter, search, sortDirection, sortKey, statusFilter]);

  const visibleTransactions = filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const hasFilters = search || statusFilter !== 'ALL' || riskFilter !== 'ALL';

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
      { key: 'occurredAt', label: 'Occurred At' },
      { key: 'createdAt', label: 'Created At' },
    ];

    exportRowsToCsv(
      'transactions-report.csv',
      columns,
      filteredTransactions
    );
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
      { key: 'occurredAt', label: 'Occurred At' },
      { key: 'createdAt', label: 'Created At' },
    ];

    exportRowsToPdf('transactions-report.pdf', 'Transactions Report', columns, filteredTransactions);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.4px' }}>
            Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Live transaction records, statuses, and risk signals from the backend.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={handleExportCsv}
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            sx={{ alignSelf: 'center' }}
            disabled={!filteredTransactions.length}
          >
            Export CSV
          </Button>
          <Button
            onClick={handleExportPdf}
            variant="outlined"
            startIcon={<PictureAsPdfRoundedIcon />}
            sx={{ alignSelf: 'center' }}
            disabled={!filteredTransactions.length}
          >
            Export PDF
          </Button>
          <Button
            onClick={refreshTransactions}
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshRoundedIcon />}
            sx={{ alignSelf: 'center' }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} xl={3}>
          <SummaryCard title="Total Transactions" value={stats.total.toLocaleString()} subtitle="Fetched from /api/transactions" icon={ReceiptLongRoundedIcon} accent="#00D4FF" />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <SummaryCard title="Validation Failed" value={stats.validationFailed.toLocaleString()} subtitle="Processing status = VALIDATION_FAILED" icon={WarningAmberRoundedIcon} accent="#FF3366" />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <SummaryCard title="High Risk" value={stats.highRisk.toLocaleString()} subtitle="HIGH and CRITICAL risk levels" icon={QueryStatsRoundedIcon} accent="#FF6B35" />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <SummaryCard title="Pending Risk" value={stats.pendingRisk.toLocaleString()} subtitle="Transactions awaiting risk assessment" icon={PendingActionsRoundedIcon} accent="#FFB800" />
        </Grid>
      </Grid>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems={{ lg: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by transaction ID, sender, receiver, status, or currency"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: { lg: 320 } }}
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Processing Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Processing Status"
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="ALL">All statuses</MenuItem>
                  {PROCESSING_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={riskFilter}
                  label="Risk Level"
                  onChange={(event) => {
                    setRiskFilter(event.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="ALL">All levels</MenuItem>
                  {RISK_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {hasFilters ? (
                <Button
                  variant="text"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('ALL');
                    setRiskFilter('ALL');
                    setPage(0);
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </Stack>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">
                Sorting and pagination are applied client-side because the backend currently returns the full collection.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredTransactions.length.toLocaleString()} result{filteredTransactions.length === 1 ? '' : 's'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {error ? (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      ) : null}

      <Card>
        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table size="small" sx={{ minWidth: 980 }}>
            <TableHead>
              <TableRow>
                {[
                  ['externalTransactionId', 'Transaction ID'],
                  ['senderAccountId', 'Sender Account'],
                  ['receiverAccountId', 'Receiver Account'],
                  ['amount', 'Amount'],
                  ['processingStatus', 'Status'],
                  ['riskLevel', 'Risk'],
                  ['occurredAt', 'Occurred At'],
                  ['createdAt', 'Created At'],
                ].map(([key, label]) => (
                  <TableCell
                    key={key}
                    onClick={() => handleSort(key)}
                    sx={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      fontWeight: 700,
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton variant="text" width="90%" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : visibleTransactions.length ? (
                visibleTransactions.map((transaction) => {
                  const statusColor = getStatusColor(transaction.processingStatus, theme);
                  const riskColor = getRiskColor(transaction.riskLevel, theme);

                  return (
                    <TableRow
                      key={transaction.id}
                      hover
                      onClick={() => navigate(`/transactions/${transaction.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{transaction.externalTransactionId}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{transaction.senderAccountId}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{transaction.receiverAccountId}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.processingStatus}
                          size="small"
                          sx={{
                            bgcolor: `${statusColor}15`,
                            color: statusColor,
                            border: `1px solid ${statusColor}30`,
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.riskLevel}
                          size="small"
                          sx={{
                            bgcolor: `${riskColor}15`,
                            color: riskColor,
                            border: `1px solid ${riskColor}30`,
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatDateTime(transaction.occurredAt)}</TableCell>
                      <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        No transactions found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try clearing the filters or create a new transaction in the backend.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredTransactions.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
    </Box>
  );
}
