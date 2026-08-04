import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';

export default function NotificationCenter({ open, onClose }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Notification Center
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Live alert notifications will appear here once backend alert endpoints are available.
          </Typography>
        </Box>
        <Divider />
        <List sx={{ flex: 1 }}>
          <ListItem>
            <ListItemText
              primary="No live notifications"
              secondary="Missing backend dependency: GET /api/alerts and alert event stream"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="System status"
              secondary="Transaction, rule, and validation endpoints are active."
            />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
