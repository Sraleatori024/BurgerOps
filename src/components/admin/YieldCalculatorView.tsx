import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateYield, formatBRL, calculateRecipeProductionCapacity } from '../../utils/calculations';
import {
  Calculator,
  AlertCircle,
} from 'lucide-react';

export const YieldCalculatorView: React.FC = () => {
  const { ingredients, products, recipesMap, ingredientsMap } = useApp();

  const [selectedIngredientId, setSelectedIngredientId] = useState<string>(
    ingredients[0]?.id || ''
  );
  const [totalQuantity, setTotalQuantity] = useState<number>(5);
  const [portionSize, setPortionSize] = useState<number>(0.18); // 180g or 0.18kg
  const [portionSalePrice, setPortionSalePrice] = useState<number>(36.9);

  const selectedIngredient = ingredients.find((i) => i.id === selectedIngredientId) || ingredients[0];
  const unitCost = selectedIngredient ? selectedIngredient.unitCost : 0;
  const totalCost = totalQuantity * unitCost;

  // Real-time yield math
  const yieldResult = calculateYield(totalQuantity, portionSize, totalCost, portionSalePrice);

  // Cross-recipe bottleneck analysis for all products
  const bottleneckList = products.map((product) => {
    const recipe = recipesMap[product.id];
    const capacity = calculateRecipeProductionCapacity(recipe, ingredientsMap);
    return {
      product,
      capacity,
    };
  });

  return (
    <div id="admin-yield-root" className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Outfit'] truncate">
          Cálculo de Rendimento & Capacidade
        </h1>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
          Simule o aproveitamento exato da matéria-prima e descubra gargalos de produção.
        </p>
      </div>

      {/* Main Yield Simulator Card */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#141414] border border-white/10 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F27D26]/10 border border-[#F27D26]/20 flex items-center justify-center text-[#F27D26] shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white font-['Outfit'] truncate">
              Simulador de Rendimento de Matéria-Prima
            </h2>
            <p className="text-[11px] text-gray-400 truncate">
              Ex: 5 kg de blend / 180g por burger = total de porções e faturamento.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-gray-400 font-bold mb-1 block font-mono">
              Insumo / Matéria-Prima
            </label>
            <select
              value={selectedIngredientId}
              onChange={(e) => {
                setSelectedIngredientId(e.target.value);
                const ing = ingredients.find((i) => i.id === e.target.value);
                if (ing && ing.unit === 'kg') {
                  setTotalQuantity(5);
                  setPortionSize(0.18);
                } else if (ing && ing.unit === 'un') {
                  setTotalQuantity(50);
                  setPortionSize(1);
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({formatBRL(ing.unitCost)}/{ing.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 font-bold mb-1 block font-mono">
              Qtd Comprada ({selectedIngredient?.unit || 'un'})
            </label>
            <input
              type="number"
              step="any"
              min={0.01}
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div>
            <label className="text-gray-400 font-bold mb-1 block font-mono">
              Tamanho Porção ({selectedIngredient?.unit || 'un'})
            </label>
            <input
              type="number"
              step="any"
              min={0.001}
              value={portionSize}
              onChange={(e) => setPortionSize(Number(e.target.value))}
              placeholder="Ex: 0.18 para 180g"
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div>
            <label className="text-gray-400 font-bold mb-1 block font-mono">
              Preço de Venda (R$)
            </label>
            <input
              type="number"
              step="any"
              min={1}
              value={portionSalePrice}
              onChange={(e) => setPortionSalePrice(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
          </div>
        </div>

        {/* Results 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-3 border-t border-white/10">
          <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10">
            <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Porções Produzidas</span>
            <p className="text-base sm:text-xl font-black text-[#F27D26] font-['Outfit'] mt-0.5">
              {yieldResult.portions} porções
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              Sobra: {yieldResult.leftover.toFixed(2)} {selectedIngredient?.unit}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10">
            <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Custo p/ Porção</span>
            <p className="text-base sm:text-xl font-black text-red-300 font-mono mt-0.5">
              {formatBRL(yieldResult.costPerPortion)}
            </p>
            <p className="text-[10px] text-gray-500 truncate">Lote: {formatBRL(totalCost)}</p>
          </div>

          <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10">
            <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Faturamento</span>
            <p className="text-base sm:text-xl font-black text-white font-['Outfit'] mt-0.5">
              {formatBRL(yieldResult.potentialRevenue)}
            </p>
            <p className="text-[10px] text-gray-500 truncate">{yieldResult.portions} x {formatBRL(portionSalePrice)}</p>
          </div>

          <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10">
            <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Lucro & Margem</span>
            <p className="text-base sm:text-xl font-black text-green-400 font-mono mt-0.5">
              +{formatBRL(yieldResult.potentialProfit)}
            </p>
            <p className="text-[10px] text-green-400 font-semibold truncate">
              {yieldResult.profitMargin.toFixed(0)}% margem
            </p>
          </div>
        </div>
      </div>

      {/* Production Capacity & Bottlenecks per Product */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#141414] border border-white/10 space-y-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide font-mono">
            Capacidade de Produção Imediata & Gargalos
          </h3>
          <p className="text-[11px] text-gray-400">
            Quantidade máxima que sua hamburgueria pode produzir agora com o estoque atual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bottleneckList.map(({ product, capacity }) => {
            const isZero = capacity.maxPortions === 0;

            return (
              <div
                key={product.id}
                className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10 flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
                      <span className="text-[10px] font-bold text-[#F27D26]">
                        {formatBRL(product.price)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-lg font-black font-['Outfit'] ${
                        isZero ? 'text-red-500' : 'text-green-400'
                      }`}
                    >
                      {capacity.maxPortions}
                    </span>
                    <p className="text-[9px] text-gray-500 uppercase font-bold">porções máx</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 text-[11px]">
                  {capacity.bottleneckIngredient ? (
                    <div className="flex items-center gap-1.5 text-red-300">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      <span className="truncate">
                        Gargalo: <strong className="text-white">{capacity.bottleneckIngredient}</strong> ({capacity.bottleneckStock})
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Sem restrição de estoque</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
