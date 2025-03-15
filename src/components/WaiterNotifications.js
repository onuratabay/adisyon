import { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Badge,
  Drawer,
  AppBar,
  Toolbar
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useUser } from '../contexts/UserContext';

function WaiterNotifications() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { notifications, markNotificationAsRead } = useUser();
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notificationId) => {
    markNotificationAsRead(notificationId);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <IconButton color="inherit" onClick={() => setIsDrawerOpen(true)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box sx={{ width: 300 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6">
                Bildirimler
              </Typography>
            </Toolbar>
          </AppBar>

          <List>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText primary="Bildirim bulunmuyor" />
              </ListItem>
            ) : (
              notifications.map(notification => (
                <ListItem
                  key={notification.id}
                  button
                  onClick={() => handleNotificationClick(notification.id)}
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover'
                  }}
                >
                  <ListItemText
                    primary={`Masa ${notification.tableId}`}
                    secondary={formatTime(notification.timestamp)}
                  />
                  <ListItemSecondaryAction>
                    {notification.isRead && (
                      <CheckCircleIcon color="success" />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default WaiterNotifications; 