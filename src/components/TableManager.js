import React, { useState, useEffect, useCallback } from 'react';
import './TableManager.css';

const TableManager = ({ orders, onOrderUpdate, currentUser }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });
  const [newTable, setNewTable] = useState({
    number: '',
    capacity: 4,
    position: { x: 0, y: 0 }
  });

  const initializeTables = useCallback(() => {
    // Varsayılan masaları yükle
    if (tables.length === 0) {
      const defaultTables = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        number: `T${i + 1}`,
        capacity: 4,
        status: 'available',
        position: {
          x: (i % 4) * 150,
          y: Math.floor(i / 4) * 150
        }
      }));
      setTables(defaultTables);
    }
  }, [tables.length]);

  useEffect(() => {
    initializeTables();
  }, [initializeTables]);

  useEffect(() => {
    // Masa sayısı değiştiğinde layout'u güncelle
    const gridSize = Math.ceil(Math.sqrt(tables.length));
    setGridDimensions({ rows: gridSize, cols: gridSize });
  }, [tables.length]);

  useEffect(() => {
    // Masaları düzenle
    const updatedTables = tables.map((table, index) => ({
      ...table,
      gridPosition: {
        row: Math.floor(index / gridDimensions.cols),
        col: index % gridDimensions.cols
      }
    }));
    setTables(updatedTables);
  }, [gridDimensions.cols, tables]);

  const handleTableClick = useCallback((table) => {
    setSelectedTable(table);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewTable(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCapacityChange = useCallback((tableId, newCapacity) => {
    setTables(prev =>
      prev.map(table =>
        table.id === tableId
          ? { ...table, capacity: parseInt(newCapacity) }
          : table
      )
    );
  }, []);

  const handleStatusChange = useCallback((tableId, newStatus) => {
    setTables(prev =>
      prev.map(table =>
        table.id === tableId
          ? { ...table, status: newStatus }
          : table
      )
    );
  }, []);

  const handleAddTable = useCallback((e) => {
    e.preventDefault();
    const newTableObj = {
      id: tables.length + 1,
      ...newTable,
      status: 'available'
    };
    setTables(prev => [...prev, newTableObj]);
    setNewTable({
      number: '',
      capacity: 4,
      position: { x: 0, y: 0 }
    });
  }, [newTable, tables.length]);

  const handleRemoveTable = useCallback((tableId) => {
    if (window.confirm('Bu masayı silmek istediğinize emin misiniz?')) {
      setTables(prev => prev.filter(table => table.id !== tableId));
      if (selectedTable?.id === tableId) {
        setSelectedTable(null);
      }
    }
  }, [selectedTable]);

  const handleDragStart = useCallback((e, table) => {
    e.dataTransfer.setData('tableId', table.id.toString());
  }, []);

  const handleDrop = useCallback((e, targetPosition) => {
    e.preventDefault();
    const tableId = parseInt(e.dataTransfer.getData('tableId'));
    const updatedTables = tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          position: targetPosition
        };
      }
      return table;
    });
    setTables(updatedTables);
  }, [tables]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const getTableStatus = useCallback((table) => {
    if (!table.currentOrder) return 'boş';
    return table.currentOrder.status;
  }, []);

  const assignOrderToTable = useCallback((tableId, order) => {
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
  }, [orders, onOrderUpdate, tables]);

  const clearTable = useCallback((tableId) => {
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
  }, [tables]);

  const canManageTables = currentUser?.role === 'admin' || currentUser?.role === 'yönetici';

  return (
    <div className="table-manager">
      <div className="table-controls">
        <h2>Masa Yönetimi</h2>
        {canManageTables && (
          <button
            className="add-table-button"
            onClick={() => handleAddTable}
          >
            Yeni Masa Ekle
          </button>
        )}
      </div>

      <div
        className="table-grid"
        onDragOver={handleDragOver}
      >
        {tables.map(table => (
          <div
            key={table.id}
            className={`table-item ${table.status} ${selectedTable?.id === table.id ? 'selected' : ''}`}
            style={{
              gridRow: table.gridPosition?.row + 1,
              gridColumn: table.gridPosition?.col + 1
            }}
            onClick={() => handleTableClick(table)}
            draggable
            onDragStart={(e) => handleDragStart(e, table)}
          >
            <div className="table-number">{table.number}</div>
            <div className="table-capacity">{table.capacity} Kişilik</div>
            <div className="table-status">{table.status}</div>
          </div>
        ))}
      </div>

      {selectedTable && (
        <div className="table-details">
          <h3>Masa Detayları</h3>
          <div className="detail-item">
            <label>Masa Numarası:</label>
            <span>{selectedTable.number}</span>
          </div>
          <div className="detail-item">
            <label>Kapasite:</label>
            <input
              type="number"
              value={selectedTable.capacity}
              onChange={(e) => handleCapacityChange(selectedTable.id, e.target.value)}
              min="1"
            />
          </div>
          <div className="detail-item">
            <label>Durum:</label>
            <select
              value={selectedTable.status}
              onChange={(e) => handleStatusChange(selectedTable.id, e.target.value)}
            >
              <option value="available">Müsait</option>
              <option value="occupied">Dolu</option>
              <option value="reserved">Rezerve</option>
              <option value="maintenance">Bakımda</option>
            </select>
          </div>
          <button
            onClick={() => handleRemoveTable(selectedTable.id)}
            className="remove-button"
          >
            Masayı Sil
          </button>
        </div>
      )}

      <form onSubmit={handleAddTable} className="add-table-form">
        <h3>Yeni Masa Ekle</h3>
        <div className="form-group">
          <label>Masa Numarası:</label>
          <input
            type="text"
            name="number"
            value={newTable.number}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Kapasite:</label>
          <input
            type="number"
            name="capacity"
            value={newTable.capacity}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>
        <button type="submit">Masa Ekle</button>
      </form>

      {selectedTable && (
        <div className="table-detail">
          <h3>{selectedTable.number} Detayları</h3>
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
