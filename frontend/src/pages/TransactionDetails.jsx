import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
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
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import { getTransactionById, getTransactionFundFlow, getTransactionRoute, getTransactionValidationErrors } from '../services/transactionService';

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

function SectionCard({ title, icon: Icon, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
            <Icon sx={{ fontSize: 20, color: 'primary.main' }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontFamily: mono ? 'monospace' : 'inherit', fontWeight: 600 }}>
        {value ?? 'N/A'}
      </Typography>
    </Box>
  );
}

export default function TransactionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [transaction, setTransaction] = useState(null);
  const [route, setRoute] = useState([]);
  const [fundFlow, setFundFlow] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [transactionData, routeData, fundFlowData, validationData] = await Promise.all([
          getTransactionById(id),
          getTransactionRoute(id),
          getTransactionFundFlow(id),
          getTransactionValidationErrors(id),
        ]);

        setTransaction(transactionData);
        setRoute(Array.isArray(routeData) ? routeData : []);
        setFundFlow(fundFlowData ?? null);
        setValidationErrors(Array.isArray(validationData) ? validationData : []);
      } catch (exception) {
        setError(exception?.message ?? 'Unable to load transaction details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      void load();
    }
  }, [id]);

  const statusColor = useMemo(() => getStatusColor(transaction?.processingStatus, theme), [theme, transaction?.processingStatus]);
  const riskColor = useMemo(() => getRiskColor(transaction?.riskLevel, theme), [theme, transaction?.riskLevel]);

  if (loading) {
    return (
      <Stack spacing={2.5}>
        <Skeleton variant="rectangular" height={72} sx={{ borderRadius: 2 }} />
        <Grid container spacing={2.5}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2.5 }}>
        {error}
      </Alert>
    );
  }

  if (!transaction) {
    return (
      <Alert severity="warning">
        Transaction not found.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/transactions')}
            variant="text"
            sx={{ px: 0, mb: 1 }}
          >
            Back to transactions
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.4px', fontFamily: 'monospace' }}>
            {transaction.externalTransactionId}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Transaction {transaction.id} · Created {formatDateTime(transaction.createdAt)}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={transaction.processingStatus} sx={{ bgcolor: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30`, fontWeight: 700 }} />
          <Chip label={transaction.riskLevel} sx={{ bgcolor: `${riskColor}15`, color: riskColor, border: `1px solid ${riskColor}30`, fontWeight: 700 }} />
        </Stack>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <SectionCard title="Amount" icon={ReceiptLongRoundedIcon}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {formatCurrency(transaction.amount, transaction.currency)}
            </Typography>
            <DetailRow label="Currency" value={transaction.currency} />
          </SectionCard>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SectionCard title="Risk" icon={WarningAmberRoundedIcon}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: riskColor, mb: 1 }}>
              {transaction.riskLevel}
            </Typography>
            <DetailRow label="Risk score" value={transaction.riskScore ?? 'Pending'} />
          </SectionCard>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SectionCard title="Validation" icon={FactCheckRoundedIcon}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {transaction.processingStatus}
            </Typography>
            <DetailRow label="Occurred at" value={formatDateTime(transaction.occurredAt)} />
          </SectionCard>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SectionCard title="Route Hops" icon={RouteRoundedIcon}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {route.length || fundFlow?.totalHops || 0}
            </Typography>
            <DetailRow label="Backend route rows" value={route.length ? 'Available' : 'No route returned'} />
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <SectionCard title="Transaction Record" icon={ReceiptLongRoundedIcon}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><DetailRow label="Transaction ID" value={transaction.id} mono /></Grid>
              <Grid item xs={12} sm={6}><DetailRow label="External Transaction ID" value={transaction.externalTransactionId} mono /></Grid>
              <Grid item xs={12} sm={6}><DetailRow label="Sender Account" value={transaction.senderAccountId} mono /></Grid>
              <Grid item xs={12} sm={6}><DetailRow label="Receiver Account" value={transaction.receiverAccountId} mono /></Grid>
              <Grid item xs={12} sm={6}><DetailRow label="Amount" value={formatCurrency(transaction.amount, transaction.currency)} /></Grid>
              <Grid item xs={12} sm={6}><DetailRow label="Processing Status" value={transaction.processingStatus} /></Grid>
              <Grid item xs={12} sm={6}><DetailRow label="Risk Level" value={transaction.riskLevel} /></Grid>
              <Grid item xs={12} sm={6}><DetailRow label="Risk Score" value={transaction.riskScore ?? 'Pending'} /></Grid>
              <Grid item xs={12} sm={6}><DetailRow label="Occurred At" value={formatDateTime(transaction.occurredAt)} /></Grid>
              <Grid item xs={12} sm={6}><DetailRow label="Created At" value={formatDateTime(transaction.createdAt)} /></Grid>
            </Grid>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard title="Fund Flow" icon={TravelExploreRoundedIcon}>
            {fundFlow ? (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={6}><DetailRow label="Origin Country" value={fundFlow.originCountry?.countryName ?? 'N/A'} /></Grid>
                  <Grid item xs={6}><DetailRow label="Destination Country" value={fundFlow.destinationCountry?.countryName ?? 'N/A'} /></Grid>
                  <Grid item xs={6}><DetailRow label="Total Hops" value={fundFlow.totalHops} /></Grid>
                  <Grid item xs={6}><DetailRow label="Risk Level" value={fundFlow.riskLevel ?? 'PENDING'} /></Grid>
                </Grid>
                <Divider />
                <Stack spacing={1.5}>
                  {Array.isArray(fundFlow.route) && fundFlow.route.length ? fundFlow.route.map((hop) => (
                    <Paper key={hop.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {hop.sequence}. {hop.institution}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {hop.countryCode} · {hop.countryName}
                          </Typography>
                        </Box>
                        <Chip size="small" label={hop.hopType} />
                      </Stack>
                    </Paper>
                  )) : (
                    <Typography variant="body2" color="text.secondary">
                      No route information available.
                    </Typography>
                  )}
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No fund-flow data returned by the backend.
              </Typography>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard title="Route" icon={RouteRoundedIcon}>
            {route.length ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sequence</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell>Institution</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {route.map((hop) => (
                      <TableRow key={hop.id}>
                        <TableCell>{hop.sequence}</TableCell>
                        <TableCell>{hop.countryCode}</TableCell>
                        <TableCell>{hop.institution}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">This transaction has no stored route rows.</Alert>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard title="Validation Errors" icon={TuneRoundedIcon}>
            {validationErrors.length ? (
              <Stack spacing={1.25}>
                {validationErrors.map((validationError) => (
                  <Paper key={validationError.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {validationError.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {validationError.field}: {validationError.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(validationError.createdAt)}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Alert severity="success">No validation errors were recorded for this transaction.</Alert>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
