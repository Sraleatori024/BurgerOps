import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ingredient, UnitType } from '../../types';
import { formatBRL, formatQty } from '../../utils/calculations';
import {
  TrendingUp,
  Plus,
  Trash2,
  DollarSign,
  Sparkles,
  ArrowRight,
  PieChart,
  ShoppingBag,
  Flame,
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

  // Estimativa de produção de lanches baseada no ingrediente limitante dos simulados
  // Assumindo 180g carne / lanche e 1 pão / lanche
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
    <div id="admin-simulator-root" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Simulador de Compras & Projeção de ROI
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Planeje compras futuras e saiba exatamente quanto vai render em vendas e lucro antes de pagar.
          </p>
        </div>

        {totalInvestment > 0 && (
          <button
            onClick={handleConvertToRealPurchase}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Transformar em Compra Real (Entrada de NF)</span>
          </button>
        )}
      </div>

      {/* Projection Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Investimento em Compras
          </span>
          <p className="text-2xl font-black text-red-300 font-['Outfit'] mt-2">
            {formatBRL(totalInvestment)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Custo desembolsado</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Lanches Produzíveis
          </span>
          <p className="text-2xl font-black text-[#F27D26] font-['Outfit'] mt-2">
            ~{estimatedBurgersProduced} hambúrgueres
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Estimativa por porcionamento</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Faturamento Projetado
          </span>
          <p className="text-2xl font-black text-white font-['Outfit'] mt-2">
            {formatBRL(potentialRevenue)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            A {formatBRL(avgBurgerSalePrice)} por unidade
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Lucro Bruto & Retorno
          </span>
          <p className="text-2xl font-black text-green-400 font-['Outfit'] mt-2">
            +{formatBRL(potentialProfit)}
          </p>
          <p className="text-xs text-green-400 font-bold mt-0.5">
            ROI: {roiPercentage.toFixed(0)}% de retorno
          </p>
        </div>
      </div>

      {/* Simulator Items Builder */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">
              Lista de Insumos para Simulação
            </h2>
            <p className="text-xs text-gray-400">
              Altere quantidades e veja a projeção financeira se recalcular instantaneamente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Ticket Médio por Lanche:</span>
              <input
                type="number"
                value={avgBurgerSalePrice}
                onChange={(e) => setAvgBurgerSalePrice(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-[#F27D26] font-bold focus:outline-none focus:border-[#F27D26]"
              />
            </div>
            <button
              onClick={handleAddItem}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F27D26] border border-white/10 font-bold text-xs transition-colors"
            >
              + Inserir Insumo
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
                className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-5">
                  <select
                    value={item.ingredientId}
                    onChange={(e) => handleUpdate(index, 'ingredientId', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
                  >
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({formatBRL(i.unitCost)}/{i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    min={0.1}
                    value={item.quantity}
                    onChange={(e) => handleUpdate(index, 'quantity', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#F27D26]"
                  />
                  <span className="text-gray-400 font-mono w-10">{ing?.unit || 'un'}</span>
                </div>

                <div className="sm:col-span-3 text-right font-mono font-bold text-base text-[#F27D26]">
                  {formatBRL(itemTotal)}
                </div>

                <div className="sm:col-span-1 text-right">
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
