import { useMemo } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: isDark ? '#0C1633' : '#fff',
      border: `1px solid ${isDark ? 'rgba(0,212,255,0.25)' : 'rgba(0,0,0,0.12)'}`,
      borderRadius: 2, p: 1.5,
      boxShadow: isDark ? '0 0 16px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.12)',
    }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{label}</Typography>
      <Typography variant="body2" fontWeight={700} sx={{ color: '#00D4FF' }}>
        {payload[0]?.value?.toLocaleString()} txns
      </Typography>
      {payload[1] && (
        <Typography variant="caption" sx={{ color: '#FF3366' }}>
          {payload[1].value} flagged
        </Typography>
      )}
    </Box>
  );
}

// ─── TransactionTrendChart ────────────────────────────────────────────────────
export default function TransactionTrendChart({ data }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Thin out labels on large datasets for readability
  const tickInterval = useMemo(() => {
    if (data.length <= 24) return 3;
    if (data.length <= 31) return 4;
    return 1;
  }, [data.length]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            Transaction Volume Trend
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Transactions and flagged activity over selected period
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00D4FF" stopOpacity={isDark ? 0.25 : 0.18} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF3366" stopOpacity={isDark ? 0.2 : 0.12} />
                  <stop offset="95%" stopColor="#FF3366" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(0,212,255,0.06)' : 'rgba(0,0,0,0.05)'}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: isDark ? '#7A90A8' : '#9E9E9E', fontSize: 11 }}
                axisLine={false} tickLine={false}
                interval={tickInterval}
              />
              <YAxis
                tick={{ fill: isDark ? '#7A90A8' : '#9E9E9E', fontSize: 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey="count" name="Transactions"
                stroke="#00D4FF" strokeWidth={2}
                fill="url(#gradCyan)" dot={false}
                activeDot={{ r: 4, fill: '#00D4FF', stroke: isDark ? '#0C1633' : '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone" dataKey="flagged" name="Flagged"
                stroke="#FF3366" strokeWidth={1.5}
                fill="url(#gradRed)" dot={false}
                activeDot={{ r: 3, fill: '#FF3366', stroke: isDark ? '#0C1633' : '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2.5, mt: 1.5 }}>
          {[{ color: '#00D4FF', label: 'Total Transactions' }, { color: '#FF3366', label: 'Flagged' }].map((l) => (
            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 12, height: 3, borderRadius: 2, bgcolor: l.color, boxShadow: `0 0 6px ${l.color}60` }} />
              <Typography variant="caption" color="text.secondary">{l.label}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
