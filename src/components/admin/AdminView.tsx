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
import { Menu } from 'lucide-react';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard Geral',
  orders: 'Gestão de Pedidos',
  recipes: 'Fichas Técnicas',
  yield: 'Rendimento de Insumos',
  pricing: 'Precificação Inteligente',
  inventory: 'Ingredientes & Estoque',
  purchases: 'Registro de Compras',
  restock: 'Lista de Reposição',
  simulator: 'Simulador de Compras',
  customers: 'Clientes & CRM',
  reports: 'Relatórios & CMV',
  settings: 'Configurações',
};

export const AdminView: React.FC = () => {
  const { adminTab, setMobileMenuOpen } = useApp();

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
    <div id="admin-view-root" className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)] w-full max-w-full overflow-x-hidden">
      {/* Sidebar / Mobile Drawer */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full min-w-0 p-3 sm:p-5 lg:p-8 bg-[#0A0A0A] overflow-y-auto">
        {/* Mobile Quick Bar showing current tab name and quick drawer button */}
        <div className="lg:hidden flex items-center justify-between p-3 mb-4 rounded-xl bg-[#141414] border border-white/10 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider font-mono shrink-0">
              Módulo:
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-[#F27D26] truncate font-['Outfit']">
              {TAB_TITLES[adminTab] || 'Painel Admin'}
            </h2>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold shrink-0"
          >
            <Menu className="w-3.5 h-3.5 text-[#F27D26]" />
            <span>Módulos</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto w-full min-w-0">{renderActiveTab()}</div>
      </main>
    </div>
  );
};
