import { Box, Typography } from '@mui/material';

export default function Analytics() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>Analytics</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Transaction, alert, and fraud trend analysis
      </Typography>
      <Box sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">Charts: Transaction Trend, Alert Trend, Fraud Distribution, Risk Distribution will be built here.</Typography>
        <Typography variant="caption">Feature 7 — Analytics</Typography>
      </Box>
    </Box>
  );
}
