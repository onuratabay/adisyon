import React, { useState } from 'react';
import './CustomerDashboard.css';
import { FaReceipt, FaUtensils, FaWifi, FaBell } from 'react-icons/fa';

const CustomerDashboard = ({ tableId, onMenuClick, onBillClick }) => {
  const [showWifiInfo, setShowWifiInfo] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);

  const handleWifiClick = () => {
    setShowWifiInfo(true);
  };

  const handleWaiterCall = () => {
    setWaiterCalled(true);
    // TODO: Implement waiter notification system
    setTimeout(() => {
      setWaiterCalled(false);
    }, 3000);
  };

  return (
    <div className="customer-dashboard">
      <h2>Masa {tableId}</h2>
      
      <div className="dashboard-grid">
        <div className="dashboard-item" onClick={onBillClick}>
          <FaReceipt className="dashboard-icon" />
          <span>Adisyon Takibi</span>
        </div>
        
        <div className="dashboard-item" onClick={onMenuClick}>
          <FaUtensils className="dashboard-icon" />
          <span>Menü</span>
        </div>
        
        <div className="dashboard-item" onClick={handleWifiClick}>
          <FaWifi className="dashboard-icon" />
          <span>Wi-Fi'ya Bağlan</span>
        </div>
        
        <div 
          className={`dashboard-item ${waiterCalled ? 'called' : ''}`} 
          onClick={handleWaiterCall}
        >
          <FaBell className="dashboard-icon" />
          <span>{waiterCalled ? 'Garson Çağrıldı' : 'Garson Çağır'}</span>
        </div>
      </div>

      {showWifiInfo && (
        <div className="wifi-modal">
          <div className="wifi-content">
            <h3>Wi-Fi Bilgileri</h3>
            <p>Ağ Adı: Restaurant_Guest</p>
            <p>Şifre: welcome2024</p>
            <button onClick={() => setShowWifiInfo(false)}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
