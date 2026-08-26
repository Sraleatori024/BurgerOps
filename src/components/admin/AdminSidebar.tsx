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
  Sparkles,
  ChevronRight,
  Flame,
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
  const { adminTab, setAdminTab, orders, ingredients } = useApp();

  const pendingOrders = orders.filter((o) => o.status === 'novo' || o.status === 'em_preparacao').length;
  const lowStockCount = ingredients.filter((i) => i.stockQuantity <= i.minStock).length;

  const NAV_ITEMS: NavItem[] = [
    // Operação
    { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard, category: 'Visão Geral' },
    {
      id: 'orders',
      label: 'Gestão de Pedidos',
      icon: ClipboardList,
      badge: pendingOrders > 0 ? pendingOrders : undefined,
      badgeColor: 'bg-rose-500 text-white',
      category: 'Operação',
    },
    // Engenharia de Cardápio & Custos
    { id: 'recipes', label: 'Fichas Técnicas', icon: UtensilsCrossed, category: 'Custos & Receitas' },
    { id: 'yield', label: 'Cálculo de Rendimento', icon: Calculator, category: 'Custos & Receitas' },
    { id: 'pricing', label: 'Precificação Inteligente', icon: DollarSign, category: 'Custos & Receitas' },
    // Estoque & Compras
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
    // Gestão & Clientes
    { id: 'customers', label: 'CRM de Clientes', icon: Users, category: 'Estratégia' },
    { id: 'reports', label: 'Relatórios & Lucro', icon: BarChart3, category: 'Estratégia' },
    { id: 'settings', label: 'Configurações', icon: Settings, category: 'Estratégia' },
  ];

  // Group by category
  const categories = Array.from(new Set(NAV_ITEMS.map((item) => item.category)));

  return (
    <aside
      id="admin-sidebar"
      className="w-full lg:w-64 bg-[#0D0D0D] border-r border-white/10 shrink-0 flex flex-col justify-between py-6 px-4"
    >
      <div className="space-y-6">
        {/* Restaurant Status Card */}
        <div className="p-3.5 rounded-xl bg-[#141414] border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F27D26] flex items-center justify-center text-black font-black text-sm">
            B
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                Sistema Operando
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate">BurgerOps Gerente</p>
          </div>
        </div>

        {/* Categorized Nav List */}
        <nav className="space-y-5">
          {categories.map((category) => (
            <div key={category} className="space-y-1">
              <h4 className="px-3 text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 font-mono">
                {category}
              </h4>
              <div className="space-y-1">
                {NAV_ITEMS.filter((item) => item.category === category).map((item) => {
                  const isActive = adminTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      id={`admin-nav-${item.id}`}
                      onClick={() => setAdminTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-white/5 border border-white/10 text-[#F27D26] font-semibold'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#F27D26]' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
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

      {/* Footer System Info */}
      <div className="pt-4 border-t border-white/10 text-[11px] text-gray-500">
        <div className="flex items-center justify-between">
          <span>Versão MVP</span>
          <span className="font-mono text-gray-400">v2.4.0-demo</span>
        </div>
        <p className="text-[10px] text-gray-600 mt-1">
          Cálculos integrados ao vivo com o estoque
        </p>
      </div>
    </aside>
  );
};
