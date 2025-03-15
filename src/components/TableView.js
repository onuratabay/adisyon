import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WifiIcon from '@mui/icons-material/Wifi';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useUser } from '../contexts/UserContext';

function TableView() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useUser();
  const [showCallWaiterSuccess, setShowCallWaiterSuccess] = useState(false);

  const handleWifiConnect = () => {
    window.open('https://www.google.com', '_blank'); // Şimdilik Google'a yönlendir
  };

  const handleCallWaiter = () => {
    addNotification(tableId, 'waiter_call');
    setShowCallWaiterSuccess(true);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
            Masa {tableId}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<MenuBookIcon />}
            onClick={() => navigate(`/menu/${tableId}`)}
          >
            Menüyü Görüntüle
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<ReceiptIcon />}
            onClick={() => navigate(`/bill/${tableId}`)}
          >
            Adisyonu Görüntüle
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<WifiIcon />}
            onClick={handleWifiConnect}
            sx={{ mt: 2 }}
          >
            WiFi'ya Bağlan
          </Button>

          <Button
            variant="outlined"
            size="large"
            color="secondary"
            startIcon={<NotificationsIcon />}
            onClick={handleCallWaiter}
          >
            Garson Çağır
          </Button>
        </Box>

        <Snackbar
          open={showCallWaiterSuccess}
          autoHideDuration={3000}
          onClose={() => setShowCallWaiterSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setShowCallWaiterSuccess(false)}>
            Garson çağrınız iletildi!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default TableView; 