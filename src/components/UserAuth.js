import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './UserAuth.css';

const USER_ROLES = {
  ADMIN: 'admin',
  CASHIER: 'kasa',
  WAITER: 'garson',
  CUSTOMER: 'müşteri'
};

const UserAuth = ({ onLogin, currentUser, onLogout }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isQRMode, setIsQRMode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [users, setUsers] = useState([
    { username: 'admin', password: 'admin123', role: USER_ROLES.ADMIN },
    { username: 'kasa', password: 'kasa123', role: USER_ROLES.CASHIER },
    { username: 'garson', password: 'garson123', role: USER_ROLES.WAITER }
  ]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: USER_ROLES.WAITER,
    tableId: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: {
          width: 250,
          height: 250
        },
        fps: 5,
      });
      
      scanner.render(success, error);
      
      function success(result) {
        scanner.clear();
        setShowScanner(false);
        handleQRLogin(result);
      }
      
      function error(err) {
        console.warn(err);
      }
    }
    
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [showScanner]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleQRLogin = (qrData) => {
    // QR kod formatı: "TABLE_ID:XXXX"
    const tableId = qrData.split(':')[1];
    if (tableId) {
      onLogin({
        username: `masa_${tableId}`,
        role: USER_ROLES.CUSTOMER,
        tableId: tableId
      });
    } else {
      setError('Geçersiz QR kod!');
    }
  };

  const handleTableIdLogin = (e) => {
    e.preventDefault();
    if (formData.tableId) {
      onLogin({
        username: `masa_${formData.tableId}`,
        role: USER_ROLES.CUSTOMER,
        tableId: formData.tableId
      });
    } else {
      setError('Masa numarası gerekli!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isQRMode) {
      handleTableIdLogin(e);
      return;
    }

    if (isLoginMode) {
      // Personel girişi
      const user = users.find(u => 
        u.username === formData.username && 
        u.password === formData.password
      );
      
      if (user) {
        onLogin(user);
        setFormData({ username: '', password: '', role: USER_ROLES.WAITER, tableId: '' });
      } else {
        setError('Kullanıcı adı veya şifre hatalı!');
      }
    } else {
      // Yeni personel kaydı
      if (users.some(u => u.username === formData.username)) {
        setError('Bu kullanıcı adı zaten kullanılıyor!');
        return;
      }

      const newUser = { ...formData };
      setUsers(prev => [...prev, newUser]);
      setFormData({ username: '', password: '', role: USER_ROLES.WAITER, tableId: '' });
      setIsLoginMode(true);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(prev => !prev);
    setIsQRMode(false);
    setShowScanner(false);
    setFormData({ username: '', password: '', role: USER_ROLES.WAITER, tableId: '' });
    setError('');
  };

  const toggleQRMode = () => {
    setIsQRMode(prev => !prev);
    setIsLoginMode(true);
    setShowScanner(false);
    setFormData({ username: '', password: '', role: USER_ROLES.WAITER, tableId: '' });
    setError('');
  };

  if (currentUser) {
    return (
      <div className="user-profile">
        <span className="user-welcome">Hoş Geldiniz, {currentUser.username}</span>
        <span className="user-role">Yetki: {currentUser.role}</span>
        {currentUser.tableId && (
          <span className="table-info">Masa: {currentUser.tableId}</span>
        )}
        <button onClick={onLogout} className="logout-button">
          Çıkış Yap
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>
        {isQRMode ? 'Masa Girişi' : isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
      </h2>
      <div className="auth-mode-switch">
        <button
          className={`mode-button ${!isQRMode ? 'active' : ''}`}
          onClick={() => toggleQRMode()}
        >
          Personel Girişi
        </button>
        <button
          className={`mode-button ${isQRMode ? 'active' : ''}`}
          onClick={() => toggleQRMode()}
        >
          Masa Girişi
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {isQRMode ? (
          <div className="form-group">
            <input
              type="text"
              name="tableId"
              value={formData.tableId}
              onChange={handleInputChange}
              placeholder="Masa Numarası"
              className="form-input"
              required
            />
            <div className="qr-section">
              <p>veya</p>
              <button 
                type="button" 
                className="qr-button"
                onClick={() => setShowScanner(prev => !prev)}
              >
                {showScanner ? 'QR Okuyucuyu Kapat' : 'QR Kod ile Giriş'}
              </button>
              {showScanner && (
                <div id="qr-reader" className="qr-reader-container" />
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="form-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Kullanıcı Adı"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Şifre"
                className="form-input"
                required
              />
            </div>
            {!isLoginMode && (
              <div className="form-group">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  {Object.entries(USER_ROLES).map(([key, value]) => (
                    value !== USER_ROLES.CUSTOMER && (
                      <option key={key} value={value}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </option>
                    )
                  ))}
                </select>
              </div>
            )}
          </>
        )}
        <button type="submit" className="submit-button">
          {isQRMode ? 'Giriş Yap' : isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
        </button>
        {!isQRMode && (
          <button type="button" onClick={toggleMode} className="toggle-button">
            {isLoginMode ? 'Hesap Oluştur' : 'Giriş Yap'}
          </button>
        )}
      </form>
    </div>
  );
};

export default UserAuth;
