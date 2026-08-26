import React, { useState } from 'react';
import { Product, ProductAddon, OrderItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/calculations';
import { X, Plus, Minus, Check, Flame, MessageSquare } from 'lucide-react';

export const ProductCustomizerModal: React.FC = () => {
  const {
    selectedProductForCustomization: product,
    setSelectedProductForCustomization,
    addToCart,
    recipesMap,
    ingredientsMap,
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  if (!product) return null;

  const toggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]
    );
  };

  const toggleRemoved = (ingName: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ingName) ? prev.filter((name) => name !== ingName) : [...prev, ingName]
    );
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = product.price + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirmAddToCart = () => {
    const orderItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      unitCost: 0, // calculated automatically during checkout/order submission
      selectedAddons: selectedAddons.map((a) => ({
        name: a.name,
        price: a.price,
        ingredientId: a.ingredientId,
        quantity: a.ingredientQuantity,
      })),
      removedIngredients: removedIngredients.length > 0 ? removedIngredients : undefined,
      notes: notes.trim() || undefined,
      totalPrice,
    };

    addToCart(orderItem);
    setSelectedProductForCustomization(null);
  };

  return (
    <div
      id="product-customizer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Image */}
        <div className="relative h-48 sm:h-56 w-full bg-[#0A0A0A]">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/40" />

          <button
            id="close-customizer-modal-btn"
            onClick={() => setSelectedProductForCustomization(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/80 text-gray-300 hover:text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
              {product.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 leading-relaxed">
              {product.description}
            </p>
            <div className="mt-2 text-base font-bold text-[#F27D26]">
              Preço base: {formatBRL(product.price)}
            </div>
          </div>

          {/* Addons Selection */}
          {product.availableAddons && product.availableAddons.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Adicionais Extras
                </h3>
                <span className="text-[11px] text-gray-400">Opcional</span>
              </div>

              <div className="space-y-2">
                {product.availableAddons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-[#F27D26] bg-[#F27D26]/10 text-white'
                          : 'border-white/10 bg-[#0A0A0A] text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'border-[#F27D26] bg-[#F27D26] text-black'
                              : 'border-white/20 bg-white/5'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{addon.name}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#F27D26]">
                        +{formatBRL(addon.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remove Ingredients */}
          {product.removableIngredients && product.removableIngredients.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Remover Ingredientes
                </h3>
                <span className="text-[11px] text-gray-400">Personalize seu lanche</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {product.removableIngredients.map((ingName) => {
                  const isRemoved = removedIngredients.includes(ingName);
                  return (
                    <button
                      key={ingName}
                      type="button"
                      onClick={() => toggleRemoved(ingName)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                        isRemoved
                          ? 'border-red-500/60 bg-red-500/10 text-red-300'
                          : 'border-white/10 bg-[#0A0A0A] text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                          isRemoved ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {isRemoved ? '✕' : ''}
                      </span>
                      <span>Sem {ingName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Notes */}
          <div className="border-t border-white/10 pt-4">
            <label className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Observações para a Cozinha</span>
            </label>
            <textarea
              id="product-customizer-notes"
              rows={2}
              placeholder="Ex: ponto da carne mais passado, cortar ao meio, caprichar no guardanapo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F27D26] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Modal Footer / Quantity & Confirm */}
        <div className="p-4 sm:p-6 bg-[#0A0A0A] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center bg-[#141414] border border-white/10 rounded-lg p-1 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm text-white">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Submit Button */}
          <button
            id="confirm-add-to-cart-btn"
            onClick={handleConfirmAddToCart}
            className="w-full sm:w-auto flex-1 flex items-center justify-between px-6 py-3 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-sm transition-all shadow-lg shadow-black/40"
          >
            <span>Adicionar ao Pedido</span>
            <span className="font-mono text-base">{formatBRL(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
