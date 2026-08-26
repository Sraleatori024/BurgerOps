import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateRecipeCost, calculateSuggestedPrice, formatBRL } from '../../utils/calculations';
import {
  DollarSign,
  Percent,
  TrendingUp,
  Store,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const PricingCalculatorView: React.FC = () => {
  const { products, recipesMap, ingredientsMap } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [recipeCost, setRecipeCost] = useState<number>(10.5);
  const [packagingCost, setPackagingCost] = useState<number>(2.5);
  const [operationalCost, setOperationalCost] = useState<number>(2.0);
  const [cardFeePercentage, setCardFeePercentage] = useState<number>(3.5);
  const [appFeePercentage, setAppFeePercentage] = useState<number>(18.0); // iFood / app fee
  const [desiredMarginPercentage, setDesiredMarginPercentage] = useState<number>(45.0);

  // Sync recipe cost when selecting a product
  useEffect(() => {
    if (selectedProductId) {
      const rec = recipesMap[selectedProductId];
      const costCalc = calculateRecipeCost(rec, ingredientsMap);
      if (costCalc.costWithLoss > 0) {
        setRecipeCost(Number(costCalc.costWithLoss.toFixed(2)));
      }
    }
  }, [selectedProductId, recipesMap, ingredientsMap]);

  // Pricing for Balcão (Card Fee only, 0% App fee)
  const balcaoPricing = calculateSuggestedPrice(
    recipeCost,
    packagingCost,
    operationalCost,
    cardFeePercentage,
    0, // no marketplace fee
    desiredMarginPercentage
  );

  // Pricing for Delivery / iFood (Card Fee + Marketplace App fee)
  const deliveryPricing = calculateSuggestedPrice(
    recipeCost,
    packagingCost,
    operationalCost,
    cardFeePercentage,
    appFeePercentage,
    desiredMarginPercentage
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div id="admin-pricing-root" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Precificação Inteligente & Margem Líquida
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Simulação de preços ideais considerando taxas de cartão, iFood, embalagens e lucro líquido.
          </p>
        </div>
      </div>

      {/* Inputs Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">
              Parâmetros de Custo e Margem Desejada
            </h2>
            <p className="text-xs text-gray-400">
              Selecione um produto do cardápio ou digite valores personalizados para simulação.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <label className="text-[11px] text-gray-400 mb-1 block">Carregar do Cardápio</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Atual: {formatBRL(p.price)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Custo dos Insumos (R$)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              value={recipeCost}
              onChange={(e) => setRecipeCost(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Ficha técnica</span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Embalagem (R$)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              value={packagingCost}
              onChange={(e) => setPackagingCost(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Caixa, papel, lacre</span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Fixo/Operacional (R$)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              value={operationalCost}
              onChange={(e) => setOperationalCost(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Rateio por lanche</span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Taxa Cartão (%)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              max={20}
              value={cardFeePercentage}
              onChange={(e) => setCardFeePercentage(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Débito / Crédito</span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Taxa App/iFood (%)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              max={40}
              value={appFeePercentage}
              onChange={(e) => setAppFeePercentage(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Comissão delivery</span>
          </div>

          <div>
            <label className="text-xs font-bold text-[#F27D26] uppercase tracking-wider block mb-1">
              Margem Alvo (%)
            </label>
            <input
              type="number"
              step="any"
              min={5}
              max={80}
              value={desiredMarginPercentage}
              onChange={(e) => setDesiredMarginPercentage(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#F27D26]/50 text-xs sm:text-sm text-[#F27D26] font-mono font-bold focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-[#F27D26]/80 mt-1 block">Lucro desejado</span>
          </div>
        </div>
      </div>

      {/* Comparison Cards: Venda no Balcão vs Venda no iFood / Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Canal Balcão / Salão */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Canal Balcão & Salão Próprio
                </h3>
                <p className="text-xs text-gray-400">Sem taxa de marketplace</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
              Taxa Cartão: {cardFeePercentage}%
            </span>
          </div>

          {/* Suggested Price Highlight */}
          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Preço de Venda Sugerido
              </span>
              <p className="text-3xl font-black text-white font-['Outfit'] mt-1">
                {formatBRL(balcaoPricing.suggestedPrice)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-green-400 uppercase">Lucro Líquido Real</span>
              <p className="text-2xl font-black text-green-400 font-mono mt-0.5">
                +{formatBRL(balcaoPricing.netProfit)}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-xs divide-y divide-white/5 text-gray-300">
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Custo Total Direto (Insumo + Embalagem + Operacional)</span>
              <span className="font-mono text-red-300">{formatBRL(balcaoPricing.totalCost)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Desconto Maquininha ({cardFeePercentage}%)</span>
              <span className="font-mono text-red-300">
                -{formatBRL(balcaoPricing.cardFeeValue)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Markup Multiplicador</span>
              <span className="font-mono text-[#F27D26] font-bold">{balcaoPricing.markupMultiplier.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-white">
              <span>Margem Líquida Atingida</span>
              <span className="font-mono text-green-400">{balcaoPricing.effectiveMargin.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Canal iFood / Delivery */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#F27D26]/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F27D26]/10 border border-[#F27D26]/20 flex items-center justify-center text-[#F27D26]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Canal Delivery Apps (iFood)
                </h3>
                <p className="text-xs text-gray-400">Comissão absorvida no preço</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20">
              Taxa App: {appFeePercentage}%
            </span>
          </div>

          {/* Suggested Price Highlight */}
          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Preço de Venda no App
              </span>
              <p className="text-3xl font-black text-[#F27D26] font-['Outfit'] mt-1">
                {formatBRL(deliveryPricing.suggestedPrice)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-green-400 uppercase">Lucro Líquido Garantido</span>
              <p className="text-2xl font-black text-green-400 font-mono mt-0.5">
                +{formatBRL(deliveryPricing.netProfit)}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-xs divide-y divide-white/5 text-gray-300">
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Custo Total Direto</span>
              <span className="font-mono text-red-300">{formatBRL(deliveryPricing.totalCost)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Comissão do App ({appFeePercentage}%)</span>
              <span className="font-mono text-red-300">
                -{formatBRL(deliveryPricing.appFeeValue)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Taxa de Pagamento ({cardFeePercentage}%)</span>
              <span className="font-mono text-red-300">
                -{formatBRL(deliveryPricing.cardFeeValue)}
              </span>
            </div>
            <div className="flex justify-between py-2 font-bold text-white">
              <span>Margem Líquida Atingida</span>
              <span className="font-mono text-green-400">{deliveryPricing.effectiveMargin.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
