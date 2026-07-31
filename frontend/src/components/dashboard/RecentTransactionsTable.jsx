import { Box, Card, CardContent, Typography, Chip, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { RECENT_TRANSACTIONS } from '../../utils/mockData';

// ─── Risk / Status badge ──────────────────────────────────────────────────────
function StatusChip({ label, type }) {
  const theme  = useTheme();
  const badge  = theme.palette.custom.badge?.[label] ?? theme.palette.custom.badge?.[type];
  if (!badge) return <Chip label={label} size="small" />;
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: badge.bg, color: badge.color,
        fontWeight: 700, fontSize: '0.68rem',
        border: `1px solid ${badge.color}30`,
        height: 22,
      }}
    />
  );
}

// ─── Risk score bar ───────────────────────────────────────────────────────────
function RiskBar({ score }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color  = score >= 80 ? '#FF3366' : score >= 60 ? '#FFB800' : score >= 40 ? '#FF6B35' : '#00FF88';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 80 }}>
      <Box sx={{
        flex: 1, height: 5, borderRadius: 3,
        bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        <Box sx={{
          width: `${score}%`, height: '100%', borderRadius: 3,
          bgcolor: color,
          boxShadow: isDark ? `0 0 6px ${color}80` : 'none',
          transition: 'width 0.6s ease',
        }} />
      </Box>
      <Typography variant="caption" fontWeight={700} sx={{ color, minWidth: 26 }}>{score}</Typography>
    </Box>
  );
}

// ─── RecentTransactionsTable ──────────────────────────────────────────────────
export default function RecentTransactionsTable() {
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent sx={{ p: 2.5, pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              Recent Transactions
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Latest activity entering the monitoring pipeline
            </Typography>
          </Box>
          <Button
            size="small" endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />}
            onClick={() => navigate('/transactions')}
            sx={{ fontWeight: 600, fontSize: '0.78rem', color: isDark ? '#00D4FF' : 'primary.main' }}
          >
            View All
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Transaction ID', 'Account', 'Merchant', 'Amount', 'Risk Score', 'Status', 'Time'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {RECENT_TRANSACTIONS.map((tx) => (
                <TableRow
                  key={tx.id}
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'background 0.18s',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(0,212,255,0.04)' : 'rgba(0,0,0,0.02)',
                    },
                    '&:last-child td': { border: 0 },
                  }}
                >
                  <TableCell>
                    <Typography variant="caption" fontWeight={600} sx={{ color: isDark ? '#00D4FF' : 'primary.main', fontFamily: 'monospace' }}>
                      {tx.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{tx.account}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.primary" sx={{ maxWidth: 140, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.merchant}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight={700} color="text.primary">
                      {tx.currency} {tx.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell><RiskBar score={tx.riskScore} /></TableCell>
                  <TableCell><StatusChip label={tx.status} type={tx.riskLevel} /></TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{tx.time}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
