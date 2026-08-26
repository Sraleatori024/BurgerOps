import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ingredient, IngredientCategory, UnitType } from '../../types';
import { formatBRL, formatQty } from '../../utils/calculations';
import {
  Layers,
  Plus,
  AlertTriangle,
  Search,
  Filter,
  Edit2,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  Package,
  TrendingDown,
} from 'lucide-react';

const CATEGORY_NAMES: Record<IngredientCategory, string> = {
  carnes: 'Carnes & Blends',
  queijos: 'Queijos & Laticínios',
  paes: 'Pães Artesanais',
  hortifruti: 'Hortifruti & Frescos',
  molhos: 'Molhos & Condimentos',
  acompanhamentos: 'Acompanhamentos',
  embalagens: 'Embalagens & Descartáveis',
  bebidas: 'Bebidas & Prontos',
  sobremesas: 'Sobremesas',
  outros: 'Outros Insumos',
};

export const InventoryView: React.FC = () => {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, updateStockQuantity, setAdminTab } =
    useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [adjustStockModalIngredient, setAdjustStockModalIngredient] = useState<Ingredient | null>(null);

  // Filtered ingredients
  const filteredIngredients = ingredients.filter((ing) => {
    const matchesCategory = selectedCategory === 'todos' || ing.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ing.supplier && ing.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalInventoryValue = ingredients.reduce(
    (sum, i) => sum + i.stockQuantity * i.unitCost,
    0
  );
  const lowStockCount = ingredients.filter((i) => i.stockQuantity <= i.minStock).length;

  return (
    <div id="admin-inventory-root" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Ingredientes & Controle de Estoque
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Gestão de insumos, custos médios de compra e níveis de segurança.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="new-ingredient-btn"
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-md shadow-black/40"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cadastrar Novo Ingrediente</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total de Itens Cadastrados
          </span>
          <p className="text-2xl font-black text-white font-['Outfit'] mt-2">
            {ingredients.length} insumos
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Controlados com precisão</p>
        </div>

        <div className="p-5 rounded-xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Valor Total em Estoque
          </span>
          <p className="text-2xl font-black text-green-400 font-['Outfit'] mt-2">
            {formatBRL(totalInventoryValue)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Patrimônio imobilizado em insumos</p>
        </div>

        <div className="p-5 rounded-xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Insumos em Alerta Crítico
          </span>
          <p className="text-2xl font-black text-red-400 font-['Outfit'] mt-2">
            {lowStockCount} itens
          </p>
          <button
            onClick={() => setAdminTab('restock')}
            className="text-xs text-[#F27D26] hover:underline mt-0.5 font-bold"
          >
            Ver Lista de Reposição ➔
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-[#141414] border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {['todos', 'carnes', 'queijos', 'paes', 'hortifruti', 'molhos', 'embalagens', 'bebidas'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#F27D26] text-black shadow-md'
                    : 'bg-[#0A0A0A] text-gray-400 hover:bg-white/5 border border-white/10'
                }`}
              >
                {cat === 'todos' ? 'Todas as Categorias' : CATEGORY_NAMES[cat as IngredientCategory] || cat}
              </button>
            )
          )}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou fornecedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F27D26]"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px] font-mono">
              <th className="py-3 px-4">Ingrediente</th>
              <th className="py-3 px-4">Categoria</th>
              <th className="py-3 px-4">Estoque Atual</th>
              <th className="py-3 px-4">Estoque Mínimo</th>
              <th className="py-3 px-4">Custo Unitário</th>
              <th className="py-3 px-4">Total em Estoque</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {filteredIngredients.map((ing) => {
              const isLow = ing.stockQuantity <= ing.minStock;
              const totalVal = ing.stockQuantity * ing.unitCost;

              return (
                <tr key={ing.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white text-sm">{ing.name}</p>
                    {ing.supplier && <p className="text-[11px] text-gray-500">{ing.supplier}</p>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A0A0A] border border-white/10 text-gray-400 uppercase">
                      {CATEGORY_NAMES[ing.category] || ing.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                    {formatQty(ing.stockQuantity, ing.unit)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-400">
                    {formatQty(ing.minStock, ing.unit)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-300">
                    {formatBRL(ing.unitCost)} / {ing.unit}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#F27D26]">
                    {formatBRL(totalVal)}
                  </td>
                  <td className="py-3.5 px-4">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Crítico</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Regular</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setAdjustStockModalIngredient(ing)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#F27D26] font-bold text-[11px] border border-white/10 transition-colors"
                        title="Ajuste de Balanço"
                      >
                        Ajustar Qtd
                      </button>
                      <button
                        onClick={() => setEditingIngredient(ing)}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir ingrediente "${ing.name}"?`)) {
                            deleteIngredient(ing.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-500 hover:text-red-400 border border-white/10 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New / Edit Ingredient Modal */}
      {(isNewModalOpen || editingIngredient) && (
        <IngredientFormModal
          existingIngredient={editingIngredient}
          onClose={() => {
            setIsNewModalOpen(false);
            setEditingIngredient(null);
          }}
          onSave={(ing) => {
            if (editingIngredient) {
              updateIngredient(ing);
            } else {
              addIngredient(ing);
            }
            setIsNewModalOpen(false);
            setEditingIngredient(null);
          }}
        />
      )}

      {/* Quick Adjust Stock Modal */}
      {adjustStockModalIngredient && (
        <AdjustStockModal
          ingredient={adjustStockModalIngredient}
          onClose={() => setAdjustStockModalIngredient(null)}
          onConfirm={(newQty, reason) => {
            updateStockQuantity(adjustStockModalIngredient.id, newQty, reason);
            setAdjustStockModalIngredient(null);
          }}
        />
      )}
    </div>
  );
};

// Modal for creating / editing an ingredient
const IngredientFormModal: React.FC<{
  existingIngredient: Ingredient | null;
  onClose: () => void;
  onSave: (ing: Ingredient) => void;
}> = ({ existingIngredient, onClose, onSave }) => {
  const [name, setName] = useState(existingIngredient?.name || '');
  const [category, setCategory] = useState<IngredientCategory>(
    existingIngredient?.category || 'carnes'
  );
  const [unit, setUnit] = useState<UnitType>(existingIngredient?.unit || 'kg');
  const [stockQuantity, setStockQuantity] = useState(existingIngredient?.stockQuantity || 0);
  const [minStock, setMinStock] = useState(existingIngredient?.minStock || 5);
  const [unitCost, setUnitCost] = useState(existingIngredient?.unitCost || 0);
  const [supplier, setSupplier] = useState(existingIngredient?.supplier || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const ing: Ingredient = {
      id: existingIngredient?.id || `ing-${Date.now()}`,
      name: name.trim(),
      category,
      unit,
      stockQuantity: Number(stockQuantity),
      minStock: Number(minStock),
      unitCost: Number(unitCost),
      lastPurchasePrice: existingIngredient?.lastPurchasePrice || Number(unitCost),
      supplier: supplier.trim() || undefined,
      lastPurchaseDate: existingIngredient?.lastPurchaseDate || new Date().toISOString().split('T')[0],
    };
    onSave(ing);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit']">
          {existingIngredient ? 'Editar Ingrediente' : 'Cadastrar Novo Ingrediente'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nome do Ingrediente</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Blend Fraldinha Moída"
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
              >
                <option value="carnes">Carnes & Blends</option>
                <option value="queijos">Queijos & Laticínios</option>
                <option value="paes">Pães Artesanais</option>
                <option value="hortifruti">Hortifruti & Frescos</option>
                <option value="molhos">Molhos & Condimentos</option>
                <option value="embalagens">Embalagens & Descartáveis</option>
                <option value="bebidas">Bebidas</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Unidade de Medida</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
              >
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Gramas (g)</option>
                <option value="un">Unidade (un)</option>
                <option value="l">Litros (l)</option>
                <option value="ml">Mililitros (ml)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Estoque Atual</label>
              <input
                type="number"
                step="any"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Estoque Mínimo</label>
              <input
                type="number"
                step="any"
                required
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Custo Unitário (R$)</label>
              <input
                type="number"
                step="any"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Fornecedor Principal</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Ex: Distribuidora Central de Carnes"
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
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
              Salvar Ingrediente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for quick manual stock adjustment
const AdjustStockModal: React.FC<{
  ingredient: Ingredient;
  onClose: () => void;
  onConfirm: (newQty: number, reason: string) => void;
}> = ({ ingredient, onClose, onConfirm }) => {
  const [newQuantity, setNewQuantity] = useState(ingredient.stockQuantity);
  const [reason, setReason] = useState('Balanço físico semanal de contagem');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit']">
          Ajustar Estoque: {ingredient.name}
        </h3>
        <p className="text-xs text-gray-400">
          Estoque atual no sistema: <span className="text-white font-bold">{ingredient.stockQuantity} {ingredient.unit}</span>
        </p>

        <div className="space-y-3 pt-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nova Quantidade Real ({ingredient.unit})</label>
            <input
              type="number"
              step="any"
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white font-mono font-bold focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Motivo do Ajuste</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F27D26]"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(newQuantity, reason)}
            className="flex-1 py-2 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs transition-colors"
          >
            Salvar Ajuste
          </button>
        </div>
      </div>
    </div>
  );
};
