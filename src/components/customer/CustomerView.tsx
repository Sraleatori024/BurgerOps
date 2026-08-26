import React, { useState } from 'react';
import { ProductCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { MenuHeader } from './MenuHeader';
import { ProductCard } from './ProductCard';
import { ProductCustomizerModal } from './ProductCustomizerModal';
import { CartDrawer } from './CartDrawer';
import { OrderTrackerModal } from './OrderTrackerModal';
import { Utensils, Sparkles, Flame } from 'lucide-react';

export const CustomerView: React.FC = () => {
  const { products, selectedProductForCustomization, activeOrderTracker, setActiveOrderTracker } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="customer-view-root" className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Menu Header with Category Selector */}
      <MenuHeader
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Active Order Tracker Floating Pill (if any order is in flight) */}
      {activeOrderTracker && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-amber-500/40 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Pedido Ativo em Andamento</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase">
                  {activeOrderTracker.code}
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Status: <span className="text-amber-400 font-bold uppercase">{activeOrderTracker.status.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveOrderTracker(activeOrderTracker)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-colors"
          >
            Acompanhar
          </button>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-stone-900/50 rounded-3xl border border-stone-800 p-8">
          <Utensils className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-300 font-['Outfit']">Nenhum produto encontrado</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Tente buscar com outro termo ou selecionar outra categoria acima.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('todos');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-stone-800 text-stone-200 text-xs font-bold hover:bg-stone-700 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Modals & Drawers */}
      {selectedProductForCustomization && <ProductCustomizerModal />}
      <CartDrawer />
      {activeOrderTracker && (
        <OrderTrackerModal order={activeOrderTracker} onClose={() => setActiveOrderTracker(null)} />
      )}
    </div>
  );
};
