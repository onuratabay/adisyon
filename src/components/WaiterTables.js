import { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import { useOrders } from '../contexts/OrderContext';

function WaiterTables() {
  const { orders, removeItems } = useOrders();
  const [selectedTable, setSelectedTable] = useState(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  // Örnek masa listesi (gerçek uygulamada API'den gelecek)
  const tables = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    status: orders[i + 1]?.length > 0 ? 'active' : 'empty'
  }));

  const handleTableClick = (tableId) => {
    setSelectedTable(tableId);
    setShowOrderDialog(true);
  };

  const handleAddOrder = (tableId) => {
    // Menü sayfasına yönlendir
    window.location.href = `/menu/${tableId}`;
  };

  const handlePayment = (tableId) => {
    // Ödeme sayfasına yönlendir
    window.location.href = `/payment/${tableId}`;
  };

  const handleCancelTable = (tableId) => {
    if (window.confirm('Masayı iptal etmek istediğinize emin misiniz?')) {
      // Masadaki tüm siparişleri sil
      const tableOrders = orders[tableId] || [];
      const orderIds = tableOrders.map(order => order.id);
      removeItems(tableId, orderIds);
    }
  };

  const getTableTotal = (tableId) => {
    const tableOrders = orders[tableId] || [];
    return tableOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Masalar
      </Typography>

      <Grid container spacing={2}>
        {tables.map((table) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
            <Paper
              sx={{
                p: 2,
                cursor: 'pointer',
                bgcolor: table.status === 'active' ? 'primary.light' : 'background.paper',
                '&:hover': {
                  bgcolor: table.status === 'active' ? 'primary.main' : 'action.hover'
                }
              }}
              onClick={() => handleTableClick(table.id)}
            >
              <Typography variant="h6" gutterBottom>
                Masa {table.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Durum: {table.status === 'active' ? 'Dolu' : 'Boş'}
              </Typography>
              {table.status === 'active' && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Toplam: ₺{getTableTotal(table.id)}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Masa {selectedTable} - İşlemler
        </DialogTitle>
        <DialogContent>
          {orders[selectedTable]?.length > 0 ? (
            <>
              <List>
                {orders[selectedTable].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.quantity} adet - ₺${item.price * item.quantity}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => removeItems(selectedTable, [item.id])}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6" align="right" sx={{ mt: 2 }}>
                Toplam: ₺{getTableTotal(selectedTable)}
              </Typography>
            </>
          ) : (
            <Typography>Bu masada henüz sipariş bulunmuyor.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddOrder(selectedTable)}
          >
            Sipariş Ekle
          </Button>
          {orders[selectedTable]?.length > 0 && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<PaymentIcon />}
                onClick={() => handlePayment(selectedTable)}
              >
                Ödeme Al
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleCancelTable(selectedTable)}
              >
                Masayı İptal Et
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default WaiterTables; 