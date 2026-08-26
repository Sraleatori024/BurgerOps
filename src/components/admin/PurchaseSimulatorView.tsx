import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ingredient, UnitType } from '../../types';
import { formatBRL, formatQty } from '../../utils/calculations';
import {
  TrendingUp,
  Plus,
  Trash2,
  ShoppingBag,
} from 'lucide-react';

interface SimulatedItem {
  ingredientId: string;
  quantity: number;
}

export const PurchaseSimulatorView: React.FC = () => {
  const { ingredients, products, recipesMap, ingredientsMap, addPurchase, setAdminTab } = useApp();

  const [simulatedItems, setSimulatedItems] = useState<SimulatedItem[]>([
    { ingredientId: ingredients.find((i) => i.name.includes('Blend'))?.id || ingredients[0]?.id || '', quantity: 15 },
    { ingredientId: ingredients.find((i) => i.name.includes('Pão Brioche'))?.id || ingredients[1]?.id || '', quantity: 80 },
    { ingredientId: ingredients.find((i) => i.name.includes('Cheddar'))?.id || ingredients[2]?.id || '', quantity: 4 },
  ]);

  const [avgBurgerSalePrice, setAvgBurgerSalePrice] = useState<number>(36.0);

  const handleAddItem = () => {
    const first = ingredients[0];
    if (!first) return;
    setSimulatedItems((prev) => [...prev, { ingredientId: first.id, quantity: 5 }]);
  };

  const handleRemoveItem = (index: number) => {
    setSimulatedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: 'ingredientId' | 'quantity', val: any) => {
    setSimulatedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  // Calculations
  const totalInvestment = simulatedItems.reduce((sum, item) => {
    const ing = ingredientsMap[item.ingredientId];
    return sum + (ing ? ing.unitCost * item.quantity : 0);
  }, 0);

  const meatItem = simulatedItems.find((i) => {
    const ing = ingredientsMap[i.ingredientId];
    return ing?.category === 'carnes';
  });
  const bunItem = simulatedItems.find((i) => {
    const ing = ingredientsMap[i.ingredientId];
    return ing?.category === 'paes';
  });

  const estimatedBurgersFromMeat = meatItem ? Math.floor((meatItem.quantity * 1000) / 180) : 999;
  const estimatedBurgersFromBuns = bunItem ? bunItem.quantity : 999;
  const estimatedBurgersProduced = Math.min(
    estimatedBurgersFromMeat,
    estimatedBurgersFromBuns,
    meatItem || bunItem ? Math.max(estimatedBurgersFromMeat, estimatedBurgersFromBuns) : 60
  );

  const potentialRevenue = estimatedBurgersProduced * avgBurgerSalePrice;
  const potentialProfit = potentialRevenue - totalInvestment;
  const roiPercentage = totalInvestment > 0 ? (potentialProfit / totalInvestment) * 100 : 0;

  const handleConvertToRealPurchase = () => {
    addPurchase({
      supplier: 'Fornecedor Simulado (Conversão)',
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: `SIM-${Date.now().toString().slice(-4)}`,
      items: simulatedItems.map((item) => {
        const ing = ingredientsMap[item.ingredientId];
        return {
          ingredientId: item.ingredientId,
          ingredientName: ing?.name || 'Insumo',
          quantity: item.quantity,
          unit: ing?.unit || 'kg',
          unitCost: ing?.unitCost || 0,
          totalCost: (ing?.unitCost || 0) * item.quantity,
        };
      }),
      totalValue: totalInvestment,
    });
    setAdminTab('purchases');
  };

  return (
    <div id="admin-simulator-root" className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Outfit'] truncate">
            Simulador de Compras & ROI
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            Planeje compras futuras e projete rendimento em vendas antes de pagar.
          </p>
        </div>

        {totalInvestment > 0 && (
          <button
            onClick={handleConvertToRealPurchase}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-sm shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Converter em Compra Real</span>
          </button>
        )}
      </div>

      {/* Projection Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono truncate">
            Investimento
          </span>
          <p className="text-base sm:text-2xl font-black text-red-300 font-mono mt-1 truncate">
            {formatBRL(totalInvestment)}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate">Custo desembolsado</p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono truncate">
            Lanches Projetados
          </span>
          <p className="text-base sm:text-2xl font-black text-[#F27D26] font-mono mt-1 truncate">
            ~{estimatedBurgersProduced} un
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate">Porcionamento máx</p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono truncate">
            Faturamento
          </span>
          <p className="text-base sm:text-2xl font-black text-white font-mono mt-1 truncate">
            {formatBRL(potentialRevenue)}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate">A {formatBRL(avgBurgerSalePrice)}/un</p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono truncate">
            Retorno (ROI)
          </span>
          <p className="text-base sm:text-2xl font-black text-green-400 font-mono mt-1 truncate">
            +{formatBRL(potentialProfit)}
          </p>
          <p className="text-[10px] text-green-400 font-semibold mt-0.5 truncate">
            ROI: {roiPercentage.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Simulator Items Builder */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#141414] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
              Lista de Insumos Simulados
            </h2>
            <p className="text-xs text-gray-400">
              Altere quantidades e veja o recálculo em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-gray-300">
              <span className="text-[11px] text-gray-400">Ticket Médio:</span>
              <input
                type="number"
                value={avgBurgerSalePrice}
                onChange={(e) => setAvgBurgerSalePrice(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded bg-[#0A0A0A] border border-white/10 text-xs text-[#F27D26] font-bold font-mono focus:outline-none focus:border-[#F27D26]"
              />
            </div>
            <button
              onClick={handleAddItem}
              className="px-2.5 py-1 rounded bg-[#F27D26]/10 hover:bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/30 font-bold text-xs transition-colors shrink-0"
            >
              + Insumo
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {simulatedItems.map((item, index) => {
            const ing = ingredientsMap[item.ingredientId];
            const itemTotal = ing ? ing.unitCost * item.quantity : 0;

            return (
              <div
                key={index}
                className="p-3 rounded-xl bg-[#0A0A0A] border border-white/10 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center text-xs"
              >
                <div className="flex-1">
                  <select
                    value={item.ingredientId}
                    onChange={(e) => handleUpdate(index, 'ingredientId', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
                  >
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({formatBRL(i.unitCost)}/{i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="any"
                      min={0.1}
                      value={item.quantity}
                      onChange={(e) => handleUpdate(index, 'quantity', Number(e.target.value))}
                      className="w-20 px-2 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#F27D26]"
                    />
                    <span className="text-gray-400 font-mono text-[11px] w-8">{ing?.unit || 'un'}</span>
                  </div>

                  <span className="font-mono font-bold text-sm text-[#F27D26] w-24 text-right">
                    {formatBRL(itemTotal)}
                  </span>

                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
