import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

function ChartTooltip({ active, payload, label }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: isDark ? '#0C1633' : '#fff', border: `1px solid ${payload[0]?.payload?.color}40`, borderRadius: 2, p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
      <Typography variant="caption" fontWeight={700} sx={{ color: payload[0]?.payload?.color }}>{label}</Typography>
      <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ display: 'block' }}>
        {payload[0]?.value} alerts
      </Typography>
    </Box>
  );
}

export default function AlertSummaryChart({ data }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            Alert Severity Breakdown
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Active alerts grouped by severity level
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} barSize={36}>
              <CartesianGrid
                strokeDasharray="3 3" vertical={false}
                stroke={isDark ? 'rgba(0,212,255,0.06)' : 'rgba(0,0,0,0.05)'}
              />
              <XAxis dataKey="severity" tick={{ fill: isDark ? '#7A90A8' : '#9E9E9E', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? '#7A90A8' : '#9E9E9E', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: isDark ? 'rgba(0,212,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.severity}
                    fill={entry.color}
                    style={{ filter: isDark ? `drop-shadow(0 0 8px ${entry.color}50)` : 'none' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary badges */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
          {data.map((d) => (
            <Box key={d.severity} sx={{
              px: 1.25, py: 0.5, borderRadius: 1.5,
              bgcolor: `${d.color}15`, border: `1px solid ${d.color}30`,
            }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: d.color, fontSize: '0.72rem' }}>
                {d.count} {d.severity}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
