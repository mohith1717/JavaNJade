import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
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
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { changeRuleStatus, getAllRules } from '../services/ruleService';
import { exportRowsToCsv } from '../utils/exportUtils';
import { exportRowsToPdf } from '../utils/pdfExportUtils';

const RULE_TYPES = [
  'HIGH_AMOUNT',
  'HIGH_RISK_COUNTRY',
  'EXCESSIVE_ROUTE_HOPS',
  'RAPID_TRANSACTIONS',
  'STRUCTURING',
];

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function formatDateTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function getSeverityColor(severity, theme) {
  const isDark = theme.palette.mode === 'dark';
  switch (severity) {
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

function StatusBadge({ enabled, theme }) {
  const color = enabled ? (theme.palette.mode === 'dark' ? '#00FF88' : '#1B5E20') : '#7A90A8';
  return (
    <Chip
      size="small"
      label={enabled ? 'Enabled' : 'Disabled'}
      sx={{
        bgcolor: `${color}15`,
        color,
        border: `1px solid ${color}30`,
        fontWeight: 700,
      }}
    />
  );
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

function DetailRow({ label, value, mono = false }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontFamily: mono ? 'monospace' : 'inherit', fontWeight: 600, wordBreak: 'break-word' }}>
        {value ?? 'N/A'}
      </Typography>
    </Box>
  );
}

