import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateRecipeCost, calculateSuggestedPrice, formatBRL } from '../../utils/calculations';
import {
  DollarSign,
  Store,
  Truck,
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
    <div id="admin-pricing-root" className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Outfit'] truncate">
          Precificação Inteligente & Margens
        </h1>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
          Simulação de preços ideais considerando taxas de cartão, iFood, embalagens e lucro líquido.
        </p>
      </div>

      {/* Inputs Section */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#141414] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
              Parâmetros de Custo & Margem Alvo
            </h2>
            <p className="text-xs text-gray-400">
              Carregue um lanche ou simule valores personalizados.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Atual: {formatBRL(p.price)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-xs">
          <div>
            <label className="text-gray-400 font-bold mb-1 block font-mono">
              Insumos (R$)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              value={recipeCost}
              onChange={(e) => setRecipeCost(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-0.5 block truncate">Ficha técnica</span>
          </div>

          <div>
            <label className="text-gray-400 font-bold mb-1 block font-mono">
              Embalagem (R$)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              value={packagingCost}
              onChange={(e) => setPackagingCost(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-0.5 block truncate">Caixa / Papel</span>
          </div>

          <div>
            <label className="text-gray-400 font-bold mb-1 block font-mono">
              Fixo/Rateio (R$)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              value={operationalCost}
              onChange={(e) => setOperationalCost(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-0.5 block truncate">Gás / Luz / Op</span>
          </div>

          <div>
            <label className="text-gray-400 font-bold mb-1 block font-mono">
              Taxa Cartão (%)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              max={20}
              value={cardFeePercentage}
              onChange={(e) => setCardFeePercentage(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-0.5 block truncate">Maquininha</span>
          </div>

          <div>
            <label className="text-gray-400 font-bold mb-1 block font-mono">
              Taxa iFood (%)
            </label>
            <input
              type="number"
              step="any"
              min={0}
              max={40}
              value={appFeePercentage}
              onChange={(e) => setAppFeePercentage(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-white font-mono focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-gray-500 mt-0.5 block truncate">Comissão app</span>
          </div>

          <div>
            <label className="text-[#F27D26] font-bold mb-1 block font-mono">
              Margem Alvo (%)
            </label>
            <input
              type="number"
              step="any"
              min={5}
              max={80}
              value={desiredMarginPercentage}
              onChange={(e) => setDesiredMarginPercentage(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#F27D26]/50 text-[#F27D26] font-mono font-bold focus:outline-none focus:border-[#F27D26]"
            />
            <span className="text-[10px] text-[#F27D26]/80 mt-0.5 block truncate">Lucro alvo</span>
          </div>
        </div>
      </div>

      {/* Comparison Cards: Venda no Balcão vs Venda no iFood / Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Canal Balcão */}
        <div className="p-4 sm:p-6 rounded-xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                  Canal Balcão & Salão
                </h3>
                <p className="text-[11px] text-gray-400">Venda direta no local</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
              Taxa: {cardFeePercentage}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">Preço Sugerido</span>
              <p className="text-xl sm:text-2xl font-black text-white font-['Outfit'] mt-0.5">
                {formatBRL(balcaoPricing.suggestedPrice)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-green-400 uppercase font-mono">Lucro Líquido</span>
              <p className="text-lg sm:text-xl font-black text-green-400 font-mono mt-0.5">
                +{formatBRL(balcaoPricing.netProfit)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-300 divide-y divide-white/5">
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Custo Total Direto:</span>
              <span className="font-mono text-red-300">{formatBRL(balcaoPricing.totalCost)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Taxa Cartão ({cardFeePercentage}%):</span>
              <span className="font-mono text-red-300">-{formatBRL(balcaoPricing.cardFeeValue)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Margem Líquida Real:</span>
              <span className="font-mono text-green-400 font-bold">{desiredMarginPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Canal Delivery / iFood */}
        <div className="p-4 sm:p-6 rounded-xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F27D26]/10 border border-[#F27D26]/20 flex items-center justify-center text-[#F27D26] shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                  Canal iFood & Apps
                </h3>
                <p className="text-[11px] text-gray-400">Com comissão de marketplace</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20">
              Taxa: {(cardFeePercentage + appFeePercentage).toFixed(1)}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">Preço Sugerido App</span>
              <p className="text-xl sm:text-2xl font-black text-[#F27D26] font-['Outfit'] mt-0.5">
                {formatBRL(deliveryPricing.suggestedPrice)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-green-400 uppercase font-mono">Lucro Líquido</span>
              <p className="text-lg sm:text-xl font-black text-green-400 font-mono mt-0.5">
                +{formatBRL(deliveryPricing.netProfit)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-300 divide-y divide-white/5">
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Custo Total Direto:</span>
              <span className="font-mono text-red-300">{formatBRL(deliveryPricing.totalCost)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Taxa Cartão + App:</span>
              <span className="font-mono text-red-300">
                -{formatBRL(deliveryPricing.cardFeeValue + (deliveryPricing.appFeeValue || 0))}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Margem Líquida Real:</span>
              <span className="font-mono text-green-400 font-bold">{desiredMarginPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
