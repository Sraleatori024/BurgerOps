import React from 'react';
import { ProductCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { Clock, MapPin, Phone, Sparkles, Flame, CheckCircle } from 'lucide-react';

interface MenuHeaderProps {
  selectedCategory: ProductCategory | 'todos';
  onSelectCategory: (cat: ProductCategory | 'todos') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CATEGORIES: Array<{ id: ProductCategory | 'todos'; name: string; emoji: string }> = [
  { id: 'todos', name: 'Todos os Itens', emoji: '⭐' },
  { id: 'hamburgueres', name: 'Hambúrgueres', emoji: '🍔' },
  { id: 'porcoes', name: 'Porções', emoji: '🍟' },
  { id: 'combos', name: 'Combos Especiais', emoji: '🔥' },
  { id: 'bebidas', name: 'Bebidas Geladas', emoji: '🥤' },
  { id: 'sobremesas', name: 'Sobremesas & Shakes', emoji: '🍨' },
];

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const { settings } = useApp();

  return (
    <div id="customer-menu-hero" className="mb-8">
      {/* Restaurant Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#141414] border border-white/10 p-6 sm:p-8 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F27D26]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>LOJA ABERTA AGORA • PEDIDOS ONLINE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-['Outfit'] tracking-tight">
              {settings.shopName}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mt-2 max-w-2xl font-normal leading-relaxed">
              Carnes 100% Angus frescas, pães brioche artesanais e molhos autorais. Faça seu pedido em minutos com rastreamento em tempo real.
            </p>

            {/* Quick Meta Info */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F27D26]" />
                <span>35 - 50 min de entrega</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F27D26]" />
                <span>Taxa fixa {settings.defaultDeliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#F27D26]" />
                <span>{settings.phone}</span>
              </span>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 p-4 rounded-xl backdrop-blur-md shrink-0 text-center w-full sm:w-auto">
            <div className="flex items-center justify-center gap-1 text-[#F27D26] mb-1">
              <Flame className="w-5 h-5 fill-[#F27D26]" />
              <span className="font-bold text-lg text-white">4.9 / 5.0</span>
            </div>
            <p className="text-xs text-gray-400">+1.200 avaliações de clientes</p>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Scrollable Categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#F27D26] text-black font-bold shadow-lg shadow-black/40'
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="w-full sm:w-72 shrink-0">
          <input
            id="menu-search-input"
            type="text"
            placeholder="Buscar lanches, fritas, bebidas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#141414] border border-white/10 text-white text-xs sm:text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#F27D26] transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
