import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatQty } from '../../utils/calculations';
import {
  AlertTriangle,
  ShoppingBag,
  CheckCircle2,
  Copy,
  Share2,
  Phone,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const RestockAlertsView: React.FC = () => {
  const { ingredients, addPurchase, showToast, setAdminTab, settings } = useApp();

  const [safetyMultiplier, setSafetyMultiplier] = useState<number>(2.0); // Buy up to 2x minStock

  const lowStockItems = ingredients
    .filter((ing) => ing.stockQuantity <= ing.minStock)
    .map((ing) => {
      const idealTarget = ing.minStock * safetyMultiplier;
      const suggestedBuyQty = Math.max(0, Number((idealTarget - ing.stockQuantity).toFixed(2)));
      const estimatedCost = suggestedBuyQty * ing.unitCost;

      return {
        ...ing,
        suggestedBuyQty,
        estimatedCost,
      };
    });

  const totalRestockCost = lowStockItems.reduce((sum, i) => sum + i.estimatedCost, 0);

  const handleCopyShoppingList = () => {
    if (lowStockItems.length === 0) return;

    let text = `🛒 *LISTA DE REPOSIÇÃO - ${settings.shopName.toUpperCase()}*\n`;
    text += `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;

    lowStockItems.forEach((item, idx) => {
      text += `${idx + 1}. *${item.name}*: Comprar ${item.suggestedBuyQty} ${item.unit} (Estoque atual: ${item.stockQuantity} ${item.unit})\n`;
    });

    text += `\n💰 *Orçamento Estimado:* ${formatBRL(totalRestockCost)}`;

    navigator.clipboard.writeText(text);
    showToast('Lista de compras copiada para a área de transferência!', 'success');
  };

  const handleAutoGeneratePurchase = () => {
    if (lowStockItems.length === 0) return;

    addPurchase({
      supplier: 'Reposição Automática de Estoque Crítico',
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: `AUTO-REP-${Date.now().toString().slice(-4)}`,
      items: lowStockItems.map((item) => ({
        ingredientId: item.id,
        ingredientName: item.name,
        quantity: item.suggestedBuyQty,
        unit: item.unit,
        unitCost: item.unitCost,
        totalCost: item.estimatedCost,
      })),
      totalValue: totalRestockCost,
    });

    setAdminTab('purchases');
  };

  return (
    <div id="admin-restock-root" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            O que preciso comprar? (Reposição Inteligente)
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Algoritmo de reposição com cálculo automático de quantidades e estimativa de investimento.
          </p>
        </div>

        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyShoppingList}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#141414] border border-white/10 hover:bg-white/5 text-gray-200 text-xs sm:text-sm font-bold transition-colors"
            >
              <Copy className="w-4 h-4 text-[#F27D26]" />
              <span>Copiar p/ WhatsApp</span>
            </button>

            <button
              onClick={handleAutoGeneratePurchase}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black text-xs sm:text-sm font-bold transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Gerar Compra & Atualizar Estoque</span>
            </button>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Insumos em Estado Crítico
          </span>
          <p className="text-2xl font-black text-red-400 font-['Outfit'] mt-2">
            {lowStockItems.length} insumos
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Abaixo do estoque mínimo de segurança</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Orçamento Necessário
          </span>
          <p className="text-2xl font-black text-green-400 font-['Outfit'] mt-2">
            {formatBRL(totalRestockCost)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Estimativa baseada no último custo unitário</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Nível Alvo de Segurança
          </span>
          <div className="flex items-center gap-2 mt-2">
            {[1.5, 2.0, 3.0].map((mult) => (
              <button
                key={mult}
                onClick={() => setSafetyMultiplier(mult)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  safetyMultiplier === mult
                    ? 'bg-[#F27D26] text-black'
                    : 'bg-[#0A0A0A] text-gray-400 border border-white/10 hover:text-white'
                }`}
              >
                {mult}x Mínimo
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Margem para dias de pico (ex: fim de semana)</p>
        </div>
      </div>

      {/* Low Stock List */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Lista Sugerida para Pedido de Fornecedores
            </h3>
            <p className="text-xs text-gray-400">
              Quantidades calculadas para atingir {safetyMultiplier}x o estoque mínimo.
            </p>
          </div>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="p-12 text-center bg-[#0A0A0A]/40 rounded-xl border border-white/10">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white font-['Outfit']">
              Estoque 100% Abastecido!
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Nenhum insumo está abaixo do limite de segurança no momento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3 px-4">Insumo</th>
                  <th className="py-3 px-4">Estoque Atual</th>
                  <th className="py-3 px-4">Estoque Mínimo</th>
                  <th className="py-3 px-4">Comprar Sugerido</th>
                  <th className="py-3 px-4">Custo Unitário</th>
                  <th className="py-3 px-4">Custo Estimado</th>
                  <th className="py-3 px-4">Fornecedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{item.name}</td>
                    <td className="py-3.5 px-4 font-mono text-red-400 font-bold">
                      {formatQty(item.stockQuantity, item.unit)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {formatQty(item.minStock, item.unit)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-[#F27D26] text-sm">
                      +{formatQty(item.suggestedBuyQty, item.unit)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">
                      {formatBRL(item.unitCost)} / {item.unit}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-green-400">
                      {formatBRL(item.estimatedCost)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {item.supplier || 'Geral'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