export default function RuleEngine() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [enabledFilter, setEnabledFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailsRule, setDetailsRule] = useState(null);
  const [pendingStatusRule, setPendingStatusRule] = useState(null);
  const [pendingEnabled, setPendingEnabled] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const rulesQuery = useQuery({
    queryKey: ['rules', 'all'],
    queryFn: () => getAllRules(),
    staleTime: 60 * 1000,
  });

  const rules = Array.isArray(rulesQuery.data) ? rulesQuery.data : [];
  const loading = rulesQuery.isPending;
  const error = rulesQuery.error?.message ?? '';

  const refreshRules = async () => {
    setRefreshing(true);
    await rulesQuery.refetch();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const total = rules.length;
    const enabled = rules.filter((rule) => rule.enabled).length;
    const highPriority = rules.filter((rule) => ['HIGH', 'CRITICAL'].includes(rule.severity)).length;
    const disabled = total - enabled;

    return { total, enabled, highPriority, disabled };
  }, [rules]);

  const filteredRules = useMemo(() => {
    const query = search.trim().toLowerCase();
    let data = [...rules];

    if (query) {
      data = data.filter((rule) => {
        return [rule.code, rule.name, rule.type, rule.severity]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
    }

    if (typeFilter !== 'ALL') {
      data = data.filter((rule) => rule.type === typeFilter);
    }

    if (enabledFilter !== 'ALL') {
      const enabled = enabledFilter === 'ENABLED';
      data = data.filter((rule) => rule.enabled === enabled);
    }

    data.sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];
      let comparison = 0;

      if (sortKey === 'riskWeight') {
        comparison = Number(leftValue ?? 0) - Number(rightValue ?? 0);
      } else if (sortKey.includes('At')) {
        comparison = new Date(leftValue ?? 0).getTime() - new Date(rightValue ?? 0).getTime();
      } else if (typeof leftValue === 'boolean') {
        comparison = Number(leftValue) - Number(rightValue);
      } else {
        comparison = String(leftValue ?? '').localeCompare(String(rightValue ?? ''));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return data;
  }, [enabledFilter, search, rules, sortDirection, sortKey, typeFilter]);

  const visibleRules = filteredRules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const hasFilters = search || typeFilter !== 'ALL' || enabledFilter !== 'ALL';

  const handleExportCsv = () => {
    const columns = [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'severity', label: 'Severity' },
      { key: 'riskWeight', label: 'Risk Weight' },
      { key: 'enabled', label: 'Enabled' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'updatedAt', label: 'Updated At' },
    ];

    exportRowsToCsv('rules-report.csv', columns, filteredRules);
  };

  const handleExportPdf = () => {
    const columns = [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'severity', label: 'Severity' },
      { key: 'riskWeight', label: 'Risk Weight' },
      { key: 'enabled', label: 'Enabled' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'updatedAt', label: 'Updated At' },
    ];

    exportRowsToPdf('rules-report.pdf', 'Monitoring Rules Report', columns, filteredRules);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const handleToggleRule = async () => {
    if (!pendingStatusRule) return;

    try {
      const updated = await changeRuleStatus(pendingStatusRule.id, pendingEnabled);
      queryClient.setQueryData(['rules', 'all'], (current = []) =>
        current.map((rule) => (rule.id === updated.id ? updated : rule))
      );
      setSnackbar({
        open: true,
        message: `Rule ${updated.code} ${updated.enabled ? 'enabled' : 'disabled'} successfully.`,
        severity: 'success',
      });
      setPendingStatusRule(null);
      setPendingEnabled(null);
    } catch (exception) {
      setSnackbar({
        open: true,
        message: exception?.message ?? 'Failed to update rule status.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.4px' }}>
            Rule Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage live monitoring rules returned by the backend.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={handleExportCsv}
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            disabled={!filteredRules.length}
          >
            Export CSV
          </Button>
          <Button
            onClick={handleExportPdf}
            variant="outlined"
            startIcon={<PictureAsPdfRoundedIcon />}
            disabled={!filteredRules.length}
          >
            Export PDF
          </Button>
          <Button
            onClick={refreshRules}
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <TuneRoundedIcon />}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} xl={3}>
          <SummaryCard title="Total Rules" value={stats.total.toLocaleString()} subtitle="Fetched from /api/rules" icon={TuneRoundedIcon} accent="#00D4FF" />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <SummaryCard title="Enabled Rules" value={stats.enabled.toLocaleString()} subtitle="Currently active in the engine" icon={BoltRoundedIcon} accent="#00FF88" />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <SummaryCard title="High Priority" value={stats.highPriority.toLocaleString()} subtitle="HIGH and CRITICAL severities" icon={InfoRoundedIcon} accent="#FF6B35" />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <SummaryCard title="Disabled Rules" value={stats.disabled.toLocaleString()} subtitle="Available for manual reactivation" icon={PowerSettingsNewRoundedIcon} accent="#FF3366" />
        </Grid>
      </Grid>

      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems={{ lg: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by rule code, name, type, or severity"
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
                <InputLabel>Rule Type</InputLabel>
                <Select value={typeFilter} label="Rule Type" onChange={(event) => { setTypeFilter(event.target.value); setPage(0); }}>
                  <MenuItem value="ALL">All types</MenuItem>
                  {RULE_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Enabled</InputLabel>
                <Select value={enabledFilter} label="Enabled" onChange={(event) => { setEnabledFilter(event.target.value); setPage(0); }}>
                  <MenuItem value="ALL">All rules</MenuItem>
                  <MenuItem value="ENABLED">Enabled</MenuItem>
                  <MenuItem value="DISABLED">Disabled</MenuItem>
                </Select>
              </FormControl>
              {hasFilters ? (
                <Button
                  variant="text"
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('ALL');
                    setEnabledFilter('ALL');
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
                Status changes require confirmation and update the backend rule record directly.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredRules.length.toLocaleString()} result{filteredRules.length === 1 ? '' : 's'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {error ? <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert> : null}

      <Card>
        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
          <Table size="small" sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow>
                {[
                  ['code', 'Code'],
                  ['name', 'Name'],
                  ['type', 'Type'],
                  ['severity', 'Severity'],
                  ['riskWeight', 'Risk Weight'],
                  ['enabled', 'Status'],
                  ['createdAt', 'Created'],
                  ['updatedAt', 'Updated'],
                  ['', 'Actions'],
                ].map(([key, label]) => (
                  <TableCell
                    key={label}
                    onClick={key ? () => handleSort(key) : undefined}
                    sx={{
                      cursor: key ? 'pointer' : 'default',
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
                    {Array.from({ length: 9 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton variant="text" width="90%" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : visibleRules.length ? (
                visibleRules.map((rule) => {
                  const severityColor = getSeverityColor(rule.severity, theme);
                  return (
                    <TableRow key={rule.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDetailsRule(rule)}>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{rule.code}</TableCell>
                      <TableCell>{rule.name}</TableCell>
                      <TableCell>{rule.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={rule.severity}
                          size="small"
                          sx={{
                            bgcolor: `${severityColor}15`,
                            color: severityColor,
                            border: `1px solid ${severityColor}30`,
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>{rule.riskWeight}</TableCell>
                      <TableCell>
                        <StatusBadge enabled={rule.enabled} theme={theme} />
                      </TableCell>
                      <TableCell>{formatDateTime(rule.createdAt)}</TableCell>
                      <TableCell>{formatDateTime(rule.updatedAt)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={!!rule.enabled}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => {
                            event.stopPropagation();
                            setPendingStatusRule(rule);
                            setPendingEnabled(event.target.checked);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        No rules found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try clearing the filters or create a new rule from the backend.
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
          count={filteredRules.length}
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

      <Dialog open={!!pendingStatusRule} onClose={() => { setPendingStatusRule(null); setPendingEnabled(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm rule status change</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {pendingStatusRule ? `Change ${pendingStatusRule.code} to ${pendingEnabled ? 'Enabled' : 'Disabled'}?` : null}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPendingStatusRule(null); setPendingEnabled(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleToggleRule}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!detailsRule} onClose={() => setDetailsRule(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          Rule Details
        </DialogTitle>
        <DialogContent dividers>
          {detailsRule ? (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><DetailRow label="Code" value={detailsRule.code} mono /></Grid>
                <Grid item xs={12} md={6}><DetailRow label="Name" value={detailsRule.name} /></Grid>
                <Grid item xs={12} md={6}><DetailRow label="Type" value={detailsRule.type} /></Grid>
                <Grid item xs={12} md={6}><DetailRow label="Severity" value={detailsRule.severity} /></Grid>
                <Grid item xs={12} md={6}><DetailRow label="Risk Weight" value={detailsRule.riskWeight} /></Grid>
                <Grid item xs={12} md={6}><DetailRow label="Enabled" value={detailsRule.enabled ? 'Yes' : 'No'} /></Grid>
                <Grid item xs={12} md={6}><DetailRow label="Created" value={formatDateTime(detailsRule.createdAt)} /></Grid>
                <Grid item xs={12} md={6}><DetailRow label="Updated" value={formatDateTime(detailsRule.updatedAt)} /></Grid>
              </Grid>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Parameters
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {JSON.stringify(detailsRule.parameters, null, 2)}
                  </Box>
                </Paper>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsRule(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}
