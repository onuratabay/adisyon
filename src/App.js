import React, { useState } from 'react';
import './App.css';
import UserAuth from './components/UserAuth';
import OrderList from './components/OrderList';
import InventoryManager from './components/InventoryManager';
import TableManager from './components/TableManager';
import ReservationManager from './components/ReservationManager';
import Reports from './components/Reports';
import CustomerDashboard from './components/CustomerDashboard';
import CustomerMenu from './components/CustomerMenu';
import CustomerBill from './components/CustomerBill';

const ROLE_PERMISSIONS = {
  admin: ['orders', 'tables', 'reservations', 'inventory', 'reports'],
  kasa: ['orders', 'reports'],
  garson: ['orders', 'tables'],
  müşteri: ['dashboard', 'menu', 'bill']
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    setActiveTab(permissions[0] || 'dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('orders');
  };

  const canAccessTab = (tab) => {
    if (!currentUser) return false;
    return ROLE_PERMISSIONS[currentUser.role]?.includes(tab);
  };

  const updateStock = (orderedItems) => {
    orderedItems.forEach(item => {
      const product = products.find(p => p.name === item.name);
      if (product) {
        product.ingredients.forEach(productIngredient => {
          setIngredients(prevIngredients => 
            prevIngredients.map(ingredient => {
              if (ingredient.id === productIngredient.id) {
                const newQuantity = parseFloat(ingredient.quantity) - 
                  (parseFloat(productIngredient.quantity) * parseFloat(item.quantity));
                return {
                  ...ingredient,
                  quantity: Math.max(0, newQuantity).toString()
                };
              }
              return ingredient;
            })
          );
        });
      }
    });
  };

  const handleOrderUpdate = (updatedOrders) => {
    setOrders(updatedOrders);
  };

  const handleTableUpdate = (updatedTables) => {
    setTables(updatedTables);
  };

  const handleNewOrder = (items) => {
    const newOrder = {
      id: Date.now(),
      tableId: currentUser.tableId,
      items,
      status: 'pending',
      timestamp: new Date().toISOString(),
      userId: currentUser.username
    };
    setOrders(prev => [...prev, newOrder]);
    updateStock(items);
  };

  const handlePayment = (paymentDetails) => {
    // TODO: Implement payment processing
    console.log('Processing payment:', paymentDetails);
  };

  if (!currentUser) {
    return (
      <div className="App">
        <UserAuth onLogin={handleLogin} />
      </div>
    );
  }

  // Müşteri arayüzü
  if (currentUser.role === 'müşteri') {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Restoran Menü</h1>
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Ana Sayfa
            </button>
            <button 
              className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              Menü
            </button>
            <button 
              className={`nav-tab ${activeTab === 'bill' ? 'active' : ''}`}
              onClick={() => setActiveTab('bill')}
            >
              Adisyon
            </button>
          </nav>
          <div className="user-nav">
            <UserAuth currentUser={currentUser} onLogout={handleLogout} />
          </div>
        </header>
        <main>
          {activeTab === 'dashboard' && (
            <CustomerDashboard 
              tableId={currentUser.tableId}
              onMenuClick={() => setActiveTab('menu')}
              onBillClick={() => setActiveTab('bill')}
            />
          )}
          {activeTab === 'menu' && (
            <CustomerMenu 
              onOrder={handleNewOrder}
            />
          )}
          {activeTab === 'bill' && (
            <CustomerBill
              tableId={currentUser.tableId}
              orders={orders.filter(o => o.tableId === currentUser.tableId)}
              personalOrders={orders.filter(o => o.userId === currentUser.username)}
              onPayment={handlePayment}
            />
          )}
        </main>
      </div>
    );
  }

  // Personel arayüzü
  return (
    <div className="App">
      <header className="App-header">
        <h1>Adisyon Takip Sistemi</h1>
        <nav className="nav-tabs">
          {canAccessTab('orders') && (
            <button 
              className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Siparişler
            </button>
          )}
          {canAccessTab('tables') && (
            <button 
              className={`nav-tab ${activeTab === 'tables' ? 'active' : ''}`}
              onClick={() => setActiveTab('tables')}
            >
              Masalar
            </button>
          )}
          {canAccessTab('reservations') && (
            <button 
              className={`nav-tab ${activeTab === 'reservations' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservations')}
            >
              Rezervasyonlar
            </button>
          )}
          {canAccessTab('inventory') && (
            <button 
              className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              Stok
            </button>
          )}
          {canAccessTab('reports') && (
            <button 
              className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              Raporlar
            </button>
          )}
        </nav>
        <div className="user-nav">
          <UserAuth currentUser={currentUser} onLogout={handleLogout} />
        </div>
      </header>
      <main>
        {activeTab === 'orders' && (
          <OrderList 
            orders={orders}
            onOrderUpdate={handleOrderUpdate}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'tables' && (
          <TableManager 
            tables={tables}
            onTableUpdate={handleTableUpdate}
            orders={orders}
            onOrderUpdate={handleOrderUpdate}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'reservations' && (
          <ReservationManager 
            tables={tables}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'inventory' && (
          <InventoryManager 
            ingredients={ingredients}
            setIngredients={setIngredients}
            products={products}
            setProducts={setProducts}
          />
        )}
        {activeTab === 'reports' && (
          <Reports 
            orders={orders}
            products={products}
            ingredients={ingredients}
          />
        )}
      </main>
    </div>
  );
}

export default App;
