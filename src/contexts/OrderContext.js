import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerNames, setCustomerNames] = useState({});

  const addOrder = (tableId, order) => {
    setOrders(prev => ({
      ...prev,
      [tableId]: [...(prev[tableId] || []), ...order.items.map(item => ({
        ...item,
        customerName: order.customerName
      }))]
    }));

    if (order.customerName) {
      setCustomerNames(prev => ({
        ...prev,
        [tableId]: [...new Set([...(prev[tableId] || []), order.customerName])]
      }));
    }
  };

  const removeItems = (tableId, items) => {
    setOrders(prev => ({
      ...prev,
      [tableId]: prev[tableId].filter(item => !items.includes(item.id))
    }));
  };

  return (
    <OrderContext.Provider value={{
      orders,
      selectedItems,
      setSelectedItems,
      addOrder,
      removeItems,
      customerNames
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext); 