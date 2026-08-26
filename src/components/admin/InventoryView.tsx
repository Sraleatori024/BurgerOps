import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ingredient, IngredientCategory, UnitType } from '../../types';
import { formatBRL, formatQty } from '../../utils/calculations';
import {
  Layers,
  Plus,
  AlertTriangle,
  Search,
  Edit2,
  CheckCircle2,
  Package,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  Eye,
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
  const {
    ingredients,
    addIngredient,
    updateIngredient,
    adjustIngredientStock,
    setAdminTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [adjustStockModalIngredient, setAdjustStockModalIngredient] = useState<Ingredient | null>(null);
  const [viewDetailIngredient, setViewDetailIngredient] = useState<Ingredient | null>(null);

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
    <div id="admin-inventory-root" className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Outfit'] truncate">
            Ingredientes & Estoque
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            Gestão de insumos, custos médios e níveis de reposição preventiva.
          </p>
        </div>

        <button
          id="new-ingredient-btn"
          onClick={() => setIsNewModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Cadastrar Ingrediente</span>
        </button>
      </div>

      {/* KPI Cards - Compact on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono truncate">
            Itens Cadastrados
          </span>
          <p className="text-lg sm:text-2xl font-black text-white font-['Outfit'] mt-1 truncate">
            {ingredients.length} insumos
          </p>
          <p className="text-[10px] text-gray-500 mt-1 truncate">Ativos na cozinha</p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono truncate">
            Valor em Estoque
          </span>
          <p className="text-lg sm:text-2xl font-black text-green-400 font-['Outfit'] mt-1 truncate">
            {formatBRL(totalInventoryValue)}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 truncate">Patrimônio imobilizado</p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 border-l-2 sm:border-l-4 border-l-red-500 flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-wider font-mono truncate">
            Alerta de Reposição
          </span>
          <div className="flex items-center justify-between mt-1">
            <p className="text-lg sm:text-2xl font-black text-white font-['Outfit'] truncate">
              {lowStockCount} insumos
            </p>
            <button
              onClick={() => setAdminTab('restock')}
              className="text-xs font-bold text-[#F27D26] hover:underline"
            >
              Comprar ➔
            </button>
          </div>
          <p className="text-[10px] text-red-400 mt-1 truncate">
            {lowStockCount > 0 ? 'Abaixo do estoque mínimo' : 'Estoque 100% normal'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar with horizontal scrollable chips */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#141414] border border-white/10 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {['todos', 'carnes', 'queijos', 'paes', 'hortifruti', 'molhos', 'embalagens', 'bebidas'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#F27D26] text-black font-bold shadow-sm'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {cat === 'todos' ? 'Todos' : CATEGORY_NAMES[cat as IngredientCategory] || cat}
              </button>
            )
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar insumo por nome, fornecedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-[11px] text-gray-500 font-mono">
              {filteredIngredients.length} itens
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
      </div>

      {/* 1. Cards Mode (Optimized for Mobile & Tablet) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredIngredients.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-[#141414] border border-white/10 rounded-xl">
              <Package className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-300">Nenhum insumo encontrado</p>
              <p className="text-xs text-gray-500 mt-0.5">Cadastre um novo ingrediente para começar.</p>
            </div>
          ) : (
            filteredIngredients.map((ing) => {
              const isLow = ing.stockQuantity <= ing.minStock;

              return (
                <div
                  key={ing.id}
                  className={`p-3.5 sm:p-4 rounded-xl bg-[#141414] border flex flex-col justify-between gap-3 shadow-md transition-all ${
                    isLow ? 'border-red-500/40' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono">
                        {CATEGORY_NAMES[ing.category] || ing.category}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight truncate mt-0.5">
                        {ing.name}
                      </h4>
                      {ing.supplier && (
                        <p className="text-[11px] text-gray-500 truncate">Fornec: {ing.supplier}</p>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isLow
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-green-500/10 text-green-400 border border-green-500/30'
                      }`}
                    >
                      {isLow ? (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Estoque Baixo</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Normal</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Stock & Cost Highlight */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#0A0A0A] border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-mono">Qtd Atual:</span>
                      <p className="font-mono text-base font-bold text-white">
                        {ing.stockQuantity} <span className="text-xs text-gray-400">{ing.unit}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono">Mín: {ing.minStock} {ing.unit}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-mono">Custo Unit:</span>
                      <p className="font-mono text-sm sm:text-base font-bold text-[#F27D26]">
                        {formatBRL(ing.unitCost)}/{ing.unit}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        Total: {formatBRL(ing.stockQuantity * ing.unitCost)}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => setAdjustStockModalIngredient(ing)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <ArrowUpDown className="w-3 h-3 text-[#F27D26]" />
                      <span>Ajustar</span>
                    </button>

                    <button
                      onClick={() => setEditingIngredient(ing)}
                      className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => setViewDetailIngredient(ing)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                      title="Detalhes"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Table Mode (Desktop) */}
      {viewMode === 'table' && (
        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-2.5 px-3">Ingrediente</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Estoque</th>
                <th className="py-2.5 px-3">Mínimo</th>
                <th className="py-2.5 px-3">Custo Unitário</th>
                <th className="py-2.5 px-3">Valor Total</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredIngredients.map((ing) => {
                const isLow = ing.stockQuantity <= ing.minStock;

                return (
                  <tr key={ing.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white uppercase">{ing.name}</p>
                      {ing.supplier && <p className="text-[10px] text-gray-500">{ing.supplier}</p>}
                    </td>
                    <td className="py-3 px-3 text-gray-400">{CATEGORY_NAMES[ing.category] || ing.category}</td>
                    <td className="py-3 px-3">
                      <span className={`font-mono font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
                        {ing.stockQuantity} {ing.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-500">{ing.minStock} {ing.unit}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#F27D26]">
                      {formatBRL(ing.unitCost)} / {ing.unit}
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-200">
                      {formatBRL(ing.stockQuantity * ing.unitCost)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setAdjustStockModalIngredient(ing)}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-200 text-[11px] border border-white/10"
                        >
                          Ajustar
                        </button>
                        <button
                          onClick={() => setEditingIngredient(ing)}
                          className="p-1 rounded bg-white/5 text-gray-300 hover:text-white border border-white/10"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Ingredient Create / Edit Form Modal (Mobile Bottom Sheet / Centered Desktop) */}
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
            adjustIngredientStock(adjustStockModalIngredient.id, newQty, reason);
            setAdjustStockModalIngredient(null);
          }}
        />
      )}

      {/* View Detail Modal */}
      {viewDetailIngredient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div onClick={() => setViewDetailIngredient(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base uppercase font-['Outfit']">
                {viewDetailIngredient.name}
              </h3>
              <button onClick={() => setViewDetailIngredient(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-gray-400">
                Categoria: <span className="text-white font-bold">{CATEGORY_NAMES[viewDetailIngredient.category]}</span>
              </p>
              <p className="text-gray-400">
                Estoque Atual: <span className="text-white font-bold">{viewDetailIngredient.stockQuantity} {viewDetailIngredient.unit}</span>
              </p>
              <p className="text-gray-400">
                Estoque Mínimo: <span className="text-white font-bold">{viewDetailIngredient.minStock} {viewDetailIngredient.unit}</span>
              </p>
              <p className="text-gray-400">
                Custo Médio Unitário: <span className="text-[#F27D26] font-bold">{formatBRL(viewDetailIngredient.unitCost)} / {viewDetailIngredient.unit}</span>
              </p>
              <p className="text-gray-400">
                Valor Total em Estoque: <span className="text-green-400 font-bold">{formatBRL(viewDetailIngredient.stockQuantity * viewDetailIngredient.unitCost)}</span>
              </p>
              {viewDetailIngredient.supplier && (
                <p className="text-gray-400">
                  Fornecedor: <span className="text-white font-medium">{viewDetailIngredient.supplier}</span>
                </p>
              )}
            </div>

            <button
              onClick={() => setViewDetailIngredient(null)}
              className="w-full py-2 rounded-lg bg-[#F27D26] text-black font-bold text-xs"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal for creating / editing an ingredient
const IngredientFormModal: React.FC<{
  existingIngredient: Ingredient | null;
  onClose: () => void;
  onSave: (ing: any) => void;
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

    const ing: any = {
      ...(existingIngredient ? { id: existingIngredient.id } : {}),
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white font-['Outfit']">
            {existingIngredient ? 'Editar Ingrediente' : 'Cadastrar Ingrediente'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-gray-400 font-bold mb-1 block">Nome do Ingrediente</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Blend Fraldinha Moída"
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 font-bold mb-1 block">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IngredientCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
              >
                <option value="carnes">Carnes & Blends</option>
                <option value="queijos">Queijos & Laticínios</option>
                <option value="paes">Pães Artesanais</option>
                <option value="hortifruti">Hortifruti & Frescos</option>
                <option value="molhos">Molhos & Condimentos</option>
                <option value="embalagens">Embalagens</option>
                <option value="bebidas">Bebidas</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 font-bold mb-1 block">Unidade</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
              >
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Gramas (g)</option>
                <option value="un">Unidade (un)</option>
                <option value="l">Litros (l)</option>
                <option value="ml">Mililitros (ml)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-gray-400 font-bold mb-1 block">Estoque</label>
              <input
                type="number"
                step="any"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-gray-400 font-bold mb-1 block">Mínimo</label>
              <input
                type="number"
                step="any"
                required
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-gray-400 font-bold mb-1 block">Custo (R$)</label>
              <input
                type="number"
                step="any"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 font-bold mb-1 block">Fornecedor</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Ex: Distribuidora de Carnes"
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold shadow-md transition-colors"
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
  const [reason, setReason] = useState('Contagem e conferência semanal');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-base font-bold text-white font-['Outfit']">
            Ajustar Estoque
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Insumo: <span className="text-white font-bold uppercase">{ingredient.name}</span>
          <br />
          Estoque atual: <span className="text-[#F27D26] font-bold">{ingredient.stockQuantity} {ingredient.unit}</span>
        </p>

        <div className="space-y-3 pt-1 text-xs">
          <div>
            <label className="text-gray-400 font-bold mb-1 block">Nova Quantidade Real ({ingredient.unit})</label>
            <input
              type="number"
              step="any"
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white font-mono font-bold focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div>
            <label className="text-gray-400 font-bold mb-1 block">Motivo do Ajuste</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F27D26]"
            />
          </div>
        </div>

        <div className="flex gap-2.5 pt-3 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(newQuantity, reason)}
            className="flex-1 py-2.5 rounded-lg bg-[#F27D26] text-black font-bold transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
