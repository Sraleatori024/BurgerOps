import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  UtensilsCrossed,
  LayoutDashboard,
  ShoppingBag,
  Flame,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { formatBRL } from '../../utils/calculations';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    cart,
    setCartOpen,
    orders,
    ingredients,
    settings,
    resetToDemoData,
  } = useApp();

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'novo' || o.status === 'em_preparacao').length;
  const lowStockCount = ingredients.filter((i) => i.stockQuantity <= i.minStock).length;

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#0D0D0D] backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#F27D26] flex items-center justify-center shadow-lg shadow-black/50 text-black font-bold text-lg">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Outfit',sans-serif] font-black text-xl sm:text-2xl tracking-tight text-white">
                  Burger<span className="text-[#F27D26]">Ops</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/5 text-[#F27D26] border border-white/10">
                  PRO
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium hidden md:block">
                {settings.tagline || 'Gestão Inteligente & Cardápio Digital'}
              </p>
            </div>
          </div>

          {/* Center Mode Switcher */}
          <div className="flex items-center bg-[#141414] p-1 rounded-xl border border-white/10">
            <button
              id="switch-to-customer-view"
              onClick={() => setActiveView('customer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeView === 'customer'
                  ? 'bg-[#F27D26] text-black shadow-md font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Área do Cliente</span>
            </button>

            <button
              id="switch-to-admin-view"
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 relative ${
                activeView === 'admin'
                  ? 'bg-[#F27D26] text-black shadow-md font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel Admin</span>
              {pendingOrdersCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Action Icons & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reset Demo Data button for easy client presentation */}
            <button
              id="reset-demo-data-btn"
              onClick={resetToDemoData}
              title="Restaurar dados de teste"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>

            {activeView === 'admin' && lowStockCount > 0 && (
              <div
                title={`${lowStockCount} ingredientes com estoque baixo`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{lowStockCount} Insumos Baixos</span>
              </div>
            )}

            {/* Cart Trigger */}
            <button
              id="open-cart-btn"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#F27D26] text-black font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 shadow-md shadow-black/40 transition-all"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartTotalItems > 0 && (
                <span className="flex items-center gap-1 bg-black text-[#F27D26] px-2 py-0.5 rounded-full text-xs font-extrabold">
                  {cartTotalItems} • {formatBRL(cartSubtotal)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
