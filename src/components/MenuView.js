import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Paper,
  Button,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../contexts/OrderContext';

const menuItems = {
  'Ana Yemekler': [
    { 
      id: 1, 
      name: 'Pizza Margherita', 
      price: 120,
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143',
      description: 'Domates sosu, mozarella peyniri, fesleğen',
      model: '/models/pizza.glb',
      modelScale: '0.3 0.3 0.3',
      modelRotation: '0 0 0'
    },
    { 
      id: 2, 
      name: 'Hamburger', 
      price: 95,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      description: 'Dana eti, cheddar peyniri, marul, domates',
      model: '/models/burger.gltf',
      modelScale: 0.7,
      modelRotation: [0, 0, 0]
    },
    { 
      id: 3, 
      name: 'Köfte', 
      price: 110,
      image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468',
      description: 'El yapımı köfte, pilav, közlenmiş biber',
      model: '/models/meatball.gltf',
      modelScale: 0.6,
      modelRotation: [0, 0, 0]
    },
  ],
  'İçecekler': [
    { 
      id: 4, 
      name: 'Cola', 
      price: 15,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
      description: 'Soğuk servis edilir'
    },
    { 
      id: 5, 
      name: 'Ayran', 
      price: 10,
      image: 'https://images.unsplash.com/photo-1541303412931-d5489c40e57c',
      description: 'Ev yapımı ayran'
    },
    { 
      id: 6, 
      name: 'Su', 
      price: 5,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d',
      description: 'Doğal kaynak suyu'
    },
  ],
  'Tatlılar': [
    { 
      id: 7, 
      name: 'Künefe', 
      price: 75,
      image: 'https://images.unsplash.com/photo-1576677996791-e0c82048a2ac',
      description: 'Antep fıstıklı künefe, dondurma ile servis edilir'
    },
    { 
      id: 8, 
      name: 'Baklava', 
      price: 65,
      image: 'https://images.unsplash.com/photo-1583401515094-24e4edb0b58f',
      description: 'Antep fıstıklı baklava'
    },
    { 
      id: 9, 
      name: 'Sütlaç', 
      price: 45,
      image: 'https://images.unsplash.com/photo-1585937067131-77cf7c6fe965',
      description: 'Fırında sütlaç'
    },
  ]
};

function ARModal({ item, onClose }) {
  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bgcolor: 'rgba(0,0,0,0.9)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <model-viewer
        src={item.model}
        alt={item.name}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-placement="floor"
        ar-scale="fixed"
        scale={item.modelScale}
        rotation={item.modelRotation}
        ar-status="auto"
        interaction-prompt="none"
        auto-activate-ar
        ar-button-display="auto"
        onload={() => {
          const modelViewer = document.querySelector('model-viewer');
          modelViewer.activateAR();
        }}
        onclose={() => onClose()}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent'
        }}
      />
    </Box>
  );
}

