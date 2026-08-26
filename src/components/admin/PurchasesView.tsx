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
} from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const { purchases, addPurchase, ingredients } = useApp();
  const [isNewPurchaseModalOpen, setIsNewPurchaseModalOpen] = useState(false);
  const [selectedPurchaseForDetails, setSelectedPurchaseForDetails] = useState<Purchase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    <div id="admin-purchases-root" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Registro de Compras & Suprimentos
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Entrada de mercadorias com atualização automática de estoque e recálculo de custo unitário.
          </p>
        </div>

        <button
          id="register-purchase-btn"
          onClick={() => setIsNewPurchaseModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-md shadow-black/40"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Lançar Nova Compra (NF-e)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total em Compras Lançadas
          </span>
          <p className="text-2xl font-black text-green-400 font-['Outfit'] mt-2">
            {formatBRL(totalSpentPurchases)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{purchases.length} notas processadas</p>
        </div>

        <div className="p-5 rounded-xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Última Compra Realizada
          </span>
          <p className="text-lg font-black text-white font-['Outfit'] mt-2 truncate">
            {purchases[0]?.supplier || 'Nenhuma recente'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {purchases[0]?.date ? new Date(purchases[0].date).toLocaleDateString('pt-BR') : '-'}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Impacto no Estoque
          </span>
          <p className="text-lg font-black text-[#F27D26] font-['Outfit'] mt-2">
            Atualização 100% Automática
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Recalcula CMV e ficha técnica na hora</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#141414] border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por fornecedor, NF ou insumo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F27D26]"
          />
        </div>
        <span className="text-xs text-gray-400 font-mono hidden sm:inline">
          {filteredPurchases.length} compras encontradas
        </span>
      </div>

      {/* Purchases List / Table */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px] font-mono">
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4">Fornecedor</th>
              <th className="py-3 px-4">Nota Fiscal / Ref</th>
              <th className="py-3 px-4">Itens Comprados</th>
              <th className="py-3 px-4">Valor Total</th>
              <th className="py-3 px-4 text-right">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {filteredPurchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-mono text-gray-300">
                  {new Date(purchase.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-white text-sm">{purchase.supplier}</p>
                </td>
                <td className="py-3.5 px-4 font-mono text-[#F27D26]">
                  {purchase.invoiceNumber || 'S/N'}
                </td>
                <td className="py-3.5 px-4 max-w-sm truncate text-gray-300">
                  {purchase.items.map((i) => `${i.quantity} ${i.unit} ${i.ingredientName}`).join(', ')}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-green-400 text-sm">
                  {formatBRL(purchase.totalValue)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setSelectedPurchaseForDetails(purchase)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold transition-colors"
                  >
                    Ver Itens
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Purchase Modal */}
      {isNewPurchaseModalOpen && (
        <NewPurchaseModal
          ingredients={ingredients}
          onClose={() => setIsNewPurchaseModalOpen(false)}
          onSave={(p) => {
            addPurchase(p);
            setIsNewPurchaseModalOpen(false);
          }}
        />
      )}

      {/* Purchase Details Modal */}
      {selectedPurchaseForDetails && (
        <PurchaseDetailsModal
          purchase={selectedPurchaseForDetails}
          onClose={() => setSelectedPurchaseForDetails(null)}
        />
      )}
    </div>
  );
};

// Modal for registering a new purchase
const NewPurchaseModal: React.FC<{
  ingredients: Ingredient[];
  onClose: () => void;
  onSave: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
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
      unitCost: ingredients[0]?.unitCost || 30,
      totalCost: (ingredients[0]?.unitCost || 30) * 10,
    },
  ]);

  const handleItemChange = (
    index: number,
    field: keyof PurchaseItem,
    value: any
  ) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 my-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">
              Lançar Entrada de Mercadoria (Compra)
            </h3>
            <p className="text-xs text-gray-400">
              O estoque será abastecido e o custo unitário será atualizado.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fornecedor</label>
              <input
                type="text"
                required
                placeholder="Ex: Frigorífico Central"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Data da Compra</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nº da Nota Fiscal</label>
              <input
                type="text"
                placeholder="Ex: NF-e 49201"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F27D26] uppercase tracking-wider">
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

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-[#0A0A0A] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="sm:col-span-5">
                    <select
                      value={item.ingredientId}
                      onChange={(e) => handleItemChange(index, 'ingredientId', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
                    >
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="any"
                      min={0.1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      placeholder="Qtd"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="any"
                      min={0.01}
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(index, 'unitCost', Number(e.target.value))}
                      placeholder="R$/unidade"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
                    />
                  </div>

                  <div className="sm:col-span-2 text-right font-mono font-bold text-[#F27D26]">
                    {formatBRL(item.totalCost)}
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Total & Submit */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase font-bold">Total da Compra</span>
            <span className="text-xl font-black text-green-400 font-mono">
              {formatBRL(totalValue)}
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs shadow-md transition-colors"
            >
              Confirmar Entrada e Abastecer Estoque
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for viewing purchase details
const PurchaseDetailsModal: React.FC<{
  purchase: Purchase;
  onClose: () => void;
}> = ({ purchase, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Detalhes da Compra</h3>
            <p className="text-xs text-gray-400">{purchase.supplier}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Data de Emissão:</span>
            <span className="text-white font-mono">{new Date(purchase.date).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Nota Fiscal:</span>
            <span className="text-[#F27D26] font-mono">{purchase.invoiceNumber || 'Não informada'}</span>
          </div>

          <div className="pt-2 border-t border-white/10">
            <h4 className="font-bold text-white mb-2">Itens da Nota</h4>
            <div className="divide-y divide-white/5 bg-[#0A0A0A] p-3 rounded-xl border border-white/10 space-y-2">
              {purchase.items.map((it, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">{it.ingredientName}</span>
                    <p className="text-[11px] text-gray-400 font-mono">
                      {it.quantity} {it.unit} x {formatBRL(it.unitCost)}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-[#F27D26]">{formatBRL(it.totalCost)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-bold text-white">
            <span>Total Faturado:</span>
            <span className="font-mono text-green-400 text-base">{formatBRL(purchase.totalValue)}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold text-xs transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
