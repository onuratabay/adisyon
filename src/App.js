import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { OrderProvider } from './contexts/OrderContext';
import { UserProvider, UserRoles } from './contexts/UserContext';
import theme from './styles/theme';

import TableView from './components/TableView';
import QRScanner from './components/QRScanner';
import PaymentScreen from './components/PaymentScreen';
import MenuView from './components/MenuView';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <OrderProvider>
          <Router>
            <Routes>
              <Route path="/" element={<QRScanner />} />
              <Route path="/table/:tableId" element={<TableView />} />
              <Route path="/payment/:tableId" element={<PaymentScreen />} />
              <Route path="/menu/:tableId" element={<MenuView />} />
              <Route path="/bill/:tableId" element={<PaymentScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute roles={[UserRoles.ADMIN, UserRoles.WAITER]}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </OrderProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
