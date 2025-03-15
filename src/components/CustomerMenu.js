import React, { useState } from 'react';
import './CustomerMenu.css';

const CATEGORIES = {
  MAIN: 'Ana Yemekler',
  APPETIZER: 'Başlangıçlar',
  DESSERT: 'Tatlılar',
  DRINK: 'İçecekler'
};

const PLACEHOLDER_IMAGES = {
  kofte: 'https://cdn.pixabay.com/photo/2019/09/26/18/23/meat-balls-4506479_1280.jpg',
  tavuk: 'https://cdn.pixabay.com/photo/2016/03/05/19/24/chicken-1238650_1280.jpg',
  corba: 'https://cdn.pixabay.com/photo/2018/01/01/17/57/fish-soup-3054627_1280.jpg',
  humus: 'https://cdn.pixabay.com/photo/2021/01/10/03/48/hummus-5903409_1280.jpg',
  kunefe: 'https://cdn.pixabay.com/photo/2019/11/09/17/02/dessert-4614773_1280.jpg',
  sutlac: 'https://cdn.pixabay.com/photo/2019/03/18/14/08/rice-pudding-4062784_1280.jpg',
  ayran: 'https://cdn.pixabay.com/photo/2019/12/11/11/54/ayran-4688084_1280.jpg',
  kahve: 'https://cdn.pixabay.com/photo/2016/04/26/16/58/coffee-1354786_1280.jpg'
};

const CustomerMenu = ({ onOrder }) => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.MAIN);
  const [cart, setCart] = useState([]);

  const menuItems = {
    [CATEGORIES.MAIN]: [
      { 
        id: 1, 
        name: 'Köfte', 
        price: 120, 
        description: 'Izgara köfte, yanında pilav ve ızgara sebze ile',
        image: PLACEHOLDER_IMAGES.kofte
      },
      { 
        id: 2, 
        name: 'Tavuk Şiş', 
        price: 100, 
        description: 'Marine edilmiş tavuk şiş, yanında bulgur pilavı ile',
        image: PLACEHOLDER_IMAGES.tavuk
      }
    ],
    [CATEGORIES.APPETIZER]: [
      { 
        id: 3, 
        name: 'Mercimek Çorbası', 
        price: 45, 
        description: 'Geleneksel mercimek çorbası',
        image: PLACEHOLDER_IMAGES.corba
      },
      { 
        id: 4, 
        name: 'Humus', 
        price: 55, 
        description: 'Nohut ezmesi, zeytinyağı ve baharatlar ile',
        image: PLACEHOLDER_IMAGES.humus
      }
    ],
    [CATEGORIES.DESSERT]: [
      { 
        id: 5, 
        name: 'Künefe', 
        price: 75, 
        description: 'Antep fıstıklı künefe, dondurma ile servis edilir',
        image: PLACEHOLDER_IMAGES.kunefe
      },
      { 
        id: 6, 
        name: 'Sütlaç', 
        price: 45, 
        description: 'Fırında pişmiş geleneksel sütlaç',
        image: PLACEHOLDER_IMAGES.sutlac
      }
    ],
    [CATEGORIES.DRINK]: [
      { 
        id: 7, 
        name: 'Ayran', 
        price: 15, 
        description: 'Taze ayran',
        image: PLACEHOLDER_IMAGES.ayran
      },
      { 
        id: 8, 
        name: 'Türk Kahvesi', 
        price: 30, 
        description: 'Geleneksel Türk kahvesi',
        image: PLACEHOLDER_IMAGES.kahve
      }
    ]
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) {
        return prevCart.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === itemId);
      if (existingItem.quantity > 1) {
        return prevCart.map(i =>
          i.id === itemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }
      return prevCart.filter(i => i.id !== itemId);
    });
  };

  const handleOrder = () => {
    if (cart.length > 0) {
      onOrder(cart);
      setCart([]);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="customer-menu">
      <div className="category-tabs">
        {Object.values(CATEGORIES).map(category => (
          <button
            key={category}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="menu-items">
        {menuItems[selectedCategory].map(item => (
          <div key={item.id} className="menu-item">
            <div className="item-image-container">
              <img src={item.image} alt={item.name} className="item-image" loading="lazy" />
            </div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p className="price">{item.price} ₺</p>
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(item)}
              >
                Sepete Ekle
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart">
          <div className="cart-header">
            <h3>Sepetim</h3>
            <span className="cart-total-items">({cart.reduce((total, item) => total + item.quantity, 0)} ürün)</span>
          </div>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <span className="cart-item-name">{item.name}</span>
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => removeFromCart(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => addToCart(item)}>+</button>
                </div>
                <span className="cart-item-price">{item.price * item.quantity} ₺</span>
              </div>
            ))}
          </div>
          <div className="cart-total">
            <span>Toplam:</span>
            <span>{getTotalPrice()} ₺</span>
          </div>
          <button className="order-btn" onClick={handleOrder}>
            Sipariş Ver
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
