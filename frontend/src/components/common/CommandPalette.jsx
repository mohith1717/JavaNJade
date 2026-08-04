import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { NAV_ITEMS } from '../../config/navConfig';
import { useAuth } from '../../context/AuthContext';

const EXTRA_COMMANDS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Go to overview page',
    path: '/',
    icon: DashboardRoundedIcon,
    keywords: ['home', 'overview', 'kpi'],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Open application settings',
    path: '/settings',
    icon: SettingsRoundedIcon,
    keywords: ['preferences', 'theme', 'profile'],
  },
];

function buildCommands(userRole) {
  const navCommands = NAV_ITEMS
    .filter((item) => {
      if (!Array.isArray(item.roles) || item.roles.length === 0) return true;
      return !!userRole && item.roles.includes(userRole);
    })
    .map((item) => ({
    id: item.path,
    label: item.label,
    description: `Open ${item.label}`,
    path: item.path,
    icon: item.icon,
    keywords: [item.label.toLowerCase(), item.path.replace('/', '')],
    }));

  return [...EXTRA_COMMANDS, ...navCommands];
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const commands = useMemo(() => buildCommands(user?.role), [user?.role]);

  const filteredCommands = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return commands;

    return commands.filter((command) => {
      const searchFields = [
        command.label,
        command.description,
        command.path,
        ...(command.keywords ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchFields.includes(trimmedQuery);
    });
  }, [commands, query]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleCommandSelect = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            autoFocus
            fullWidth
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands or routes"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.25 }}>
            <Typography variant="caption" color="text.secondary">
              Quick command palette
            </Typography>
            <Chip label="Ctrl+K" size="small" />
          </Box>
        </Box>

        <Divider />

        <List sx={{ py: 0, maxHeight: 360, overflowY: 'auto' }}>
          {filteredCommands.length ? (
            filteredCommands.map((command) => {
              const Icon = command.icon;
              return (
                <ListItemButton key={command.id} onClick={() => handleCommandSelect(command.path)} sx={{ py: 1.2 }}>
                  <ListItemIcon sx={{ minWidth: 34 }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={command.label}
                    secondary={command.description}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    {command.path}
                  </Typography>
                </ListItemButton>
              );
            })
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                No commands found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Try searching by route or page name.
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
}
