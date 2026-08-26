import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateYield, formatBRL, calculateRecipeProductionCapacity } from '../../utils/calculations';
import {
  Calculator,
  Flame,
  AlertCircle,
  TrendingUp,
  Package,
  Sparkles,
  ArrowRight,
  PieChart,
  Layers,
  CheckCircle2,
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
    <div id="admin-yield-root" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Cálculo de Rendimento & Capacidade
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Simule o aproveitamento exato da matéria-prima e descubra os gargalos de produção da cozinha.
          </p>
        </div>
      </div>

      {/* Main Yield Simulator Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F27D26]/10 border border-[#F27D26]/20 flex items-center justify-center text-[#F27D26]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">
              Simulador de Rendimento de Matéria-Prima
            </h2>
            <p className="text-xs text-gray-400">
              Ex: 5 kg de blend / 180g por burger = rendimento de porções e faturamento potencial.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Matéria-Prima / Insumo
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
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26]"
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({formatBRL(ing.unitCost)}/{ing.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Quantidade Total Comprada ({selectedIngredient?.unit || 'un'})
            </label>
            <input
              type="number"
              step="any"
              min={0.01}
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Tamanho da Porção ({selectedIngredient?.unit || 'un'})
            </label>
            <input
              type="number"
              step="any"
              min={0.001}
              value={portionSize}
              onChange={(e) => setPortionSize(Number(e.target.value))}
              placeholder="Ex: 0.18 para 180g"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Ex: 0.18 para 180g ou 0.3 para 300g
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Preço de Venda da Porção (R$)
            </label>
            <input
              type="number"
              step="any"
              min={1}
              value={portionSalePrice}
              onChange={(e) => setPortionSalePrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
          </div>
        </div>

        {/* Results 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              Porções Produzidas
            </span>
            <p className="text-2xl font-black text-[#F27D26] font-['Outfit'] mt-1">
              {yieldResult.portions} porções completas
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Sobra estimada: <span className="font-mono text-gray-300">{yieldResult.leftover.toFixed(3)} {selectedIngredient?.unit}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              Custo por Porção
            </span>
            <p className="text-2xl font-black text-red-300 font-['Outfit'] mt-1">
              {formatBRL(yieldResult.costPerPortion)}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Custo total do lote: {formatBRL(totalCost)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              Faturamento Potencial
            </span>
            <p className="text-2xl font-black text-white font-['Outfit'] mt-1">
              {formatBRL(yieldResult.potentialRevenue)}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {yieldResult.portions} x {formatBRL(portionSalePrice)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              Lucro Bruto & Margem
            </span>
            <p className="text-2xl font-black text-green-400 font-['Outfit'] mt-1">
              +{formatBRL(yieldResult.potentialProfit)}
            </p>
            <p className="text-[11px] text-green-400 font-bold mt-0.5">
              Margem de {yieldResult.profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Production Capacity & Bottlenecks per Product */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white font-['Outfit']">
            Capacidade de Produção Imediata & Gargalos
          </h3>
          <p className="text-xs text-gray-400">
            Quantidade máxima de cada burger que sua hamburgueria pode produzir agora com o estoque atual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bottleneckList.map(({ product, capacity }) => {
            const isZero = capacity.maxPortions === 0;

            return (
              <div
                key={product.id}
                className="p-5 rounded-xl bg-[#0A0A0A] border border-white/10 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{product.name}</h4>
                      <span className="text-[10px] font-bold uppercase text-[#F27D26]">
                        {formatBRL(product.price)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xl font-black font-['Outfit'] ${
                        isZero ? 'text-red-500' : 'text-green-400'
                      }`}
                    >
                      {capacity.maxPortions}
                    </span>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">porções máx</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 text-xs">
                  {capacity.bottleneckIngredient ? (
                    <div className="flex items-center gap-1.5 text-red-300">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      <span className="truncate">
                        Gargalo: <strong className="text-white">{capacity.bottleneckIngredient}</strong> ({capacity.bottleneckStock} em estoque)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span>Sem restrição de estoque</span>
                    </div>
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
