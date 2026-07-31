import { Box, Typography, Chip } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';

export default function Dashboard() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <DashboardRoundedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Box>
          <Typography variant="h5">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            System-wide transaction monitoring overview
          </Typography>
        </Box>
        <Chip label="Live" color="success" size="small" sx={{ ml: 'auto' }} />
      </Box>

      <Box sx={{
        p: 4, borderRadius: 3, bgcolor: 'background.paper',
        border: '1px dashed', borderColor: 'divider',
        textAlign: 'center', color: 'text.secondary',
      }}>
        <Typography variant="body1">Dashboard widgets will be built here.</Typography>
        <Typography variant="caption">Feature 2 — Dashboard</Typography>
      </Box>
    </Box>
  );
}
