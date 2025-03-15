import React, { useState, useEffect } from 'react';
import './TableManager.css';

const TableManager = ({ orders, onOrderUpdate, currentUser }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 4,
    position: { x: 0, y: 0 }
  });

  // Varsayılan masaları yükle
  useEffect(() => {
    if (tables.length === 0) {
      const defaultTables = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Masa ${i + 1}`,
        capacity: 4,
        status: 'boş',
        position: {
          x: (i % 4) * 150,
          y: Math.floor(i / 4) * 150
        },
        currentOrder: null
      }));
      setTables(defaultTables);
    }
  }, []);

  const handleTableClick = (table) => {
    setSelectedTable(table);
  };

  const handleAddTable = () => {
    if (newTable.name.trim()) {
      const newId = Math.max(...tables.map(t => t.id), 0) + 1;
      setTables([...tables, {
        ...newTable,
        id: newId,
        status: 'boş',
        currentOrder: null
      }]);
      setNewTable({
        name: '',
        capacity: 4,
        position: { x: 0, y: 0 }
      });
      setIsEditing(false);
    }
  };

  const handleDeleteTable = (tableId) => {
    setTables(tables.filter(t => t.id !== tableId));
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
  };

  const handleDragStart = (e, table) => {
    e.dataTransfer.setData('tableId', table.id.toString());
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const tableId = parseInt(e.dataTransfer.getData('tableId'));
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTables(tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          position: { x, y }
        };
      }
      return table;
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getTableStatus = (table) => {
    if (!table.currentOrder) return 'boş';
    return table.currentOrder.status;
  };

  const assignOrderToTable = (tableId, order) => {
    setTables(tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          currentOrder: order,
          status: order.status
        };
      }
      return table;
    }));

    // Siparişi güncelle
    onOrderUpdate(orders.map(o => {
      if (o.id === order.id) {
        return { ...o, tableId };
      }
      return o;
    }));
  };

  const clearTable = (tableId) => {
    setTables(tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          currentOrder: null,
          status: 'boş'
        };
      }
      return table;
    }));
  };

  const canManageTables = currentUser?.role === 'admin' || currentUser?.role === 'yönetici';

  return (
    <div className="table-manager">
      <div className="table-controls">
        <h2>Masa Yönetimi</h2>
        {canManageTables && (
          <button
            className="add-table-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'İptal' : 'Yeni Masa Ekle'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="table-form">
          <input
            type="text"
            placeholder="Masa Adı"
            value={newTable.name}
            onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Kapasite"
            value={newTable.capacity}
            onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
            min="1"
            className="form-input"
          />
          <button onClick={handleAddTable} className="submit-button">
            Ekle
          </button>
        </div>
      )}

      <div
        className="table-layout"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {tables.map(table => (
          <div
            key={table.id}
            className={`table-item ${table.status} ${selectedTable?.id === table.id ? 'selected' : ''}`}
            style={{
              left: table.position.x,
              top: table.position.y
            }}
            draggable={canManageTables}
            onDragStart={(e) => handleDragStart(e, table)}
            onClick={() => handleTableClick(table)}
          >
            <div className="table-header">
              <span>{table.name}</span>
              {canManageTables && (
                <button
                  className="delete-table"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTable(table.id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <div className="table-info">
              <span className="capacity">{table.capacity} Kişilik</span>
              <span className={`status ${getTableStatus(table)}`}>
                {getTableStatus(table)}
              </span>
            </div>
            {table.currentOrder && (
              <div className="order-info">
                <p>Sipariş #{table.currentOrder.id}</p>
                <p>{table.currentOrder.items.length} Ürün</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedTable && (
        <div className="table-detail">
          <h3>{selectedTable.name} Detayları</h3>
          <div className="detail-info">
            <p>Kapasite: {selectedTable.capacity} Kişi</p>
            <p>Durum: {getTableStatus(selectedTable)}</p>
          </div>
          
          {selectedTable.currentOrder ? (
            <div className="current-order">
              <h4>Mevcut Sipariş</h4>
              <div className="order-items">
                {selectedTable.currentOrder.items.map((item, index) => (
                  <p key={index}>
                    {item.quantity}x {item.name}
                  </p>
                ))}
              </div>
              <p className="order-total">
                Toplam: {selectedTable.currentOrder.total} TL
              </p>
              {canManageTables && (
                <button
                  className="clear-table-button"
                  onClick={() => clearTable(selectedTable.id)}
                >
                  Masayı Temizle
                </button>
              )}
            </div>
          ) : (
            <div className="available-orders">
              <h4>Bekleyen Siparişler</h4>
              {orders
                .filter(order => !order.tableId && order.status === 'Bekliyor')
                .map(order => (
                  <div key={order.id} className="order-item">
                    <span>Sipariş #{order.id}</span>
                    <button
                      onClick={() => assignOrderToTable(selectedTable.id, order)}
                      className="assign-button"
                    >
                      Masaya Ata
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableManager;