function MenuView() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedItems, setSelectedItems] = useState({});
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const { addOrder, orders, customerNames } = useOrders();
  const categories = Object.keys(menuItems);
  const tableOrders = orders[tableId] || [];
  const tableCustomers = customerNames[tableId] || [];
  const [showAR, setShowAR] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const handleQuantityChange = (itemId, delta) => {
    setSelectedItems(prev => {
      const currentQty = prev[itemId]?.quantity || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [itemId]: {
          quantity: newQty,
          item: menuItems[categories[selectedCategory]].find(item => item.id === itemId)
        }
      };
    });
  };

  const handleAddToTable = () => {
    if (Object.keys(selectedItems).length === 0) {
      alert('Lütfen en az bir ürün seçin');
      return;
    }
    setShowNameDialog(true);
  };

  const handleConfirmOrder = () => {
    if (!customerName.trim()) {
      alert('Lütfen adınızı girin');
      return;
    }

    const orders = Object.values(selectedItems).map(({ item, quantity }) => ({
      ...item,
      quantity
    }));
    
    addOrder(tableId, { 
      items: orders,
      customerName: customerName.trim()
    });
    setSelectedItems({});
    setShowNameDialog(false);
    setShowSnackbar(true);
  };

  const getTotalPrice = () => {
    return Object.values(selectedItems).reduce(
      (sum, { item, quantity }) => sum + (item.price * quantity),
      0
    );
  };

  const getTableTotal = () => {
    return tableOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <Box sx={{ pb: 7 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Menü
          </Typography>
        </Toolbar>
      </AppBar>

      <Container 
        sx={{ 
          mt: 3,
          maxWidth: '960px !important',
          px: { xs: 2, sm: 3 }
        }}
      >
        {showAR && selectedItem && (
          <ARModal
            item={selectedItem}
            onClose={() => {
              setShowAR(false);
              setSelectedItem(null);
            }}
          />
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {categories.map((category, index) => (
              <Tab key={category} label={category} />
            ))}
          </Tabs>
        </Paper>

        <Box sx={{ 
          display: 'grid', 
          gap: 2, 
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr'
          }
        }}>
          {menuItems[categories[selectedCategory]].map((item) => (
            <Paper
              key={item.id}
              elevation={2}
              sx={{
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <Box
                sx={{
                  height: 200,
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.3s',
                  },
                  '&:hover::before': {
                    transform: 'scale(1.1)',
                  }
                }}
              />
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.description}
                </Typography>
                {item.model && (
                  <Button
                    startIcon={<ViewInArIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowAR(true);
                    }}
                    sx={{ ml: 1, mb: 2 }}
                  >
                    Masada Göster
                  </Button>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    ₺{item.price}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(item.id, -1);
                    }}
                    disabled={!selectedItems[item.id]}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ minWidth: '40px', textAlign: 'center' }}>
                    {selectedItems[item.id]?.quantity || 0}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(item.id, 1);
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {Object.keys(selectedItems).length > 0 && (
          <Paper
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              bgcolor: 'background.paper',
              boxShadow: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                Toplam: ₺{getTotalPrice()}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddToTable}
            >
              Masaya Ekle
            </Button>
          </Paper>
        )}

        <Fab
          color="secondary"
          sx={{
            position: 'fixed',
            right: 16,
            bottom: Object.keys(selectedItems).length > 0 ? 80 : 16,
            zIndex: 1000
          }}
          onClick={() => setShowOrderDialog(true)}
        >
          <ReceiptIcon />
        </Fab>

        <Dialog
          open={showOrderDialog}
          onClose={() => setShowOrderDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Masa {tableId} - Mevcut Adisyon
          </DialogTitle>
          <DialogContent>
            {tableOrders.length === 0 ? (
              <Typography variant="body1" sx={{ py: 2, textAlign: 'center' }}>
                Masada henüz sipariş bulunmamaktadır.
              </Typography>
            ) : (
              <>
                <List>
                  {tableOrders.map((item, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.quantity} adet`}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body1">
                          ₺{item.price * item.quantity}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="h6">
                    Toplam: ₺{getTableTotal()}
                  </Typography>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowOrderDialog(false)}>
              Kapat
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                setShowOrderDialog(false);
                navigate(`/bill/${tableId}`);
              }}
            >
              Hesabı İste
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showNameDialog}
          onClose={() => setShowNameDialog(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Sipariş Veren</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              {tableCustomers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Daha önce sipariş verenler:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tableCustomers.map((name) => (
                      <Button
                        key={name}
                        variant={customerName === name ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setCustomerName(name)}
                      >
                        {name}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}
              <TextField
                autoFocus
                margin="dense"
                label="Adınız"
                fullWidth
                variant="outlined"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNameDialog(false)}>İptal</Button>
            <Button onClick={handleConfirmOrder} variant="contained">
              Siparişi Onayla
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setShowSnackbar(false)}>
            Siparişler masaya eklendi!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default MenuView; 