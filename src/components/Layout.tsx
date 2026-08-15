import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Store, Package, LogOut, Settings } from 'lucide-react';
import { db, useAppContext } from '../store/AppContext';

export const Layout = () => {
  const { user } = db.useAuth();
  const { settings } = useAppContext();

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden no-print">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col items-center lg:items-start shrink-0">
          <div className="h-16 flex items-center justify-center lg:justify-start w-full lg:px-6 border-b border-slate-100">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="max-h-10 max-w-full object-contain" />
            ) : (
              <>
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Store className="text-white w-5 h-5" />
                </div>
                <h1 className="hidden lg:block ml-3 font-bold tracking-tight text-xl text-slate-900">
                  InvenTrack <span className="text-indigo-600">POS</span>
                </h1>
              </>
            )}
          </div>
          
          <nav className="flex-1 w-full py-4 flex flex-col gap-2 px-3">
          <NavLink
            to="/"
            className={({ isActive }) => 
              `flex items-center p-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Store className="w-6 h-6 lg:w-5 lg:h-5 shrink-0" />
            <span className="hidden lg:block ml-3">Punto de Venta</span>
          </NavLink>
          
          <NavLink
            to="/inventory"
            className={({ isActive }) => 
              `flex items-center p-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Package className="w-6 h-6 lg:w-5 lg:h-5 shrink-0" />
            <span className="hidden lg:block ml-3">Inventario</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) => 
              `flex items-center p-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Settings className="w-6 h-6 lg:w-5 lg:h-5 shrink-0" />
            <span className="hidden lg:block ml-3">Configuración</span>
          </NavLink>
        </nav>
        
        <div className="w-full p-4 border-t border-slate-100">
          <div className="hidden lg:flex flex-col mb-4 px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cuenta</span>
            <span className="text-sm text-slate-700 font-medium truncate">{user?.email}</span>
          </div>
          <button 
            onClick={() => db.auth.signOut()}
            className="w-full flex items-center justify-center lg:justify-start p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-6 h-6 lg:w-5 lg:h-5" />
            <span className="hidden lg:block ml-3 font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
      
      {/* Footer */}
      <footer className="h-10 shrink-0 bg-slate-900 text-slate-400 flex items-center px-6 text-[10px] uppercase tracking-widest justify-between z-10">
        <div className="flex items-center">
          <span className="text-green-500 mr-2 text-xs">●</span> Sistema Conectado (InstantDB)
        </div>
        <div className="hidden sm:block">Sincronización en tiempo real activa</div>
        <div>v2.4.0</div>
      </footer>
    </div>
  );
};
