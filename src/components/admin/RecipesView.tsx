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
  X,
  Eye,
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

  // Suggested price based on target 60% margin
  const suggestedPrice = costAnalysis.costWithLoss > 0 ? costAnalysis.costWithLoss / (1 - 0.6) : selectedProduct?.price || 0;

  return (
    <div id="admin-recipes-root" className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Outfit'] truncate">
            Fichas Técnicas & Custos
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            Composição detalhada dos lanches, perdas na chapa e margens reais.
          </p>
        </div>

        {selectedProduct && (
          <button
            id="edit-recipe-btn"
            onClick={() => setEditingRecipeModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-sm shrink-0"
          >
            <Edit2 className="w-4 h-4" />
            <span>{currentRecipe ? 'Editar Ficha Técnica' : 'Criar Ficha Técnica'}</span>
          </button>
        )}
      </div>

      {/* Main Container: Product Picker on Left, Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Product Picker List (Horizontally scrollable on mobile or vertical stack) */}
        <div className="lg:col-span-4 p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="font-bold text-white text-xs sm:text-sm font-['Outfit']">Cardápio Cadastrado</h3>
            <span className="text-xs text-gray-400 font-mono">{products.length} itens</span>
          </div>

          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar lg:max-h-[560px] pb-1 lg:pb-0">
            {products.map((prod) => {
              const isSelected = selectedProduct?.id === prod.id;
              const rec = recipesMap[prod.id];
              const costCalc = calculateRecipeCost(rec, ingredientsMap);
              const hasRecipe = rec && rec.items.length > 0;

              return (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`w-52 lg:w-full shrink-0 flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#F27D26]/10 border-[#F27D26] text-white shadow-sm'
                      : 'bg-[#0A0A0A] border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                      <p className="text-[11px] text-gray-400">
                        Venda: <span className="text-[#F27D26] font-semibold">{formatBRL(prod.price)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 hidden xs:block">
                    {hasRecipe ? (
                      <span className="text-[10px] font-bold text-green-400 px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                        {formatBRL(costCalc.costWithLoss)}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-red-400 px-1.5 py-0.5 rounded bg-red-500/10">
                        S/ Ficha
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Product Technical Sheet Inspector */}
        <div className="lg:col-span-8 space-y-4">
          {selectedProduct ? (
            <>
              {/* Product Header & Top Metrics */}
              <div className="p-4 sm:p-6 rounded-xl bg-[#141414] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20">
                          {selectedProduct.category}
                        </span>
                        {currentRecipe?.preparationTimeMinutes && (
                          <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3 text-[#F27D26]" />
                            <span>{currentRecipe.preparationTimeMinutes} min</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-base sm:text-xl font-black text-white font-['Outfit'] mt-1 truncate">
                        {selectedProduct.name}
                      </h2>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Preço de Venda
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-[#F27D26] font-['Outfit']">
                      {formatBRL(selectedProduct.price)}
                    </p>
                  </div>
                </div>

                {/* 4 Metrics Cards: Custo Insumos, Perda, CMV Real, Margem & Lucro */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10">
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Custo Insumos</span>
                    <p className="text-sm sm:text-base font-black text-white font-mono mt-0.5">
                      {formatBRL(costAnalysis.baseCost)}
                    </p>
                    <p className="text-[10px] text-gray-500">Soma direta</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10">
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Perda na Chapa</span>
                    <p className="text-sm sm:text-base font-black text-[#F27D26] font-mono mt-0.5">
                      {currentRecipe?.lossPercentage || 0}%
                    </p>
                    <p className="text-[10px] text-gray-500">+{formatBRL(costAnalysis.lossValue)}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10">
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Custo CMV Total</span>
                    <p className="text-sm sm:text-base font-black text-red-300 font-mono mt-0.5">
                      {formatBRL(costAnalysis.costWithLoss)}
                    </p>
                    <p className="text-[10px] text-gray-500">Com quebras</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0A0A0A] border border-white/10">
                    <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Margem Atual</span>
                    <p className="text-sm sm:text-base font-black text-green-400 font-mono mt-0.5">
                      {margin.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-green-400 font-semibold">+{formatBRL(profit)} lucro</p>
                  </div>
                </div>

                {/* Suggested price indicator */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-400">Preço Sugerido (Margem Alvo 60%):</span>
                    <span className="font-bold text-white ml-2">{formatBRL(suggestedPrice)}</span>
                  </div>
                  <button
                    onClick={() => setAdminTab('pricing')}
                    className="text-[#F27D26] font-bold hover:underline"
                  >
                    Simular Preço ➔
                  </button>
                </div>
              </div>

              {/* Ingredient Breakdown */}
              <div className="p-4 sm:p-6 rounded-xl bg-[#141414] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide font-mono">
                      Ingredientes da Fórmula
                    </h3>
                    <p className="text-[11px] text-gray-400">Custo proporcional por porção</p>
                  </div>
                  <button
                    onClick={() => setEditingRecipeModalOpen(true)}
                    className="text-xs font-bold text-[#F27D26] hover:underline"
                  >
                    + Ajustar Insumos
                  </button>
                </div>

                {costAnalysis.itemCosts.length === 0 ? (
                  <div className="p-6 text-center bg-[#0A0A0A] rounded-xl border border-dashed border-white/10">
                    <UtensilsCrossed className="w-8 h-8 text-gray-600 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-gray-300">Nenhum ingrediente configurado</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Clique em Editar Ficha Técnica para cadastrar a composição.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Mobile Card Items */}
                    <div className="divide-y divide-white/5 bg-[#0A0A0A] rounded-xl border border-white/5 overflow-hidden">
                      {costAnalysis.itemCosts.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <h4 className="font-bold text-white truncate">{item.name}</h4>
                            <p className="text-[11px] text-gray-400">
                              Porção: <span className="text-gray-200 font-semibold">{formatQty(item.quantity, item.unit)}</span> • Base:{' '}
                              {formatBRL(item.unitCost)}/{item.unit}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-mono font-bold text-red-300">{formatBRL(item.cost)}</p>
                            <span className="text-[10px] text-gray-500">
                              {costAnalysis.baseCost > 0 ? ((item.cost / costAnalysis.baseCost) * 100).toFixed(0) : 0}% do custo
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-[#141414] border border-white/10 rounded-xl">
              <p className="text-xs text-gray-400">Selecione um produto para visualizar a ficha técnica.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Form Modal (Mobile responsive bottom sheet / centered) */}
      {editingRecipeModalOpen && selectedProduct && (
        <RecipeFormModal
          product={selectedProduct}
          existingRecipe={currentRecipe}
          ingredients={ingredients}
          onClose={() => setEditingRecipeModalOpen(false)}
          onSave={(recipe) => {
            saveRecipe(recipe);
            setEditingRecipeModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Modal for editing the recipe
const RecipeFormModal: React.FC<{
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-2xl bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Ficha Técnica: {product.name}
            </h3>
            <p className="text-xs text-gray-400">Configure os ingredientes e percentual de perda</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* General Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 font-bold mb-1 block">Margem Perda (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={lossPercentage}
                onChange={(e) => setLossPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-gray-400 font-bold mb-1 block">Preparo (min)</label>
              <input
                type="number"
                min={1}
                value={preparationTimeMinutes}
                onChange={(e) => setPreparationTimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>

          {/* Add Ingredient Section */}
          <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-2.5">
            <h4 className="text-xs font-bold text-[#F27D26] uppercase font-mono">
              Adicionar Insumo
            </h4>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <select
                  value={newIngredientId}
                  onChange={(e) => {
                    setNewIngredientId(e.target.value);
                    const selected = ingredients.find((i) => i.id === e.target.value);
                    if (selected) setNewUnit(selected.unit);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({formatBRL(ing.unitCost)}/{ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-28">
                <input
                  type="number"
                  step="any"
                  min={0.001}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  placeholder="Qtd (ex: 0.18)"
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddIngredient}
                className="py-2 px-4 rounded-lg bg-[#F27D26] text-black font-bold shrink-0 transition-colors"
              >
                + Inserir
              </button>
            </div>
          </div>

          {/* Items in Recipe */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block font-mono">
              Composição Atual ({items.length} itens)
            </label>
            <div className="divide-y divide-white/5 border border-white/10 rounded-xl bg-[#0A0A0A] overflow-hidden max-h-48 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-3 text-center text-gray-500">Nenhum insumo inserido ainda.</div>
              ) : (
                items.map((it, idx) => {
                  const ing = ingredients.find((i) => i.id === it.ingredientId);
                  return (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="font-bold text-white truncate">{ing?.name || 'Item'}</span>
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
                })
              )}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="text-gray-400 font-bold mb-1 block">Instruções de Montagem</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instruções para a equipe de chapa..."
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
              Salvar Ficha Técnica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
