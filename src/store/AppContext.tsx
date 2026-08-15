import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { init, id, tx } from '@instantdb/react';
import { Product, CartItem, Order } from '../types';

const APP_ID = '2d943233-e7f2-4526-aab6-349e06930f11';

// Initializing InstantDB
export const db = init({ appId: APP_ID });

const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Café Espresso', price: 2.50, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1510061158679-b7b51b72e1ab?auto=format&fit=crop&w=300&q=80' },
  { name: 'Latte Macchiato', price: 3.50, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=300&q=80' },
  { name: 'Croissant', price: 2.00, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&w=300&q=80' },
  { name: 'Tarta de Queso', price: 4.50, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=300&q=80' }
];

interface AppContextType {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  checkout: () => Order | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { isLoading, error, data } = db.useQuery({ products: {} });
  const products = (data?.products as Product[]) || [];
  
  const [cart, setCart] = useState<CartItem[]>([]);

  // Seed DB if empty
  useEffect(() => {
    if (!isLoading && !error && data?.products.length === 0) {
      const transactions = INITIAL_PRODUCTS.map(p => tx.products[id()].update(p));
      db.transact(transactions);
    }
  }, [isLoading, data, error]);

  // --- Funciones de Inventario ---
  const addProduct = (product: Omit<Product, 'id'>) => {
    db.transact(tx.products[id()].update(product));
  };

  const updateProduct = (updatedProduct: Product) => {
    const { id: productId, ...rest } = updatedProduct;
    db.transact(tx.products[productId].update(rest));
  };

  const deleteProduct = (productId: string) => {
    db.transact(tx.products[productId].delete());
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // --- Funciones de POS (Carrito) ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      if (product.stock > 0) {
        return [...prev, { product, quantity: 1 }];
      }
      return prev;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const validQty = Math.min(Math.max(1, quantity), item.product.stock);
        return { ...item, quantity: validQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const checkout = (): Order | null => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.16; // 16% IVA por defecto
    const total = subtotal + tax;

    const orderId = id();
    const orderDate = new Date().toISOString();

    const order: Order = {
      id: orderId,
      date: orderDate,
      items: [...cart],
      subtotal,
      tax,
      total
    };

    // Reducir stock del inventario
    const stockTransactions = cart.map(cartItem => {
      const product = products.find(p => p.id === cartItem.product.id);
      if (product) {
        return tx.products[product.id].update({ stock: Math.max(0, product.stock - cartItem.quantity) });
      }
      return null;
    }).filter(Boolean);

    // Save order to InstantDB
    const orderTransaction = tx.orders[orderId].update({
      date: orderDate,
      subtotal,
      tax,
      total,
      items: cart.map(c => ({
        productId: c.product.id,
        name: c.product.name,
        price: c.product.price,
        quantity: c.quantity
      }))
    });

    db.transact([...stockTransactions as any[], orderTransaction]);

    clearCart();
    return order;
  };

  return (
    <AppContext.Provider value={{
      products, isLoading, addProduct, updateProduct, deleteProduct,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, checkout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
