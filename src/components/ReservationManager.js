import React, { useState, useEffect, useCallback } from 'react';
import './ReservationManager.css';

const ReservationManager = ({ tables, currentUser }) => {
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [newReservation, setNewReservation] = useState({
    customerName: '',
    phoneNumber: '',
    date: '',
    time: '',
    guests: 2,
    tableId: '',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // calendar veya list
  const [error, setError] = useState(null);

  // Çalışma saatleri
  const workingHours = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 10; // 10:00'dan başla
    return `${hour}:00`;
  });

  const filterReservations = useCallback(() => {
    let filtered = [...reservations];

    // Tarihe göre filtrele
    if (selectedDate) {
      filtered = filtered.filter(reservation => {
        const reservationDate = new Date(reservation.date);
        return (
          reservationDate.getFullYear() === selectedDate.getFullYear() &&
          reservationDate.getMonth() === selectedDate.getMonth() &&
          reservationDate.getDate() === selectedDate.getDate()
        );
      });
    }

    // Arama terimine göre filtrele
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reservation =>
        reservation.customerName.toLowerCase().includes(term) ||
        reservation.notes.toLowerCase().includes(term)
      );
    }

    setFilteredReservations(filtered);
  }, [reservations, selectedDate, searchTerm]);

  useEffect(() => {
    filterReservations();
  }, [filterReservations]);

  const handleDateChange = useCallback((e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  }, []);

  const handleSearch = useCallback((e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
  }, []);

  const validateReservation = useCallback((newReservation) => {
    const { customerName, phoneNumber, date, time, guests, tableId } = newReservation;
    
    if (!customerName || !phoneNumber || !date || !time || !guests || !tableId) {
      return 'Tüm alanları doldurunuz.';
    }

    // Tarih kontrolü
    const reservationDate = new Date(date + ' ' + time);
    if (reservationDate < new Date()) {
      return 'Geçmiş bir tarih seçemezsiniz.';
    }

    // Masa müsaitlik kontrolü
    const tableReservations = reservations.filter(res => 
      res.tableId === tableId && 
      res.status !== 'cancelled' &&
      new Date(res.date + ' ' + res.time).toDateString() === reservationDate.toDateString()
    );

    if (tableReservations.length > 0) {
      return 'Bu masa seçilen tarihte dolu.';
    }

    // Masa kapasite kontrolü
    const selectedTable = tables.find(t => t.id === parseInt(tableId));
    if (selectedTable && guests > selectedTable.capacity) {
      return `Bu masa maksimum ${selectedTable.capacity} kişiliktir.`;
    }

    return null;
  }, [reservations, tables]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    const error = validateReservation(newReservation);
    if (error) {
      setError(error);
      return;
    }

    const reservation = {
      id: Date.now(),
      ...newReservation,
      status: 'confirmed'
    };

    setReservations(prev => [...prev, reservation]);
    
    // Formu temizle
    setNewReservation({
      customerName: '',
      phoneNumber: '',
      date: '',
      time: '',
      guests: 1,
      tableId: '',
      notes: ''
    });
  }, [newReservation, validateReservation]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewReservation(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCancel = useCallback((reservationId) => {
    if (window.confirm('Rezervasyonu iptal etmek istediğinize emin misiniz?')) {
      setReservations(reservations.map(res =>
        res.id === reservationId
          ? { ...res, status: 'cancelled' }
          : res
      ));
    }
  }, [reservations]);

  const getAvailableTables = useCallback((date, time) => {
    if (!date || !time) return tables;

    const reservationDateTime = new Date(date + ' ' + time);
    return tables.filter(table => {
      const conflicting = reservations.find(res => {
        if (res.status === 'cancelled') return false;
        const resDateTime = new Date(res.date + ' ' + res.time);
        const hourDiff = Math.abs(resDateTime - reservationDateTime) / 36e5;
        return res.tableId === table.id.toString() && hourDiff < 2;
      });
      return !conflicting;
    });
  }, [reservations, tables]);

  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
    <div className="reservation-manager">
      <div className="controls">
        <div className="view-toggle">
          <button
            className={`toggle-button ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            Takvim Görünümü
          </button>
          <button
            className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Liste Görünümü
          </button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Müşteri adı veya telefon ile ara..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>
      <div className="reservation-header">
        <h2>Rezervasyonlar</h2>
        <div className="view-controls">
          <button
            className={`view-button ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            Takvim
          </button>
          <button
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Liste
          </button>
          {(currentUser?.role === 'admin' || currentUser?.role === 'yönetici') && (
            <button
              className="add-reservation-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'İptal' : 'Yeni Rezervasyon'}
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="form-row">
            <div className="form-group">
              <label>Müşteri Adı</label>
              <input
                type="text"
                name="customerName"
                value={newReservation.customerName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Telefon</label>
              <input
                type="tel"
                name="phoneNumber"
                value={newReservation.phoneNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="5XX XXX XXXX"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tarih</label>
              <input
                type="date"
                name="date"
                value={newReservation.date}
                onChange={handleDateChange}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>Saat</label>
              <select
                name="time"
                value={newReservation.time}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Seçiniz</option>
                {workingHours.map(hour => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Kişi Sayısı</label>
              <input
                type="number"
                name="guests"
                value={newReservation.guests}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Masa</label>
              <select
                name="tableId"
                value={newReservation.tableId}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Seçiniz</option>
                {getAvailableTables(newReservation.date, newReservation.time).map(table => (
                  <option key={table.id} value={table.id}>
                    {table.name} ({table.capacity} Kişilik)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Notlar</label>
              <textarea
                name="notes"
                value={newReservation.notes}
                onChange={handleInputChange}
                className="form-input"
                rows="2"
              />
            </div>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" className="submit-button">
            Rezervasyon Oluştur
          </button>
        </form>
      )}

      <div className="reservations-view">
        {viewMode === 'calendar' ? (
          <div className="calendar-view">
            <div className="date-navigator">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                }}
              >
                &#8592;
              </button>
              <h3>{formatDate(selectedDate)}</h3>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}
              >
                &#8594;
              </button>
            </div>
            <div className="time-slots">
              {workingHours.map(hour => {
                const timeSlotReservations = filteredReservations.filter(
                  res => res.time === hour
                );
                return (
                  <div key={hour} className="time-slot">
                    <div className="time-label">{hour}</div>
                    <div className="slot-reservations">
                      {timeSlotReservations.map(res => (
                        <div
                          key={res.id}
                          className={`reservation-card ${res.status}`}
                        >
                          <div className="reservation-info">
                            <strong>{res.customerName}</strong>
                            <span>{tables.find(t => t.id.toString() === res.tableId)?.name}</span>
                            <span>{res.guests} Kişi</span>
                          </div>
                          {res.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancel(res.id)}
                              className="cancel-button"
                            >
                              İptal
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="list-view">
            {filteredReservations
              .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
              .map(res => (
                <div key={res.id} className={`reservation-item ${res.status}`}>
                  <div className="reservation-main-info">
                    <h4>{res.customerName}</h4>
                    <p>{formatDate(res.date)} - {res.time}</p>
                  </div>
                  <div className="reservation-details">
                    <p>Masa: {tables.find(t => t.id.toString() === res.tableId)?.name}</p>
                    <p>{res.guests} Kişi</p>
                    <p>Tel: {res.phoneNumber}</p>
                    {res.notes && <p className="notes">Not: {res.notes}</p>}
                  </div>
                  <div className="reservation-status">
                    <span className={`status-badge ${res.status}`}>
                      {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                    </span>
                    {res.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(res.id)}
                        className="cancel-button"
                      >
                        İptal
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationManager;
