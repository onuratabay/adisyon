import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { useUser } from '../contexts/UserContext';

function LoginScreen() {
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Örnek kullanıcılar (gerçek uygulamada bu bilgiler API'den gelecek)
  const users = {
    'admin': { password: 'admin123', role: 'admin' },
    'waiter': { password: 'waiter123', role: 'waiter' },
    'cashier': { password: 'cashier123', role: 'cashier' }
  };

  const handleLogin = () => {
    const user = users[username];
    if (user && user.password === password) {
      setCurrentUser({
        username,
        role: user.role
      });
      navigate('/admin');
    } else {
      setError('Kullanıcı adı veya şifre hatalı');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Personel Girişi
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              sx={{ mt: 3 }}
            >
              Giriş Yap
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default LoginScreen; 