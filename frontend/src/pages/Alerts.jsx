import { Box, Typography } from '@mui/material';

export default function Alerts() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>Alerts</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        System-generated fraud alerts
      </Typography>
      <Box sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">Alert table, severity filters, and analyst assignment will be built here.</Typography>
        <Typography variant="caption">Feature 5 — Alerts</Typography>
      </Box>
    </Box>
  );
}
