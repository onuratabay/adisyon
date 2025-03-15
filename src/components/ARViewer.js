import { useEffect, useRef } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function ARViewer({ item, onClose }) {
  const modelViewerRef = useRef(null);

  useEffect(() => {
    // Model-viewer'ı dinamik olarak yükle
    import('@google/model-viewer').then(() => {
      // Model yüklendi
    });
  }, []);

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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <IconButton 
        onClick={onClose}
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16,
          color: 'white',
          zIndex: 2001
        }}
      >
        <CloseIcon />
      </IconButton>

      <model-viewer
        ref={modelViewerRef}
        src={item.model}
        alt={item.name}
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        style={{
          width: '100%',
          height: '80vh',
          backgroundColor: 'transparent'
        }}
      />

      <Box sx={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 0, 
        right: 0,
        textAlign: 'center',
        color: 'white'
      }}>
        <Typography variant="h6">
          {item.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Modeli döndürmek için fareyi kullanın
        </Typography>
      </Box>
    </Box>
  );
}

export default ARViewer; 