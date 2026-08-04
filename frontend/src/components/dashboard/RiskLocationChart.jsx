import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

function ChartTooltip({ active, payload, label }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: isDark ? '#0C1633' : '#fff', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 2, p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
      <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ display: 'block', mb: 0.5 }}>{label}</Typography>
      {payload.map((p) => (
        <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.fill }} />
          <Typography variant="caption" color="text.secondary">{p.name}:</Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: p.fill }}>{p.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function RiskLocationChart({ data }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            Risk by Location
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Top originating countries by risk level
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }} barSize={8} barGap={2}>
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke={isDark ? 'rgba(0,212,255,0.06)' : 'rgba(0,0,0,0.05)'}
              />
              <XAxis type="number" tick={{ fill: isDark ? '#7A90A8' : '#9E9E9E', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="country" tick={{ fill: isDark ? '#7A90A8' : '#9E9E9E', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: isDark ? 'rgba(0,212,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="high"   name="High"   fill="#FF3366" radius={[0, 4, 4, 0]} style={{ filter: isDark ? 'drop-shadow(0 0 4px #FF336640)' : 'none' }} />
              <Bar dataKey="medium" name="Medium" fill="#FFB800" radius={[0, 4, 4, 0]} style={{ filter: isDark ? 'drop-shadow(0 0 4px #FFB80040)' : 'none' }} />
              <Bar dataKey="low"    name="Low"    fill="#00FF88" radius={[0, 4, 4, 0]} style={{ filter: isDark ? 'drop-shadow(0 0 4px #00FF8840)' : 'none' }} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
          {[{ color: '#FF3366', label: 'High' }, { color: '#FFB800', label: 'Medium' }, { color: '#00FF88', label: 'Low' }].map((l) => (
            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: l.color, boxShadow: isDark ? `0 0 4px ${l.color}60` : 'none' }} />
              <Typography variant="caption" color="text.secondary">{l.label} Risk</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
