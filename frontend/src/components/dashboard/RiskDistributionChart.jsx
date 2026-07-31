import { Box, Card, CardContent, Typography, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function ChartTooltip({ active, payload }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <Box sx={{ bgcolor: isDark ? '#0C1633' : '#fff', border: `1px solid ${d.payload.color}40`, borderRadius: 2, p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
      <Typography variant="caption" fontWeight={700} sx={{ color: d.payload.color }}>{d.name}</Typography>
      <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ display: 'block' }}>
        {d.value.toLocaleString()}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {((d.value / payload.reduce((s, p) => s + p.payload.value, 0)) * 100 || 0).toFixed(1)}%
      </Typography>
    </Box>
  );
}

export default function RiskDistributionChart({ data }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const total  = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            Risk Distribution
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Breakdown by risk level
          </Typography>
        </Box>

        {/* Donut chart with centre label */}
        <Box sx={{ position: 'relative', flex: 1, minHeight: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltip />} />
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius="55%" outerRadius="78%"
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    style={{ filter: isDark ? `drop-shadow(0 0 6px ${entry.color}60)` : 'none' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centre total */}
          <Box sx={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: isDark ? '#E8EDF5' : 'text.primary', lineHeight: 1 }}>
              {total.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total
            </Typography>
          </Box>
        </Box>

        {/* Legend */}
        <Stack spacing={0.75} sx={{ mt: 2 }}>
          {data.map((d) => {
            const pct = total ? ((d.value / total) * 100).toFixed(1) : 0;
            return (
              <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  bgcolor: d.color,
                  boxShadow: isDark ? `0 0 6px ${d.color}80` : 'none',
                }} />
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>{d.name}</Typography>
                <Typography variant="caption" fontWeight={700} sx={{ color: d.color }}>{pct}%</Typography>
                <Typography variant="caption" color="text.secondary">{d.value.toLocaleString()}</Typography>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
