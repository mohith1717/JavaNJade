import { Box, Typography, Card, CardContent } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';

export default function Reports() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <AssessmentRoundedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Box>
          <Typography variant="h5">Reports</Typography>
          <Typography variant="body2" color="text.secondary">
            Scheduled and ad-hoc transaction monitoring reports
          </Typography>
        </Box>
      </Box>
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Report generation and scheduling will be built here.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Feature — Reports
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
