import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

const SHORTCUTS = [
  { keys: 'Ctrl+K', action: 'Open command palette' },
  { keys: 'Esc', action: 'Close dialog / palette' },
  { keys: 'Shift+/', action: 'Open keyboard shortcuts' },
  { keys: 'Enter', action: 'Submit focused form fields' },
];

export default function KeyboardShortcutsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Keyboard Shortcuts</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Productivity shortcuts available in the JavaNJade dashboard.
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <List>
          {SHORTCUTS.map((shortcut) => (
            <ListItem key={shortcut.keys} sx={{ px: 0 }}>
              <ListItemText
                primary={shortcut.action}
                secondary={
                  <Box component="span" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                    {shortcut.keys}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
