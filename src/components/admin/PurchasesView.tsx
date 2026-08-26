import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Purchase, PurchaseItem, Ingredient, UnitType } from '../../types';
import { formatBRL, formatQty } from '../../utils/calculations';
import {
  ShoppingBag,
  Plus,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  CheckCircle2,
  Package,
  TrendingUp,
  Search,
  X,
  Eye,
} from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const { purchases, addPurchase, ingredients } = useApp();
  const [isNewPurchaseModalOpen, setIsNewPurchaseModalOpen] = useState(false);
  const [selectedPurchaseForDetails, setSelectedPurchaseForDetails] = useState<Purchase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredPurchases = purchases.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.supplier.toLowerCase().includes(query) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(query)) ||
      p.items.some((i) => i.ingredientName.toLowerCase().includes(query))
    );
  });

  const totalSpentPurchases = purchases.reduce((sum, p) => sum + p.totalValue, 0);

  return (
    <div id="admin-purchases-root" className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Outfit'] truncate">
            Registro de Compras
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            Entrada de mercadorias, reposição de estoque e atualização de custos.
          </p>
        </div>

        <button
          id="register-purchase-btn"
          onClick={() => setIsNewPurchaseModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Lançar Nova Compra</span>
        </button>
      </div>

      {/* KPI Cards - Compact Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono truncate">
            Total Lançado
          </span>
          <p className="text-lg sm:text-2xl font-black text-green-400 font-['Outfit'] mt-1 truncate">
            {formatBRL(totalSpentPurchases)}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 truncate">{purchases.length} notas processadas</p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono truncate">
            Última Compra
          </span>
          <p className="text-base sm:text-xl font-bold text-white font-['Outfit'] mt-1 truncate">
            {purchases[0]?.supplier || 'Nenhuma'}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 truncate">
            {purchases[0]?.date ? new Date(purchases[0].date).toLocaleDateString('pt-BR') : '-'}
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[9px] sm:text-[10px] font-bold text-[#F27D26] uppercase tracking-wider font-mono truncate">
            Integração ao Estoque
          </span>
          <p className="text-base sm:text-lg font-bold text-white font-['Outfit'] mt-1 truncate">
            100% Automática
          </p>
          <p className="text-[10px] text-gray-400 mt-1 truncate">Recalcula CMV na hora</p>
        </div>
      </div>

      {/* Search and view toggle */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por fornecedor, NF ou insumo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F27D26]"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-[11px] text-gray-500 font-mono">
            {filteredPurchases.length} compras
          </span>

          <div className="flex items-center bg-[#0A0A0A] border border-white/10 rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                viewMode === 'cards' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`hidden md:block px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                viewMode === 'table' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Tabela
            </button>
          </div>
        </div>
      </div>

      {/* 1. Cards View (Mobile/Tablet/Desktop) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredPurchases.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-[#141414] border border-white/10 rounded-xl">
              <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-300">Nenhuma compra encontrada</p>
              <p className="text-xs text-gray-500 mt-0.5">Lance uma nova compra para abastecer o estoque.</p>
            </div>
          ) : (
            filteredPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="p-3.5 sm:p-4 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between gap-3 shadow-md hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 font-mono block">
                      {new Date(purchase.date).toLocaleDateString('pt-BR')}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                      {purchase.supplier}
                    </h4>
                    {purchase.invoiceNumber && (
                      <p className="text-[11px] text-[#F27D26] font-mono truncate">{purchase.invoiceNumber}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-gray-500 font-mono block">Total Pago</span>
                    <p className="font-mono text-base font-bold text-green-400">
                      {formatBRL(purchase.totalValue)}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-white/5 text-xs space-y-1">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block">Itens recebidos:</span>
                  {purchase.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-gray-200">
                      <span className="truncate">
                        {item.quantity} {item.unit} • {item.ingredientName}
                      </span>
                      <span className="font-mono text-gray-400 text-[11px] shrink-0 ml-2">
                        {formatBRL(item.totalCost)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Estoque Atualizado
                  </span>

                  <button
                    onClick={() => setSelectedPurchaseForDetails(purchase)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detalhes</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Table View (Desktop) */}
      {viewMode === 'table' && (
        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] font-mono">
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Fornecedor</th>
                <th className="py-2.5 px-3">NF</th>
                <th className="py-2.5 px-3">Insumos</th>
                <th className="py-2.5 px-3">Valor Total</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-mono">{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-3 font-bold text-white">{p.supplier}</td>
                  <td className="py-3 px-3 font-mono text-[#F27D26]">{p.invoiceNumber || '-'}</td>
                  <td className="py-3 px-3 max-w-xs truncate text-gray-400">
                    {p.items.map((i) => `${i.quantity} ${i.unit} ${i.ingredientName}`).join(', ')}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-green-400">{formatBRL(p.totalValue)}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedPurchaseForDetails(p)}
                      className="p-1 rounded bg-white/5 text-gray-300 hover:text-white border border-white/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Purchase Modal (Bottom sheet mobile / centered desktop) */}
      {isNewPurchaseModalOpen && (
        <PurchaseFormModal
          ingredients={ingredients}
          onClose={() => setIsNewPurchaseModalOpen(false)}
          onSave={(purchaseData) => {
            addPurchase(purchaseData);
            setIsNewPurchaseModalOpen(false);
          }}
        />
      )}

      {/* Purchase Details Modal */}
      {selectedPurchaseForDetails && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div onClick={() => setSelectedPurchaseForDetails(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-lg bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Compra: {selectedPurchaseForDetails.supplier}
                </h3>
                <p className="text-xs text-gray-400">
                  Data: {new Date(selectedPurchaseForDetails.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button onClick={() => setSelectedPurchaseForDetails(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#0A0A0A] rounded-xl border border-white/5 space-y-2 text-xs">
              <h5 className="font-bold text-white uppercase text-[10px] font-mono">Itens da Nota</h5>
              {selectedPurchaseForDetails.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-bold text-white">{it.ingredientName}</p>
                    <p className="text-[10px] text-gray-400">
                      {it.quantity} {it.unit} a {formatBRL(it.unitCost)}/{it.unit}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-green-400">{formatBRL(it.totalCost)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-white/10">
              <span>Valor Total da Nota:</span>
              <span className="text-green-400 text-base font-mono">{formatBRL(selectedPurchaseForDetails.totalValue)}</span>
            </div>

            <button
              onClick={() => setSelectedPurchaseForDetails(null)}
              className="w-full py-2.5 rounded-lg bg-[#F27D26] text-black font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Purchase Form Modal
const PurchaseFormModal: React.FC<{
  ingredients: Ingredient[];
  onClose: () => void;
  onSave: (purchase: Omit<Purchase, 'id' | 'unitCostCalculated'>) => void;
}> = ({ ingredients, onClose, onSave }) => {
  const [supplier, setSupplier] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      ingredientId: ingredients[0]?.id || '',
      ingredientName: ingredients[0]?.name || '',
      quantity: 10,
      unit: ingredients[0]?.unit || 'kg',
      unitCost: ingredients[0]?.unitCost || 25,
      totalCost: (ingredients[0]?.unitCost || 25) * 10,
    },
  ]);

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'ingredientId') {
        const ing = ingredients.find((i) => i.id === value);
        if (ing) {
          item.ingredientName = ing.name;
          item.unit = ing.unit;
          item.unitCost = ing.unitCost;
        }
      }

      if (field === 'quantity' || field === 'unitCost' || field === 'ingredientId') {
        item.totalCost = Number(item.quantity) * Number(item.unitCost);
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleAddItem = () => {
    const firstIng = ingredients[0];
    if (!firstIng) return;
    setItems((prev) => [
      ...prev,
      {
        ingredientId: firstIng.id,
        ingredientName: firstIng.name,
        quantity: 5,
        unit: firstIng.unit,
        unitCost: firstIng.unitCost,
        totalCost: firstIng.unitCost * 5,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalValue = items.reduce((sum, item) => sum + item.totalCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim() || items.length === 0) return;

    onSave({
      supplier: supplier.trim(),
      date,
      invoiceNumber: invoiceNumber.trim() || undefined,
      items,
      totalValue,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-2xl bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Lançar Entrada de Mercadoria
            </h3>
            <p className="text-xs text-gray-400">
              O estoque será abastecido e o custo unitário será atualizado.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-gray-400 font-bold mb-1 block">Fornecedor</label>
              <input
                type="text"
                required
                placeholder="Ex: Frigorífico Central"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-gray-400 font-bold mb-1 block">Data da Compra</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-gray-400 font-bold mb-1 block">Nº da Nota Fiscal</label>
              <input
                type="text"
                placeholder="Ex: NF-e 49201"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F27D26] uppercase font-mono">
                Itens Comprados
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-[#F27D26] font-bold hover:underline"
              >
                + Adicionar Outro Item
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-[#0A0A0A] border border-white/10 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center text-xs"
                >
                  <div className="flex-1">
                    <select
                      value={item.ingredientId}
                      onChange={(e) => handleItemChange(index, 'ingredientId', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
                    >
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <input
                        type="number"
                        step="any"
                        min={0.01}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        placeholder="Qtd"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-white font-mono"
                      />
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        step="any"
                        min={0.01}
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(index, 'unitCost', Number(e.target.value))}
                        placeholder="R$ Unit"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-white font-mono"
                      />
                    </div>

                    <span className="font-mono font-bold text-green-400 w-24 text-right">
                      {formatBRL(item.totalCost)}
                    </span>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-300 font-bold">Total da Compra:</span>
            <span className="text-base font-black text-green-400 font-mono">{formatBRL(totalValue)}</span>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold shadow-md"
            >
              Confirmar & Dar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
