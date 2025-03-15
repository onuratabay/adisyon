import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserRoles = {
  CUSTOMER: 'customer',
  WAITER: 'waiter',
  CASHIER: 'cashier',
  ADMIN: 'admin'
};

export function UserProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    role: UserRoles.CUSTOMER // varsayılan olarak müşteri
  });

  const addNotification = (tableId, type) => {
    const newNotification = {
      id: Date.now(),
      tableId,
      type,
      timestamp: new Date(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser,
      notifications,
      addNotification,
      markNotificationAsRead
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 