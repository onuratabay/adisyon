import React, { useState } from 'react';
import './InventoryManager.css';

const InventoryManager = () => {
  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ 
    name: '', 
    unit: 'kg',
    quantity: '',
    minQuantity: ''
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    ingredients: []
  });
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');

  const handleIngredientSubmit = (e) => {
    e.preventDefault();
    if (newIngredient.name && newIngredient.quantity) {
      setIngredients(prev => [...prev, { ...newIngredient, id: Date.now() }]);
      setNewIngredient({ name: '', unit: 'kg', quantity: '', minQuantity: '' });
    }
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price) {
      setProducts(prev => [...prev, { ...newProduct, id: Date.now() }]);
      setNewProduct({ name: '', price: '', ingredients: [] });
    }
  };

  const addIngredientToProduct = () => {
    if (selectedIngredient && selectedQuantity) {
      const ingredient = ingredients.find(i => i.id === parseInt(selectedIngredient));
      if (ingredient) {
        setNewProduct(prev => ({
          ...prev,
          ingredients: [...prev.ingredients, {
            id: ingredient.id,
            name: ingredient.name,
            quantity: parseFloat(selectedQuantity),
            unit: ingredient.unit
          }]
        }));
        setSelectedIngredient('');
        setSelectedQuantity('');
      }
    }
  };

  const removeIngredientFromProduct = (ingredientId) => {
    setNewProduct(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i.id !== ingredientId)
    }));
  };

  const removeIngredient = (id) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const removeProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const checkLowStock = (quantity, minQuantity) => {
    return parseFloat(quantity) <= parseFloat(minQuantity);
  };

  return (
    <div className="inventory-container">
      <div className="inventory-section">
        <h2>Malzeme Yönetimi</h2>
        <form onSubmit={handleIngredientSubmit} className="inventory-form">
          <div className="form-group">
            <input
              type="text"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Malzeme Adı"
              className="form-input"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="number"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Miktar"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <select
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
                className="form-input"
              >
                <option value="kg">Kilogram</option>
                <option value="g">Gram</option>
                <option value="l">Litre</option>
                <option value="adet">Adet</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <input
              type="number"
              value={newIngredient.minQuantity}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, minQuantity: e.target.value }))}
              placeholder="Minimum Stok Miktarı"
              className="form-input"
            />
          </div>
          <button type="submit" className="submit-button">Malzeme Ekle</button>
        </form>

        <div className="ingredients-list">
          {ingredients.map(ingredient => (
            <div key={ingredient.id} className={`ingredient-card ${checkLowStock(ingredient.quantity, ingredient.minQuantity) ? 'low-stock' : ''}`}>
              <h3>{ingredient.name}</h3>
              <p>Stok: {ingredient.quantity} {ingredient.unit}</p>
              <p>Min. Stok: {ingredient.minQuantity} {ingredient.unit}</p>
              <button onClick={() => removeIngredient(ingredient.id)} className="delete-button">
                Sil
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="inventory-section">
        <h2>Ürün Yönetimi</h2>
        <form onSubmit={handleProductSubmit} className="inventory-form">
          <div className="form-group">
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ürün Adı"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
              placeholder="Fiyat"
              className="form-input"
            />
          </div>
          
          <div className="ingredient-selector">
            <select
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              className="form-input"
            >
              <option value="">Malzeme Seçin</option>
              {ingredients.map(ingredient => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(e.target.value)}
              placeholder="Miktar"
              className="form-input"
            />
            <button type="button" onClick={addIngredientToProduct} className="add-button">
              Malzeme Ekle
            </button>
          </div>

          <div className="selected-ingredients">
            {newProduct.ingredients.map(ingredient => (
              <div key={ingredient.id} className="selected-ingredient">
                <span>{ingredient.name} - {ingredient.quantity} {ingredient.unit}</span>
                <button
                  type="button"
                  onClick={() => removeIngredientFromProduct(ingredient.id)}
                  className="remove-button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button type="submit" className="submit-button">Ürün Ekle</button>
        </form>

        <div className="products-list">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p className="price">{product.price} TL</p>
              <div className="product-ingredients">
                <h4>Malzemeler:</h4>
                {product.ingredients.map(ingredient => (
                  <p key={ingredient.id}>
                    {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                  </p>
                ))}
              </div>
              <button onClick={() => removeProduct(product.id)} className="delete-button">
                Sil
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
