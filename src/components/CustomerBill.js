import React, { useState } from 'react';
import './CustomerBill.css';
import { FaCreditCard, FaMoneyBillWave, FaTicketAlt, FaMobileAlt } from 'react-icons/fa';

const CustomerBill = ({ tableId, orders, personalOrders, onPayment }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [splitBill, setSplitBill] = useState(false);

  const calculateTotal = (orderList) => {
    return orderList.reduce((total, order) => {
      return total + order.items.reduce((itemTotal, item) => {
        return itemTotal + (item.price * item.quantity);
      }, 0);
    }, 0);
  };

  const tableTotal = calculateTotal(orders);
  const personalTotal = calculateTotal(personalOrders);

  const handlePayment = (method) => {
    onPayment({
      method,
      amount: splitBill ? personalTotal : tableTotal,
      isPersonal: splitBill
    });
    setShowPayment(false);
  };

  const paymentMethods = [
    {
      id: 'credit',
      name: 'Kredi Kartı',
      icon: <FaCreditCard />,
      description: 'Tüm kredi kartları kabul edilir'
    },
    {
      id: 'cash',
      name: 'Nakit',
      icon: <FaMoneyBillWave />,
      description: 'Garson nakit ödeme için masanıza gelecektir'
    },
    {
      id: 'ticket',
      name: 'Yemek Kartı',
      icon: <FaTicketAlt />,
      description: 'Sodexo, Multinet, Ticket Restaurant'
    },
    {
      id: 'mobile',
      name: 'Mobil Ödeme',
      icon: <FaMobileAlt />,
      description: 'Apple Pay, Google Pay, BKM Express'
    }
  ];

  return (
    <div className="customer-bill">
      <h2>Masa {tableId} - Adisyon</h2>

      <div className="bill-toggle">
        <button
          className={!splitBill ? 'active' : ''}
          onClick={() => setSplitBill(false)}
        >
          Masa Adisyonu
        </button>
        <button
          className={splitBill ? 'active' : ''}
          onClick={() => setSplitBill(true)}
        >
          Kişisel Adisyon
        </button>
      </div>

      <div className="orders-list">
        {(splitBill ? personalOrders : orders).map((order, index) => (
          <div key={index} className="order-group">
            <div className="order-time">
              {new Date(order.timestamp).toLocaleTimeString()}
            </div>
            {order.items.map((item, itemIndex) => (
              <div key={itemIndex} className="order-item">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
                <span className="item-price">{item.price * item.quantity} ₺</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bill-total">
        <span>Toplam Tutar:</span>
        <span>{splitBill ? personalTotal : tableTotal} ₺</span>
      </div>

      <button 
        className="pay-button"
        onClick={() => setShowPayment(true)}
      >
        {splitBill ? 'Kişisel Ödeme Yap' : 'Masa Hesabını Öde'}
      </button>

      {showPayment && (
        <div className="payment-modal">
          <div className="payment-content">
            <h3>Ödeme Yöntemi Seçin</h3>
            <div className="payment-methods">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`payment-method ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="method-icon">{method.icon}</div>
                  <div className="method-details">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="payment-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowPayment(false)}
              >
                İptal
              </button>
              <button
                className="confirm-button"
                disabled={!selectedPaymentMethod}
                onClick={() => handlePayment(selectedPaymentMethod)}
              >
                Ödemeyi Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBill;
