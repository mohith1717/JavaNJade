import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TrendingUpRoundedIcon   from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

// ─── KpiCard ──────────────────────────────────────────────────────────────────
// Props:
//   title      — metric label
//   value      — formatted display value (string or number)
//   trend      — numeric % change (positive = up, negative = down)
//   trendLabel — "vs yesterday" etc.
//   icon       — MUI icon component
//   accentColor — neon accent hex (#00D4FF etc.)
// ─────────────────────────────────────────────────────────────────────────────
export default function KpiCard({ title, value, trend, trendLabel, icon: Icon, accentColor }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isUp   = trend >= 0;

  return (
    <Card sx={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      // Coloured top border accent
      '&::before': {
        content: '""',
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        borderRadius: '16px 16px 0 0',
      },
    }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>

        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase', letterSpacing: '0.9px',
              fontWeight: 700, color: 'text.secondary', fontSize: '0.67rem',
              lineHeight: 1,
            }}
          >
            {title}
          </Typography>

          {/* Icon bubble */}
          <Box sx={{
            width: 38, height: 38, borderRadius: 2, flexShrink: 0,
            bgcolor: isDark ? `${accentColor}18` : `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isDark ? `0 0 12px ${accentColor}20` : 'none',
          }}>
            <Icon sx={{ color: accentColor, fontSize: 20 }} />
          </Box>
        </Box>

        {/* Value */}
        <Typography sx={{
          fontSize: '2rem', fontWeight: 800, lineHeight: 1,
          color: isDark ? '#E8EDF5' : 'text.primary',
          letterSpacing: '-1px',
          textShadow: isDark ? `0 0 20px ${accentColor}30` : 'none',
          mb: 1.5,
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>

        {/* Trend row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isUp
            ? <TrendingUpRoundedIcon   sx={{ fontSize: 15, color: isDark ? '#00FF88' : '#2E7D32' }} />
            : <TrendingDownRoundedIcon sx={{ fontSize: 15, color: isDark ? '#FF3366' : '#D32F2F' }} />
          }
          <Typography variant="caption" sx={{
            fontWeight: 700, fontSize: '0.75rem',
            color: isUp
              ? (isDark ? '#00FF88' : '#2E7D32')
              : (isDark ? '#FF3366' : '#D32F2F'),
          }}>
            {isUp ? '+' : ''}{trend?.toFixed(1)}%
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
            {trendLabel}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
