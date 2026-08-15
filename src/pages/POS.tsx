import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Receipt } from '../components/Receipt';
import { ShoppingCart, Plus, Minus, Trash2, Search } from 'lucide-react';
import { Order } from '../types';

export const POS = () => {
  const { products, isLoading, cart, addToCart, removeFromCart, updateCartQuantity, checkout } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const handleCheckout = () => {
    const order = checkout();
    if (order) {
      setCompletedOrder(order);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Products Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-4 bg-white border-b border-slate-100 shrink-0 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
              Cargando productos...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => {
                const inCart = cart.find(item => item.product.id === product.id);
                const cartQty = inCart ? inCart.quantity : 0;
                
                return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`flex flex-col bg-white p-3 rounded-2xl border shadow-sm transition-all text-left relative ${
                    product.stock === 0 
                      ? 'opacity-60 cursor-not-allowed grayscale border-slate-200' 
                      : cartQty > 0 
                        ? 'border-indigo-200 ring-2 ring-indigo-500 shadow-md' 
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  {cartQty > 0 && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-sm">
                      {cartQty}
                    </div>
                  )}
                  <div className="h-32 w-full overflow-hidden bg-slate-100 rounded-xl mb-3 flex items-center justify-center">
                    <img 
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=300&q=80'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 justify-end">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-black text-slate-900">${product.price.toFixed(2)}</span>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${
                        product.stock > 10 ? 'bg-green-50 text-green-700 border-green-100' : 
                        product.stock > 0 ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {product.stock} Disp.
                      </span>
                    </div>
                  </div>
                </button>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-[50vh] lg:h-full shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Nueva Venta
          </h2>
          <span className="text-xs text-slate-400 font-mono tracking-widest">
            {cart.length > 0 ? `${cart.reduce((sum, item) => sum + item.quantity, 0)} ITEMS` : 'VACÍO'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">${item.product.price.toFixed(2)}/u</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold w-4 text-center text-sm text-slate-900">{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                    disabled={item.quantity >= item.product.stock}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-right w-16 shrink-0">
                  <p className="font-bold text-sm text-slate-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-slate-300 hover:text-red-500 p-1 shrink-0 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3 pb-safe">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Impuestos (16%)</span>
            <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-black pt-2 border-t border-slate-200">
            <span className="text-slate-900">Total</span>
            <span className="text-indigo-600">${total.toFixed(2)}</span>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Facturar y Generar Ticket
          </button>
        </div>
      </div>

      {completedOrder && (
        <Receipt 
          order={completedOrder} 
          onClose={() => setCompletedOrder(null)} 
        />
      )}
    </div>
  );
};
