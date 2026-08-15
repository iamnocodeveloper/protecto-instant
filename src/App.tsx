/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, db } from './store/AppContext';
import { Layout } from './components/Layout';
import { POS } from './pages/POS';
import { Inventory } from './pages/Inventory';
import { Auth } from './pages/Auth';
import { Settings } from './pages/Settings';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Authentication error: {error.message}</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <AuthGuard>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<POS />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthGuard>
    </AppProvider>
  );
}

