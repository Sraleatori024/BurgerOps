import React from 'react';
import { useApp, AdminTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  Calculator,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  BarChart3,
  Settings,
  X,
  ChevronRight,
  Sparkles,
  Utensils,
} from 'lucide-react';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  category: string;
}

export const AdminSidebar: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    orders,
    ingredients,
    mobileMenuOpen,
    setMobileMenuOpen,
    setActiveView,
  } = useApp();

  const pendingOrders = orders.filter((o) => o.status === 'novo' || o.status === 'em_preparacao').length;
  const lowStockCount = ingredients.filter((i) => i.stockQuantity <= i.minStock).length;

  const NAV_ITEMS: NavItem[] = [
    // Visão Geral
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Visão Geral' },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: ClipboardList,
      badge: pendingOrders > 0 ? pendingOrders : undefined,
      badgeColor: 'bg-rose-500 text-white',
      category: 'Operação',
    },
    // Custos & Receitas
    { id: 'recipes', label: 'Ficha Técnica & Produtos', icon: UtensilsCrossed, category: 'Custos & Receitas' },
    { id: 'yield', label: 'Cálculo de Rendimento', icon: Calculator, category: 'Custos & Receitas' },
    { id: 'pricing', label: 'Precificação Inteligente', icon: DollarSign, category: 'Custos & Receitas' },
    // Suprimentos
    {
      id: 'inventory',
      label: 'Ingredientes & Estoque',
      icon: Layers,
      badge: lowStockCount > 0 ? `${lowStockCount} baixos` : undefined,
      badgeColor: 'bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/30',
      category: 'Suprimentos',
    },
    { id: 'purchases', label: 'Registro de Compras', icon: ShoppingBag, category: 'Suprimentos' },
    {
      id: 'restock',
      label: 'O que preciso comprar?',
      icon: AlertTriangle,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      category: 'Suprimentos',
    },
    { id: 'simulator', label: 'Simulador de Compra', icon: TrendingUp, category: 'Suprimentos' },
    // Estratégia
    { id: 'customers', label: 'Clientes & CRM', icon: Users, category: 'Estratégia' },
    { id: 'reports', label: 'Relatórios & Lucro', icon: BarChart3, category: 'Estratégia' },
    { id: 'settings', label: 'Configurações', icon: Settings, category: 'Estratégia' },
  ];

  const categories = Array.from(new Set(NAV_ITEMS.map((item) => item.category)));

  const handleSelectTab = (tabId: AdminTab) => {
    setAdminTab(tabId);
    setMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-5">
        {/* Restaurant Status Card */}
        <div className="p-3 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F27D26] flex items-center justify-center text-black font-black text-sm shrink-0">
            B
          </div>
          <div className="overflow-hidden min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                Sistema Operando
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate">BurgerOps Gerente</p>
          </div>
        </div>

        {/* Categorized Nav List */}
        <nav className="space-y-4">
          {categories.map((category) => (
            <div key={category} className="space-y-1">
              <h4 className="px-3 text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-mono">
                {category}
              </h4>
              <div className="space-y-0.5">
                {NAV_ITEMS.filter((item) => item.category === category).map((item) => {
                  const isActive = adminTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      id={`admin-nav-${item.id}`}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#F27D26]/10 border border-[#F27D26]/40 text-[#F27D26] font-semibold'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F27D26]' : 'text-gray-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-1.5 ${
                            item.badgeColor || 'bg-white/10 text-gray-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer System Info & Quick Switch */}
      <div className="pt-4 mt-6 border-t border-white/10 space-y-3">
        <button
          onClick={() => {
            setActiveView('customer');
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <Utensils className="w-3.5 h-3.5 text-[#F27D26]" />
          <span>Ir para Área do Cliente</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>Versão</span>
          <span className="font-mono text-gray-400">v2.4 Pro</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside
        id="admin-sidebar-desktop"
        className="hidden lg:flex w-64 bg-[#0D0D0D] border-r border-white/10 shrink-0 flex-col py-6 px-4 min-h-screen sticky top-16"
      >
        {navContent}
      </aside>

      {/* 2. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            id="mobile-drawer-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Container */}
          <div
            id="mobile-drawer-content"
            className="relative z-50 w-4/5 max-w-xs bg-[#0D0D0D] border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl h-full overflow-hidden animate-in slide-in-from-left duration-200"
          >
            {/* Mobile Drawer Top Header */}
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F27D26] flex items-center justify-center text-black font-black text-sm">
                  B
                </div>
                <span className="font-bold text-white text-sm font-['Outfit']">
                  Burger<span className="text-[#F27D26]">Ops</span> Gestão
                </span>
              </div>

              <button
                id="close-mobile-menu-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
