import { useState, useMemo } from 'react';
import {
  Box, Grid, Typography, Button, ButtonGroup, Chip, Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReceiptLongRoundedIcon         from '@mui/icons-material/ReceiptLongRounded';
import WarningAmberRoundedIcon        from '@mui/icons-material/WarningAmberRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import FolderOpenRoundedIcon          from '@mui/icons-material/FolderOpenRounded';
import FiberManualRecordIcon          from '@mui/icons-material/FiberManualRecord';
import { useAuth }                    from '../../context/AuthContext';
import { DASHBOARD_DATA }             from '../../utils/mockData';
import KpiCard                        from '../../components/dashboard/KpiCard';
import TransactionTrendChart          from '../../components/dashboard/TransactionTrendChart';
import RiskDistributionChart          from '../../components/dashboard/RiskDistributionChart';
import RiskLocationChart              from '../../components/dashboard/RiskLocationChart';
import AlertSummaryChart              from '../../components/dashboard/AlertSummaryChart';
import RecentTransactionsTable        from '../../components/dashboard/RecentTransactionsTable';

// ─── Period filter config ─────────────────────────────────────────────────────
const PERIODS = [
  { key: 'today',  label: 'Today'     },
  { key: 'month',  label: 'This Month' },
  { key: 'days90', label: '90 Days'   },
];

// ─── Live date/time greeting ──────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function useLiveDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ─── KPI card definitions ─────────────────────────────────────────────────────
function buildKpiCards(kpi) {
  return [
    {
      title: 'Total Transactions',
      value: kpi.totalTransactions,
      trend: kpi.totalTrend,
      trendLabel: kpi.trendLabel,
      icon: ReceiptLongRoundedIcon,
      accentColor: '#00D4FF',
    },
    {
      title: 'High Risk Transactions',
      value: kpi.highRisk,
      trend: kpi.highRiskTrend,
      trendLabel: kpi.trendLabel,
      icon: WarningAmberRoundedIcon,
      accentColor: '#FF3366',
    },
    {
      title: 'Open Alerts',
      value: kpi.openAlerts,
      trend: kpi.alertsTrend,
      trendLabel: kpi.trendLabel,
      icon: NotificationsActiveRoundedIcon,
      accentColor: '#FFB800',
    },
    {
      title: 'Active Cases',
      value: kpi.activeCases,
      trend: kpi.casesTrend,
      trendLabel: kpi.trendLabel,
      icon: FolderOpenRoundedIcon,
      accentColor: '#7B2FFF',
    },
  ];
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';
  const { user } = useAuth();
  const [period, setPeriod] = useState('month');

  const data     = useMemo(() => DASHBOARD_DATA[period], [period]);
  const kpiCards = useMemo(() => buildKpiCards(data.kpi), [data.kpi]);
  const greeting = getGreeting();
  const liveDate = useLiveDate();

  return (
    <Box>

      {/* ── Header ── */}
      <Box sx={{
        display: 'flex', flexWrap: 'wrap',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2, mb: 3,
      }}>
        <Box>
          <Typography variant="h4" sx={{
            color: isDark ? '#E8EDF5' : 'text.primary',
            fontWeight: 800, letterSpacing: '-0.5px',
            mb: 0.25,
          }}>
            {greeting},{' '}
            <Box component="span" sx={{
              background: isDark
                ? 'linear-gradient(90deg, #00D4FF, #7B2FFF)'
                : 'linear-gradient(90deg, #1565C0, #0288D1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {user?.name ?? 'Admin'} 👋
            </Box>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">{liveDate}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FiberManualRecordIcon sx={{ fontSize: 8, color: '#00FF88', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
              <Typography variant="caption" sx={{ color: '#00FF88', fontWeight: 600, fontSize: '0.72rem' }}>
                All Systems Operational
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Period filter */}
        <ButtonGroup size="small" variant="outlined" sx={{ flexShrink: 0 }}>
          {PERIODS.map((p) => (
            <Button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              variant={period === p.key ? 'contained' : 'outlined'}
              sx={{
                fontWeight: 600, fontSize: '0.78rem',
                ...(period === p.key && isDark && {
                  background: 'linear-gradient(135deg, #00D4FF, #0099DD)',
                  color: '#000',
                  boxShadow: '0 0 16px rgba(0,212,255,0.4)',
                }),
                ...( period !== p.key && isDark && {
                  borderColor: 'rgba(0,212,255,0.2)', color: 'text.secondary',
                  '&:hover': { borderColor: 'rgba(0,212,255,0.5)', color: '#00D4FF', bgcolor: 'rgba(0,212,255,0.05)' },
                }),
              }}
            >
              {p.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* ── KPI Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpiCards.map((card) => (
          <Grid item xs={12} sm={6} xl={3} key={card.title}>
            <KpiCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* ── Charts Row 1: Trend + Distribution ── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} lg={8}>
          <TransactionTrendChart data={data.transactionTrend} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <RiskDistributionChart data={data.riskDistribution} />
        </Grid>
      </Grid>

      {/* ── Charts Row 2: Location + Alerts ── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={6}>
          <RiskLocationChart data={data.riskByLocation} />
        </Grid>
        <Grid item xs={12} md={6}>
          <AlertSummaryChart data={data.alertSeverity} />
        </Grid>
      </Grid>

      {/* ── Recent Transactions Table ── */}
      <RecentTransactionsTable />
    </Box>
  );
}
