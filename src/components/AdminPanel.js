import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import WaiterNotifications from './WaiterNotifications';
import WaiterTables from './WaiterTables';

function AdminPanel() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Kullanıcılar', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Menü Yönetimi', icon: <RestaurantMenuIcon />, path: '/admin/menu' },
    { text: 'Masalar', icon: <TableRestaurantIcon />, path: '/admin/tables' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Yönetim Paneli
          </Typography>
          {currentUser?.role === 'waiter' && <WaiterNotifications />}
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Çıkış
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={
              <>
                <Typography variant="h4" gutterBottom>
                  Hoş Geldiniz, {currentUser?.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Rol: {currentUser?.role}
                </Typography>
              </>
            } />
            <Route path="/tables" element={<WaiterTables />} />
            {/* Diğer sayfalar için route'lar eklenecek */}
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default AdminPanel; 