import { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useOrders } from '../contexts/OrderContext';

function PaymentScreen() {
  const location = useLocation();
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { orders, removeItems } = useOrders();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const tableOrders = orders[tableId] || [];
  
  // Siparişleri müşteri bazlı gruplama
  const groupedOrders = tableOrders.reduce((acc, order) => {
    const customerName = order.customerName || 'Bilinmeyen';
    if (!acc[customerName]) {
      acc[customerName] = [];
    }
    acc[customerName].push(order);
    return acc;
  }, {});

  const totalAmount = tableOrders
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const fullAmount = tableOrders
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleToggleItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === tableOrders.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(tableOrders.map(item => item.id));
    }
  };

  const handlePayment = () => {
    if (selectedItems.length === 0) {
      alert('Lütfen ödemek istediğiniz ürünleri seçin');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmPayment = () => {
    removeItems(tableId, selectedItems);
    setShowConfirmation(false);
    navigate(`/table/${tableId}`);
  };

  return (
    <Box sx={{ pb: 7 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(`/table/${tableId}`)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Adisyon
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 3 }}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              RESTAURANT ADI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adres: Restaurant Adresi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tel: (555) 123-4567
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Masa {tableId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tarih: {new Date().toLocaleDateString('tr-TR')}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Siparişler
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSelectAll}
            >
              {selectedItems.length === tableOrders.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
            </Button>
          </Box>

          <Box sx={{ 
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: 1,
            mb: 2
          }}>
            {Object.entries(groupedOrders).map(([customerName, items]) => (
              <Box key={customerName} sx={{ '&:not(:last-child)': { borderBottom: '1px solid rgba(0, 0, 0, 0.12)' } }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    bgcolor: 'background.default',
                    p: 1,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    fontWeight: 'bold'
                  }}
                >
                  {customerName}
                </Typography>
                <Box sx={{ p: 1 }}>
                  {items.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 0.5,
                        '&:not(:last-child)': { mb: 1 }
                      }}
                    >
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleToggleItem(item.id)}
                        size="small"
                      />
                      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', ml: 1 }}>
                        <Box>
                          <Typography variant="body2">
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.quantity} x ₺{item.price}
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          ₺{item.price * item.quantity}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Toplam Tutar:
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ₺{fullAmount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Seçili Tutar:
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ₺{totalAmount}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Ödenecek:
              </Typography>
              <Typography variant="h6">
                ₺{totalAmount}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handlePayment}
          sx={{ mb: 2 }}
        >
          Ödemeyi Tamamla
        </Button>

        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center" 
          display="block"
        >
          * Fiyatlara KDV dahildir.
        </Typography>
      </Container>

      <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <DialogTitle>Ödeme Onayı</DialogTitle>
        <DialogContent>
          <Typography>
            ₺{totalAmount} tutarındaki ödemeyi onaylıyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)}>İptal</Button>
          <Button onClick={confirmPayment} variant="contained" color="primary">
            Onayla
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PaymentScreen; 