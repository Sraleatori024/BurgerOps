/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Toast } from './components/common/Toast';
import { CustomerView } from './components/customer/CustomerView';
import { AdminView } from './components/admin/AdminView';

const MainLayout: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 font-sans selection:bg-[#F27D26] selection:text-black flex flex-col">
      <Header />
      <div className="flex-1">
        {activeView === 'customer' ? <CustomerView /> : <AdminView />}
      </div>
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

