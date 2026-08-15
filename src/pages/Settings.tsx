import React, { useState, useEffect } from 'react';
import { useAppContext, db } from '../store/AppContext';
import { Save, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { SystemSettings } from '../types';

export const Settings = () => {
  const { settings, updateSettings, isLoading } = useAppContext();
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sincronizar estado inicial una vez que haya cargado, sin sobrescribir mientras el usuario edita
  useEffect(() => {
    if (!isLoading && !isLoaded) {
      setFormData(settings);
      setIsLoaded(true);
    }
  }, [settings, isLoading, isLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuración del Sistema</h1>
          <p className="text-slate-500 mt-2">Personaliza el diseño del recibo, logo de la tienda y la tasa de impuestos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Logo y General */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Logo e Identidad</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Logo del Sistema (Imagen)</label>
                <div className="flex items-start gap-6">
                  {formData.logoUrl && (
                    <div className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                      <img src={formData.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <label className="flex cursor-pointer bg-white border border-slate-200 border-dashed rounded-xl p-3 text-center hover:bg-slate-50 transition-colors">
                      <span className="text-sm text-slate-600 font-medium flex items-center justify-center w-full gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Subir desde el dispositivo
                      </span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          // Helper to resize image and force JPEG for max compression
                          const resizeImage = (file: File): Promise<string> => {
                            return new Promise((resolve) => {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  const MAX_WIDTH = 1024;
                                  const MAX_HEIGHT = 1024;
                                  let width = img.width;
                                  let height = img.height;
                                  
                                  if (width > height) {
                                    if (width > MAX_WIDTH) {
                                      height *= MAX_WIDTH / width;
                                      width = MAX_WIDTH;
                                    }
                                  } else {
                                    if (height > MAX_HEIGHT) {
                                      width *= MAX_HEIGHT / height;
                                      height = MAX_HEIGHT;
                                    }
                                  }
                                  
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  if (ctx) {
                                    ctx.fillStyle = '#FFFFFF';
                                    ctx.fillRect(0, 0, width, height);
                                    ctx.drawImage(img, 0, 0, width, height);
                                  }
                                  
                                  // Empezamos con una calidad decente
                                  let quality = 0.8;
                                  let dataUrl = canvas.toDataURL('image/jpeg', quality);
                                  
                                  // Verificamos si supera 1MB (1MB en base64 es aprox 1.33MB de texto, pero calculamos los bytes exactos)
                                  // (dataUrl.length * 0.75) nos da los bytes aproximados
                                  while (dataUrl.length * 0.75 > 1048576 && quality > 0.1) {
                                    quality -= 0.1;
                                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                                  }
                                  
                                  resolve(dataUrl);
                                };
                                img.src = e.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            });
                          };

                          try {
                            const resizedBase64 = await resizeImage(file);
                            setFormData({...formData, logoUrl: resizedBase64});
                          } catch (err) {
                            console.error('Error procesando imagen:', err);
                          }
                        }}
                      />
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ImageIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <input 
                        type="url" 
                        value={formData.logoUrl}
                        onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="O pega una URL (https://...)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Ticket */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Datos del Recibo (Ticket)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nombre de la Empresa</label>
                <input 
                  type="text" 
                  value={formData.storeName}
                  onChange={e => setFormData({...formData, storeName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Identificador Fiscal (RUT/RFC/CIF)</label>
                <input 
                  type="text" 
                  value={formData.storeRut}
                  onChange={e => setFormData({...formData, storeRut: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dirección</label>
                <input 
                  type="text" 
                  value={formData.storeAddress}
                  onChange={e => setFormData({...formData, storeAddress: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Teléfono</label>
                <input 
                  type="text" 
                  value={formData.storePhone}
                  onChange={e => setFormData({...formData, storePhone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mensaje de Pie de Página (Footer)</label>
                <input 
                  type="text" 
                  value={formData.ticketMessage}
                  onChange={e => setFormData({...formData, ticketMessage: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="¡Gracias por su compra!"
                />
              </div>
            </div>
          </div>

          {/* Facturación y Finanzas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Facturación y Finanzas</h2>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Porcentaje de Impuestos (IVA, IGV, etc)</label>
              <div className="relative max-w-xs">
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.taxRate === 0 ? '' : formData.taxRate}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({...formData, taxRate: val ? parseInt(val, 10) : 0});
                  }}
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-bold">%</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-2">Este valor será utilizado para calcular automáticamente los impuestos en el carrito.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
              type="submit"
              className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 flex items-center gap-2 transition-colors"
            >
              <Save className="w-5 h-5" />
              Guardar Configuración
            </button>

            {showSuccess && (
              <span className="text-green-600 font-medium flex items-center gap-1 animate-pulse">
                <CheckCircle className="w-5 h-5" />
                Guardado exitosamente
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
