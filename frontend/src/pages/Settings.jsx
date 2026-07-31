import {
  Box, Typography, Divider, Switch, FormControlLabel,
  Card, CardContent, Stack,
} from '@mui/material';
import { useThemeMode } from '../context/ThemeContext';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon  from '@mui/icons-material/DarkModeRounded';

export default function Settings() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5 }}>Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Application preferences and configuration
      </Typography>

      <Stack spacing={3} sx={{ maxWidth: 560 }}>
        {/* Appearance */}
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.8px' }}>
              Appearance
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {mode === 'light' ? <LightModeRoundedIcon color="warning" /> : <DarkModeRoundedIcon color="primary" />}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={600}>Theme Mode</Typography>
                <Typography variant="caption" color="text.secondary">
                  Currently: {mode === 'light' ? 'Light Mode' : 'Dark Mode'} — saved to preferences
                </Typography>
              </Box>
              <Switch checked={mode === 'dark'} onChange={toggleTheme} color="primary" />
            </Box>
          </CardContent>
        </Card>

        {/* Profile placeholder */}
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.8px' }}>
              Profile
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Profile management will be wired to the backend authentication system.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
