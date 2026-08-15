import React from 'react';
import { Order } from '../types';
import { format } from 'date-fns';
import { Printer, X } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ order, onClose }) => {
  const { settings } = useAppContext();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 print-overlay">
      <div className="bg-white w-[300px] shadow-2xl p-6 flex flex-col font-mono text-[10px] leading-tight text-black relative overflow-hidden receipt-container print-area">
        
        {/* Top Accent line (Not printed in reality usually but fits theme) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600 no-print"></div>

        {/* Contenido del Ticket */}
        <div className="text-center space-y-1 mb-4 pt-2 flex flex-col items-center">
          {settings.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="max-w-[120px] max-h-16 object-contain mb-2 grayscale" />
          )}
          <p className="text-xs font-bold">{settings.storeName}</p>
          <p>{settings.storeRut}</p>
          <p>{settings.storeAddress}</p>
          <p>{settings.storePhone}</p>
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2 flex justify-between">
          <span>FACTURA: #{order.id}</span>
          <span>{format(new Date(order.date), 'MM/dd/yyyy')}</span>
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2">
          <div className="flex justify-between font-bold mb-1">
            <span>PRODUCTO</span>
            <span className="w-8 text-center">CANT</span>
            <span>TOTAL</span>
          </div>
          
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between mt-1 uppercase">
              <span className="truncate pr-2 w-32">{item.product.name}</span>
              <span className="w-8 text-center">{item.quantity}</span>
              <span>{(item.quantity * item.product.price).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 text-right mb-4">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>IVA ({settings.taxRate}%):</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-xs pt-1 border-t border-black mt-1">
            <span>TOTAL:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Barcode simulation */}
        <div className="text-center space-y-2 mt-2">
          <div className="flex flex-col items-center">
            <div className="w-full h-8 bg-black/10 flex items-center justify-center gap-1 overflow-hidden">
              <div className="h-full w-0.5 bg-black"></div>
              <div className="h-full w-1 bg-black"></div>
              <div className="h-full w-0.5 bg-black"></div>
              <div className="h-full w-2 bg-black"></div>
              <div className="h-full w-0.5 bg-black"></div>
              <div className="h-full w-1.5 bg-black"></div>
              <div className="h-full w-0.5 bg-black"></div>
              <div className="h-full w-1 bg-black"></div>
              <div className="h-full w-1 bg-black"></div>
              <div className="h-full w-0.5 bg-black"></div>
              <div className="h-full w-2 bg-black"></div>
            </div>
            <p className="mt-1 tracking-[0.3em]">{order.id}85721102</p>
          </div>
          <p className="italic opacity-70">{settings.ticketMessage}</p>
        </div>

        {/* Botones (No imprimibles) */}
        <div className="mt-6 flex gap-2 no-print">
          <button 
            onClick={handlePrint}
            className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-sans font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 text-slate-700 rounded-lg font-sans font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
