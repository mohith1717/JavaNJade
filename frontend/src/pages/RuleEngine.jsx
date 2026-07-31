import { Box, Typography } from '@mui/material';

export default function RuleEngine() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>Rule Engine</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fraud detection rules — view, create, and manage
      </Typography>
      <Box sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">Rule table, severity, type, and rule upsert form will be built here.</Typography>
        <Typography variant="caption">Feature 8 — Rule Engine</Typography>
      </Box>
    </Box>
  );
}
