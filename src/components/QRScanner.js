import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import PersonIcon from '@mui/icons-material/Person';

function QRScanner() {
  const navigate = useNavigate();
  const [manualId, setManualId] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render((decodedText) => {
        scanner.clear();
        navigate(`/table/${decodedText}`);
      }, (error) => {
        console.warn(error);
      });

      return () => {
        scanner.clear();
      };
    }
  }, [showScanner, navigate]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      navigate(`/table/${manualId}`);
    }
  };

  return (
    <Box>
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        zIndex: 1000 
      }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonIcon />}
          onClick={() => navigate('/login')}
        >
          Personel Girişi
        </Button>
      </Box>

      <Container maxWidth="sm">
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h4" align="center">
            Masa Girişi
          </Typography>

          <Paper sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleManualSubmit} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Masa Numarası"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button fullWidth variant="contained" type="submit">
                Masa Girişi Yap
              </Button>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => setShowScanner(!showScanner)}
              sx={{ mb: 2 }}
            >
              {showScanner ? 'QR Tarayıcıyı Kapat' : 'QR Kod ile Giriş'}
            </Button>

            {showScanner && (
              <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                <div id="reader"></div>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default QRScanner; 