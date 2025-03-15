import React, { useState } from 'react';
import './OrderList.css';

const ORDER_STATUS = {
  WAITING: 'Bekliyor',
  PREPARING: 'Hazırlanıyor',
  COMPLETED: 'Tamamlandı'
};

const OrderList = ({ products, updateStock }) => {
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({ 
    table: '', 
    items: [],
    total: 0,
    status: ORDER_STATUS.WAITING 
  });
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('1');

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) * parseFloat(item.quantity)), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingOrder) {
      setEditingOrder(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewOrder(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addProductToOrder = () => {
    if (selectedProduct && selectedQuantity) {
      const product = products.find(p => p.name === selectedProduct);
      if (product) {
        const orderItems = editingOrder ? editingOrder.items : newOrder.items;
        const existingItem = orderItems.find(item => item.name === product.name);

        const updatedItems = existingItem
          ? orderItems.map(item =>
              item.name === product.name
                ? { ...item, quantity: (parseFloat(item.quantity) + parseFloat(selectedQuantity)).toString() }
                : item
            )
          : [...orderItems, { 
              name: product.name, 
              price: product.price,
              quantity: selectedQuantity
            }];

        if (editingOrder) {
          setEditingOrder(prev => ({
            ...prev,
            items: updatedItems,
            total: calculateTotal(updatedItems)
          }));
        } else {
          setNewOrder(prev => ({
            ...prev,
            items: updatedItems,
            total: calculateTotal(updatedItems)
          }));
        }

        setSelectedProduct('');
        setSelectedQuantity('1');
      }
    }
  };

  const removeProductFromOrder = (productName) => {
    if (editingOrder) {
      const updatedItems = editingOrder.items.filter(item => item.name !== productName);
      setEditingOrder(prev => ({
        ...prev,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      }));
    } else {
      const updatedItems = newOrder.items.filter(item => item.name !== productName);
      setNewOrder(prev => ({
        ...prev,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingOrder) {
      setOrders(prev => prev.map(order => 
        order.id === editingOrder.id ? editingOrder : order
      ));
      setEditingOrder(null);
    } else {
      if (newOrder.table && newOrder.items.length > 0) {
        const orderToAdd = { ...newOrder, id: Date.now() };
        setOrders(prev => [...prev, orderToAdd]);
        updateStock(newOrder.items);
        setNewOrder({ 
          table: '', 
          items: [], 
          total: 0, 
          status: ORDER_STATUS.WAITING 
        });
      }
    }
  };

  const startEditing = (order) => {
    setEditingOrder(order);
    setNewOrder({ 
      table: '', 
      items: [], 
      total: 0, 
      status: ORDER_STATUS.WAITING 
    });
  };

  const cancelEditing = () => {
    setEditingOrder(null);
    setNewOrder({ 
      table: '', 
      items: [], 
      total: 0, 
      status: ORDER_STATUS.WAITING 
    });
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case ORDER_STATUS.WAITING:
        return 'status-waiting';
      case ORDER_STATUS.PREPARING:
        return 'status-preparing';
      case ORDER_STATUS.COMPLETED:
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="order-list-container">
      <h2>{editingOrder ? 'Siparişi Düzenle' : 'Yeni Sipariş'}</h2>
      
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <input
            type="text"
            name="table"
            value={editingOrder ? editingOrder.table : newOrder.table}
            onChange={handleInputChange}
            placeholder="Masa No"
            className="form-input"
          />
        </div>

        <div className="product-selector">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="form-input"
          >
            <option value="">Ürün Seçin</option>
            {products.map(product => (
              <option key={product.id} value={product.name}>
                {product.name} - {product.price} TL
              </option>
            ))}
          </select>
          <input
            type="number"
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(e.target.value)}
            min="1"
            className="form-input quantity-input"
          />
          <button type="button" onClick={addProductToOrder} className="add-button">
            Ekle
          </button>
        </div>

        <div className="selected-products">
          {(editingOrder ? editingOrder.items : newOrder.items).map((item, index) => (
            <div key={index} className="selected-product">
              <span>
                {item.name} - {item.quantity} adet - {item.price} TL
                <strong> = {(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2)} TL</strong>
              </span>
              <button
                type="button"
                onClick={() => removeProductFromOrder(item.name)}
                className="remove-button"
              >
                ×
              </button>
            </div>
          ))}
          {(editingOrder ? editingOrder.items : newOrder.items).length > 0 && (
            <div className="order-total">
              Toplam: {(editingOrder ? editingOrder.total : newOrder.total).toFixed(2)} TL
            </div>
          )}
        </div>

        {editingOrder && (
          <div className="form-group">
            <select
              name="status"
              value={editingOrder.status}
              onChange={handleInputChange}
              className="form-input"
            >
              {Object.values(ORDER_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}

        <div className="button-group">
          <button type="submit" className="submit-button">
            {editingOrder ? 'Siparişi Güncelle' : 'Sipariş Ekle'}
          </button>
          {editingOrder && (
            <button type="button" onClick={cancelEditing} className="cancel-button">
              İptal
            </button>
          )}
        </div>
      </form>

      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <h3>Masa {order.table}</h3>
              <span className={`status-badge ${getStatusClass(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="order-items">
              {order.items.map((item, index) => (
                <p key={index}>
                  {item.name} - {item.quantity} adet
                  <span className="item-total">
                    {(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2)} TL
                  </span>
                </p>
              ))}
            </div>
            <p className="total">Toplam: {order.total.toFixed(2)} TL</p>
            <div className="status-buttons">
              {order.status !== ORDER_STATUS.WAITING && (
                <button
                  onClick={() => handleStatusChange(order.id, ORDER_STATUS.WAITING)}
                  className="status-button waiting"
                >
                  Bekliyor
                </button>
              )}
              {order.status !== ORDER_STATUS.PREPARING && (
                <button
                  onClick={() => handleStatusChange(order.id, ORDER_STATUS.PREPARING)}
                  className="status-button preparing"
                >
                  Hazırlanıyor
                </button>
              )}
              {order.status !== ORDER_STATUS.COMPLETED && (
                <button
                  onClick={() => handleStatusChange(order.id, ORDER_STATUS.COMPLETED)}
                  className="status-button completed"
                >
                  Tamamlandı
                </button>
              )}
            </div>
            <div className="button-group">
              <button
                onClick={() => startEditing(order)}
                className="edit-button"
              >
                Düzenle
              </button>
              <button
                onClick={() => deleteOrder(order.id)}
                className="delete-button"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
