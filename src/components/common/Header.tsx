import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  UtensilsCrossed,
  LayoutDashboard,
  ShoppingBag,
  Menu,
  RotateCcw,
  AlertTriangle,
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
    setMobileMenuOpen,
  } = useApp();

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'novo' || o.status === 'em_preparacao').length;
  const lowStockCount = ingredients.filter((i) => i.stockQuantity <= i.minStock).length;

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-white/10 w-full max-w-full overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger Button on Mobile / Tablet */}
            <button
              id="mobile-menu-trigger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir Menu de Navegação"
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 transition-colors flex items-center justify-center shrink-0"
            >
              <Menu className="w-5 h-5 text-[#F27D26]" />
            </button>

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 cursor-pointer" onClick={() => setActiveView(activeView === 'admin' ? 'customer' : 'admin')}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#F27D26] flex items-center justify-center shadow-md text-black font-black text-base shrink-0">
                B
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-['Outfit',sans-serif] font-black text-lg sm:text-xl tracking-tight text-white truncate">
                    Burger<span className="text-[#F27D26]">Ops</span>
                  </span>
                  <span className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-white/5 text-[#F27D26] border border-white/10">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium hidden lg:block truncate max-w-[200px]">
                  {settings.tagline || 'Gestão Inteligente & Cardápio'}
                </p>
              </div>
            </div>
          </div>

          {/* Center Mode Switcher */}
          <div className="flex items-center bg-[#141414] p-0.5 sm:p-1 rounded-xl border border-white/10 shrink-0">
            <button
              id="switch-to-customer-view"
              onClick={() => setActiveView('customer')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-150 ${
                activeView === 'customer'
                  ? 'bg-[#F27D26] text-black shadow font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Cardápio</span>
            </button>

            <button
              id="switch-to-admin-view"
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-150 relative ${
                activeView === 'admin'
                  ? 'bg-[#F27D26] text-black shadow font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Gestão</span>
              {pendingOrdersCount > 0 && (
                <span className="inline-flex items-center justify-center px-1 py-0.2 text-[9px] font-black rounded-full bg-red-500 text-white">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Action Icons & Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Reset Demo Data button on desktop */}
            <button
              id="reset-demo-data-btn"
              onClick={resetToDemoData}
              title="Restaurar dados de teste"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Admin low stock warning */}
            {activeView === 'admin' && lowStockCount > 0 && (
              <div
                title={`${lowStockCount} insumos com estoque baixo`}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden lg:inline">{lowStockCount} Baixos</span>
                <span className="lg:hidden">{lowStockCount}</span>
              </div>
            )}

            {/* Cart Trigger */}
            <button
              id="open-cart-btn"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#F27D26] text-black font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 shadow-md shadow-black/40 transition-all"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartTotalItems > 0 && (
                <span className="flex items-center bg-black text-[#F27D26] px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold">
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
