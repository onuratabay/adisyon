import React, { useState, useEffect, useCallback } from 'react';
import './Reports.css';

const Reports = ({ orders, products, ingredients }) => {
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('sales');
  const [reportData, setReportData] = useState(null);

  const calculateDateRange = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        return { start: today, end: now };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);
        return { start: weekStart, end: now };
      case 'month':
        const monthStart = new Date(today);
        monthStart.setMonth(monthStart.getMonth() - 1);
        return { start: monthStart, end: now };
      default:
        return { start: today, end: now };
    }
  }, [dateRange]);

  const generateSalesReport = useCallback(() => {
    if (orders.length === 0) return;
    
    const { start, end } = calculateDateRange();
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= start && orderDate <= end;
    });

    const salesByProduct = {};
    let totalRevenue = 0;

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!salesByProduct[item.name]) {
          salesByProduct[item.name] = {
            quantity: 0,
            revenue: 0
          };
        }
        salesByProduct[item.name].quantity += parseInt(item.quantity);
        const product = products.find(p => p.name === item.name);
        const revenue = product ? product.price * item.quantity : 0;
        salesByProduct[item.name].revenue += revenue;
        totalRevenue += revenue;
      });
    });

    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      salesByProduct,
      averageOrderValue: totalRevenue / (filteredOrders.length || 1)
    };
  }, [orders, calculateDateRange, products]);

  const generateInventoryReport = useCallback(() => {
    const lowStockThreshold = 20; // Yüzde olarak
    const lowStockItems = ingredients.filter(item => {
      const stockPercentage = (item.quantity / item.minQuantity) * 100;
      return stockPercentage <= lowStockThreshold;
    });

    const stockStatus = ingredients.map(item => ({
      name: item.name,
      currentStock: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit,
      status: item.quantity <= item.minQuantity ? 'Düşük' : 'Normal'
    }));

    return {
      totalItems: ingredients.length,
      lowStockItems,
      stockStatus,
      stockValue: ingredients.reduce((total, item) => {
        const product = products.find(p => 
          p.ingredients.some(i => i.id === item.id)
        );
        return total + (product ? parseFloat(item.quantity) * product.price : 0);
      }, 0)
    };
  }, [ingredients, products]);

  const generateOrderReport = useCallback(() => {
    const { start, end } = calculateDateRange();
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= start && orderDate <= end;
    });

    const ordersByStatus = {
      'Bekliyor': 0,
      'Hazırlanıyor': 0,
      'Tamamlandı': 0
    };

    filteredOrders.forEach(order => {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    const averagePreparationTime = filteredOrders.reduce((total, order) => {
      if (order.completedAt && order.date) {
        const prepTime = new Date(order.completedAt) - new Date(order.date);
        return total + prepTime;
      }
      return total;
    }, 0) / (filteredOrders.filter(o => o.completedAt).length || 1);

    return {
      totalOrders: filteredOrders.length,
      ordersByStatus,
      averagePreparationTime: Math.round(averagePreparationTime / 1000 / 60), // Dakika cinsinden
      busyHours: calculateBusyHours(filteredOrders)
    };
  }, [orders, calculateDateRange]);

  const calculateBusyHours = useCallback((orders) => {
    const hourCounts = new Array(24).fill(0);
    orders.forEach(order => {
      const hour = new Date(order.date).getHours();
      hourCounts[hour]++;
    });
    
    return hourCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      count
    }));
  }, []);

  useEffect(() => {
    switch (reportType) {
      case 'sales':
        setReportData(generateSalesReport());
        break;
      case 'inventory':
        setReportData(generateInventoryReport());
        break;
      case 'orders':
        setReportData(generateOrderReport());
        break;
      default:
        setReportData(null);
    }
  }, [reportType, dateRange, orders, products, ingredients, generateSalesReport, generateInventoryReport, generateOrderReport]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  }, []);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Raporlar</h2>
        <div className="report-controls">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="report-select"
          >
            <option value="sales">Satış Raporu</option>
            <option value="inventory">Stok Raporu</option>
            <option value="orders">Sipariş Raporu</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="date-select"
          >
            <option value="today">Bugün</option>
            <option value="week">Son 7 Gün</option>
            <option value="month">Son 30 Gün</option>
          </select>
        </div>
      </div>

      <div className="report-content">
        {reportType === 'sales' && reportData && (
          <div className="sales-report">
            <div className="report-summary">
              <div className="summary-card">
                <h3>Toplam Sipariş</h3>
                <p>{reportData.totalOrders}</p>
              </div>
              <div className="summary-card">
                <h3>Toplam Gelir</h3>
                <p>{formatCurrency(reportData.totalRevenue)}</p>
              </div>
              <div className="summary-card">
                <h3>Ortalama Sipariş Değeri</h3>
                <p>{formatCurrency(reportData.averageOrderValue)}</p>
              </div>
            </div>
            <div className="sales-by-product">
              <h3>Ürün Bazlı Satışlar</h3>
              <table>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Satış Adedi</th>
                    <th>Gelir</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportData.salesByProduct).map(([product, data]) => (
                    <tr key={product}>
                      <td>{product}</td>
                      <td>{data.quantity}</td>
                      <td>{formatCurrency(data.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'inventory' && reportData && (
          <div className="inventory-report">
            <div className="report-summary">
              <div className="summary-card">
                <h3>Toplam Ürün</h3>
                <p>{reportData.totalItems}</p>
              </div>
              <div className="summary-card">
                <h3>Düşük Stok</h3>
                <p>{reportData.lowStockItems.length}</p>
              </div>
              <div className="summary-card">
                <h3>Stok Değeri</h3>
                <p>{formatCurrency(reportData.stockValue)}</p>
              </div>
            </div>
            <div className="stock-status">
              <h3>Stok Durumu</h3>
              <table>
                <thead>
                  <tr>
                    <th>Malzeme</th>
                    <th>Mevcut Stok</th>
                    <th>Minimum Stok</th>
                    <th>Birim</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.stockStatus.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{item.currentStock}</td>
                      <td>{item.minQuantity}</td>
                      <td>{item.unit}</td>
                      <td className={`status-${item.status.toLowerCase()}`}>
                        {item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'orders' && reportData && (
          <div className="orders-report">
            <div className="report-summary">
              <div className="summary-card">
                <h3>Toplam Sipariş</h3>
                <p>{reportData.totalOrders}</p>
              </div>
              <div className="summary-card">
                <h3>Ortalama Hazırlama Süresi</h3>
                <p>{reportData.averagePreparationTime} dk</p>
              </div>
            </div>
            <div className="orders-by-status">
              <h3>Sipariş Durumları</h3>
              <div className="status-grid">
                {Object.entries(reportData.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="status-card">
                    <h4>{status}</h4>
                    <p>{count}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="busy-hours">
              <h3>Yoğun Saatler</h3>
              <div className="hours-grid">
                {reportData.busyHours.map((hour) => (
                  <div
                    key={hour.hour}
                    className="hour-bar"
                    style={{
                      height: `${(hour.count / Math.max(...reportData.busyHours.map(h => h.count))) * 100}%`
                    }}
                  >
                    <span className="hour-label">{hour.hour}</span>
                    <span className="hour-count">{hour.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
