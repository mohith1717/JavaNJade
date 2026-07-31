import { Box, Typography } from '@mui/material';

export default function CaseManagement() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>Case Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fraud investigation cases and analyst workflow
      </Typography>
      <Box sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1">Case list, investigation timeline, notes, and resolution will be built here.</Typography>
        <Typography variant="caption">Feature 6 — Case Management</Typography>
      </Box>
    </Box>
  );
}
