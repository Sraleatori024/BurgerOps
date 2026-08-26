import React from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatBRL, calculateRecipeProductionCapacity } from '../../utils/calculations';
import { Plus, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProductForCustomization, recipesMap, ingredientsMap } = useApp();

  const recipe = recipesMap[product.id];
  const capacity = calculateRecipeProductionCapacity(recipe, ingredientsMap);
  const isOutOfStock = !product.isAvailable || (recipe && capacity.maxSellablePortions === 0);
  const isLowStock = recipe && capacity.maxSellablePortions > 0 && capacity.maxSellablePortions <= 3;

  return (
    <div
      id={`product-card-${product.id}`}
      className={`group relative flex flex-col justify-between rounded-xl bg-[#141414] border border-white/10 overflow-hidden shadow-lg hover:border-white/20 transition-all duration-300 ${
        isOutOfStock ? 'opacity-60 grayscale-[40%]' : 'hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Product Image Container */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#0A0A0A]">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-80" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOutOfStock ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 backdrop-blur-md">
                Esgotado no Momento
              </span>
            ) : isLowStock ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/40 backdrop-blur-md animate-pulse">
                Últimas {capacity.maxSellablePortions} unidades!
              </span>
            ) : product.category === 'hamburgueres' ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 text-[#F27D26] border border-[#F27D26]/30 backdrop-blur-md">
                Artesanal Angus
              </span>
            ) : null}
          </div>

          {product.preparationTimeMinutes && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 text-gray-300 text-[11px] font-medium backdrop-blur-md border border-white/10">
              <Clock className="w-3 h-3 text-[#F27D26]" />
              <span>{product.preparationTimeMinutes} min</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit'] group-hover:text-[#F27D26] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer / Add button */}
      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between mt-2 border-t border-white/10">
        <div>
          <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">A partir de</span>
          <p className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
            {formatBRL(product.price)}
          </p>
        </div>

        <button
          id={`add-product-btn-${product.id}`}
          onClick={() => setSelectedProductForCustomization(product)}
          disabled={isOutOfStock}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-md ${
            isOutOfStock
              ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
              : 'bg-[#F27D26] hover:bg-[#F27D26]/90 active:scale-95 text-black shadow-black/40'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{product.availableAddons?.length || product.removableIngredients?.length ? 'Personalizar' : 'Adicionar'}</span>
        </button>
      </div>
    </div>
  );
};
