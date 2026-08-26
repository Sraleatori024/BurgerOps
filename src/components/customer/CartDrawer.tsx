import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/calculations';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Truck,
  Store,
} from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer: React.FC = () => {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateCartQuantity, settings } = useApp();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  if (!cartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <>
      <div
        id="cart-drawer-backdrop"
        onClick={() => setCartOpen(false)}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div
        id="cart-drawer-container"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#141414] border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F27D26]/10 border border-[#F27D26]/20 flex items-center justify-center text-[#F27D26]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white font-['Outfit'] text-base">Seu Carrinho</h2>
              <p className="text-xs text-gray-400">
                {cart.length === 0
                  ? 'Carrinho vazio'
                  : `${cart.reduce((s, i) => s + i.quantity, 0)} ${
                      cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'itens'
                    }`}
              </p>
            </div>
          </div>
          <button
            id="close-cart-drawer-btn"
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <ShoppingBag className="w-16 h-16 stroke-[1.2] mb-3 text-gray-600" />
              <p className="font-bold text-gray-300 text-base">Seu carrinho está vazio</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Navegue pelo cardápio e adicione seus burgers e porções favoritos!
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-5 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Ver Cardápio
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 flex flex-col gap-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white font-['Outfit']">{item.productName}</h4>
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="text-[11px] text-gray-400 mt-1 space-y-0.5">
                        {item.selectedAddons.map((addon, aIdx) => (
                          <p key={aIdx} className="text-[#F27D26]">
                            + {addon.name} ({formatBRL(addon.price)})
                          </p>
                        ))}
                      </div>
                    )}
                    {item.removedIngredients && item.removedIngredients.length > 0 && (
                      <div className="text-[11px] text-red-400 mt-1">
                        {item.removedIngredients.map((rem, rIdx) => (
                          <p key={rIdx}>- Sem {rem}</p>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-[11px] italic text-gray-400 mt-1 bg-white/5 p-1.5 rounded">
                        Obs: "{item.notes}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  {/* Quantity adjustment */}
                  <div className="flex items-center bg-[#141414] border border-white/10 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQuantity(index, item.quantity - 1)}
                      className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(index, item.quantity + 1)}
                      className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-mono text-sm font-bold text-white">
                    {formatBRL(item.totalPrice)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="p-5 bg-[#0A0A0A] border-t border-white/10 space-y-4">
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-gray-200">{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Taxa de Entrega estimada</span>
                <span className="font-mono text-gray-200">{formatBRL(settings.defaultDeliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Total Estimado</span>
                <span className="font-mono text-[#F27D26] text-base">
                  {formatBRL(subtotal + settings.defaultDeliveryFee)}
                </span>
              </div>
            </div>

            <button
              id="proceed-to-checkout-btn"
              onClick={() => setCheckoutModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-sm transition-all shadow-lg shadow-black/40"
            >
              <span>Avançar para Checkout</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      {checkoutModalOpen && (
        <CheckoutModal onClose={() => setCheckoutModalOpen(false)} />
      )}
    </>
  );
};
