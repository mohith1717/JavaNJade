import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';

export default function IntegrationPlaceholder({
  title,
  description,
  missingDependencies = [],
  implementedEndpoints = [],
}) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>

          <Alert severity="info" icon={<LinkRoundedIcon fontSize="inherit" />}>
            This module is API-gated. No mock records are rendered.
          </Alert>

          {implementedEndpoints.length ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Available backend endpoints
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {implementedEndpoints.map((endpoint) => (
                  <Chip key={endpoint} label={endpoint} size="small" color="success" variant="outlined" />
                ))}
              </Stack>
            </Box>
          ) : null}

          {missingDependencies.length ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Missing backend dependencies
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {missingDependencies.map((dependency) => (
                  <Chip key={dependency} label={dependency} size="small" color="warning" variant="outlined" />
                ))}
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
