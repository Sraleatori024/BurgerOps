import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Recipe, RecipeItem, Ingredient, UnitType } from '../../types';
import {
  formatBRL,
  calculateRecipeCost,
  calculateMargin,
  calculateProfit,
  formatQty,
  calculateRecipeProductionCapacity,
} from '../../utils/calculations';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Percent,
  DollarSign,
  Layers,
  ChefHat,
  Sparkles,
  ChevronDown,
  Info,
  Clock,
} from 'lucide-react';

export const RecipesView: React.FC = () => {
  const { products, recipesMap, ingredientsMap, saveRecipe, ingredients, setAdminTab } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [editingRecipeModalOpen, setEditingRecipeModalOpen] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const currentRecipe = selectedProduct ? recipesMap[selectedProduct.id] : undefined;

  const costAnalysis = calculateRecipeCost(currentRecipe, ingredientsMap);
  const capacityAnalysis = calculateRecipeProductionCapacity(currentRecipe, ingredientsMap);

  const profit = selectedProduct ? calculateProfit(selectedProduct.price, costAnalysis.costWithLoss) : 0;
  const margin = selectedProduct ? calculateMargin(selectedProduct.price, costAnalysis.costWithLoss) : 0;

  return (
    <div id="admin-recipes-root" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Fichas Técnicas & Custos Reais
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Composição detalhada dos ingredientes, perdas na chapa, custo unitário e margem de contribuição.
          </p>
        </div>

        <button
          id="edit-recipe-btn"
          onClick={() => setEditingRecipeModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-md shadow-black/40"
        >
          <Edit2 className="w-4 h-4" />
          <span>{currentRecipe ? 'Editar Ficha Técnica' : 'Criar Ficha Técnica'}</span>
        </button>
      </div>

      {/* Main Grid: Product Picker (left) & Recipe Inspector (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Catalog List */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-bold text-white text-sm font-['Outfit']">Produtos Cadastrados</h3>
            <span className="text-xs text-gray-400 font-mono">{products.length} itens</span>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {products.map((prod) => {
              const isSelected = selectedProduct?.id === prod.id;
              const rec = recipesMap[prod.id];
              const costCalc = calculateRecipeCost(rec, ingredientsMap);
              const hasRecipe = rec && rec.items.length > 0;

              return (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#F27D26]/10 border-[#F27D26] text-white shadow-md'
                      : 'bg-[#0A0A0A] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{prod.name}</h4>
                      <p className="text-[11px] text-gray-400">
                        Venda: <span className="text-[#F27D26] font-semibold">{formatBRL(prod.price)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {hasRecipe ? (
                      <span className="text-[10px] font-bold text-green-400 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                        Custo: {formatBRL(costCalc.costWithLoss)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                        Sem Ficha
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Product Technical Sheet */}
        <div className="lg:col-span-8 space-y-6">
          {selectedProduct ? (
            <>
              {/* Product Header & Top Metrics */}
              <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20">
                          {selectedProduct.category}
                        </span>
                        {currentRecipe?.preparationTimeMinutes && (
                          <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3 text-[#F27D26]" />
                            <span>{currentRecipe.preparationTimeMinutes} min de preparo</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] mt-1">
                        {selectedProduct.name}
                      </h2>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Preço de Venda Praticado
                    </span>
                    <p className="text-2xl font-black text-[#F27D26] font-['Outfit']">
                      {formatBRL(selectedProduct.price)}
                    </p>
                  </div>
                </div>

                {/* 4 Cards: Custo Base, Perda %, Custo Real com Perda, Lucro & Margem */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Custo Insumos</span>
                    <p className="text-lg font-black text-white font-mono mt-1">
                      {formatBRL(costAnalysis.baseCost)}
                    </p>
                    <p className="text-[10px] text-gray-500">Soma direta</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Perda Estimada</span>
                    <p className="text-lg font-black text-[#F27D26] font-mono mt-1">
                      {currentRecipe?.lossPercentage || 0}%
                    </p>
                    <p className="text-[10px] text-gray-500">
                      +{formatBRL(costAnalysis.lossValue)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Custo Real (CMV)</span>
                    <p className="text-lg font-black text-red-300 font-mono mt-1">
                      {formatBRL(costAnalysis.costWithLoss)}
                    </p>
                    <p className="text-[10px] text-gray-500">Com perdas</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Margem Bruta</span>
                    <p className="text-lg font-black text-green-400 font-mono mt-1">
                      {margin.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-green-400 font-bold">
                      Lucro: +{formatBRL(profit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ingredient Breakdown Table */}
              <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                      Ingredientes da Receita (Fórmula)
                    </h3>
                    <p className="text-xs text-gray-400">
                      Custo proporcional calculado a partir dos valores da última compra de estoque.
                    </p>
                  </div>
                </div>

                {costAnalysis.itemCosts.length === 0 ? (
                  <div className="p-8 text-center bg-[#0A0A0A] rounded-xl border border-dashed border-white/10">
                    <UtensilsCrossed className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-300">Nenhum ingrediente cadastrado</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Clique no botão acima para montar a ficha técnica deste produto.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] font-mono">
                          <th className="py-2.5 px-3">Ingrediente</th>
                          <th className="py-2.5 px-3">Qtd / Porção</th>
                          <th className="py-2.5 px-3">Custo Unitário</th>
                          <th className="py-2.5 px-3">Custo no Lanche</th>
                          <th className="py-2.5 px-3 text-right">Peso no Custo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-gray-300">
                        {costAnalysis.itemCosts.map((item, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3 font-bold text-white">{item.name}</td>
                            <td className="py-3 px-3 font-mono">
                              {formatQty(item.quantity, item.unit)}
                            </td>
                            <td className="py-3 px-3 font-mono text-gray-400">
                              {formatBRL(item.unitCost)} / {item.unit}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-red-300">
                              {formatBRL(item.cost)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-[#F27D26]">
                              {item.percentageOfTotal.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Instructions */}
                {currentRecipe?.instructions && (
                  <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 text-xs mt-4">
                    <span className="font-bold text-[#F27D26] uppercase tracking-wider block mb-1">
                      Modo de Preparo Padrão (Procedimento Operacional Padrão):
                    </span>
                    <p className="text-gray-300 leading-relaxed">{currentRecipe.instructions}</p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Edit / Create Recipe Modal */}
      {editingRecipeModalOpen && selectedProduct && (
        <RecipeEditorModal
          product={selectedProduct}
          existingRecipe={currentRecipe}
          ingredients={ingredients}
          onClose={() => setEditingRecipeModalOpen(false)}
          onSave={(rec) => {
            saveRecipe(rec);
            setEditingRecipeModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Modal for editing the recipe
const RecipeEditorModal: React.FC<{
  product: Product;
  existingRecipe?: Recipe;
  ingredients: Ingredient[];
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}> = ({ product, existingRecipe, ingredients, onClose, onSave }) => {
  const [lossPercentage, setLossPercentage] = useState(existingRecipe?.lossPercentage || 5);
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState(
    existingRecipe?.preparationTimeMinutes || 12
  );
  const [instructions, setInstructions] = useState(existingRecipe?.instructions || '');
  const [items, setItems] = useState<RecipeItem[]>(existingRecipe?.items ? [...existingRecipe.items] : []);

  const [newIngredientId, setNewIngredientId] = useState(ingredients[0]?.id || '');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newUnit, setNewUnit] = useState<UnitType>(ingredients[0]?.unit || 'un');

  const handleAddIngredient = () => {
    if (!newIngredientId || newQuantity <= 0) return;
    const ing = ingredients.find((i) => i.id === newIngredientId);
    setItems((prev) => [
      ...prev,
      {
        ingredientId: newIngredientId,
        quantity: newQuantity,
        unit: ing?.unit || newUnit,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecipe: Recipe = {
      id: existingRecipe?.id || `rec-${product.id}`,
      productId: product.id,
      lossPercentage,
      preparationTimeMinutes,
      items,
      instructions: instructions.trim() || undefined,
    };
    onSave(newRecipe);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">
              Ficha Técnica: {product.name}
            </h3>
            <p className="text-xs text-gray-400">Configure os ingredientes e percentual de perda</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Margem de Perda / Quebra (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={lossPercentage}
                onChange={(e) => setLossPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">Ex: 5% gordura/chapa</span>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tempo de Preparo (min)</label>
              <input
                type="number"
                min={1}
                value={preparationTimeMinutes}
                onChange={(e) => setPreparationTimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>

          {/* Add Ingredient Section */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-[#F27D26] uppercase tracking-wider">
              Adicionar Insumo à Receita
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-6">
                <select
                  value={newIngredientId}
                  onChange={(e) => {
                    setNewIngredientId(e.target.value);
                    const selected = ingredients.find((i) => i.id === e.target.value);
                    if (selected) setNewUnit(selected.unit);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({formatBRL(ing.unitCost)}/{ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <input
                  type="number"
                  step="any"
                  min={0.001}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  placeholder="Qtd (ex: 0.18)"
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#F27D26] font-bold text-xs transition-colors"
                >
                  + Inserir
                </button>
              </div>
            </div>
          </div>

          {/* Items in Recipe */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Composição Atual ({items.length} itens)
            </label>
            <div className="divide-y divide-white/5 border border-white/10 rounded-xl bg-[#0A0A0A] overflow-hidden">
              {items.map((it, idx) => {
                const ing = ingredients.find((i) => i.id === it.ingredientId);
                return (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{ing?.name || 'Item'}</span>
                      <span className="text-gray-400 ml-2 font-mono">
                        ({it.quantity} {it.unit})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Modo de Preparo / Instruções</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instruções para a equipe de chapa e montagem..."
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
              Salvar Ficha Técnica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
