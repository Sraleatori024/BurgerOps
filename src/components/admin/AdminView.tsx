import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from './AdminSidebar';
import { DashboardView } from './DashboardView';
import { OrdersView } from './OrdersView';
import { RecipesView } from './RecipesView';
import { InventoryView } from './InventoryView';
import { PurchasesView } from './PurchasesView';
import { YieldCalculatorView } from './YieldCalculatorView';
import { PricingCalculatorView } from './PricingCalculatorView';
import { PurchaseSimulatorView } from './PurchaseSimulatorView';
import { RestockAlertsView } from './RestockAlertsView';
import { CustomersView } from './CustomersView';
import { ReportsView } from './ReportsView';
import { SettingsView } from './SettingsView';

export const AdminView: React.FC = () => {
  const { adminTab } = useApp();

  const renderActiveTab = () => {
    switch (adminTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrdersView />;
      case 'recipes':
        return <RecipesView />;
      case 'inventory':
        return <InventoryView />;
      case 'purchases':
        return <PurchasesView />;
      case 'yield':
        return <YieldCalculatorView />;
      case 'pricing':
        return <PricingCalculatorView />;
      case 'simulator':
        return <PurchaseSimulatorView />;
      case 'restock':
        return <RestockAlertsView />;
      case 'customers':
        return <CustomersView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div id="admin-view-root" className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
      {/* Persistent Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">{renderActiveTab()}</div>
      </main>
    </div>
  );
};
