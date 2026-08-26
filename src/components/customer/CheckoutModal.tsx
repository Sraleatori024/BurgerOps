import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderType, PaymentMethod } from '../../types';
import { formatBRL } from '../../utils/calculations';
import confetti from 'canvas-confetti';
import {
  X,
  Truck,
  Store,
  QrCode,
  CreditCard,
  Banknote,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const { cart, submitCustomerOrder, settings, customers } = useApp();

  const [orderType, setOrderType] = useState<OrderType>('entrega');
  const [customerName, setCustomerName] = useState('Gabriel Ribeiro');
  const [customerPhone, setCustomerPhone] = useState('(11) 99123-4567');
  const [street, setStreet] = useState('Rua Oscar Freire');
  const [number, setNumber] = useState('1420');
  const [neighborhood, setNeighborhood] = useState('Cerqueira César');
  const [complement, setComplement] = useState('Apto 82');
  const [reference, setReference] = useState('Próximo à estação Oscar Freire');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState<string>('150');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = orderType === 'entrega' ? settings.defaultDeliveryFee : 0;
  const total = subtotal + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor informe seu nome e telefone para contato.');
      return;
    }
    if (orderType === 'entrega' && (!street.trim() || !number.trim() || !neighborhood.trim())) {
      alert('Por favor preencha os dados do endereço de entrega.');
      return;
    }

    setIsSubmitting(true);

    try {
      const createdOrder = submitCustomerOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress:
          orderType === 'entrega'
            ? {
                street: street.trim(),
                number: number.trim(),
                neighborhood: neighborhood.trim(),
                complement: complement.trim() || undefined,
                reference: reference.trim() || undefined,
                city: 'São Paulo',
              }
            : undefined,
        paymentMethod,
        changeFor: paymentMethod === 'dinheiro' && changeFor ? Number(changeFor) : undefined,
        notes: orderNotes.trim() || undefined,
        deliveryFee,
      });

      // Launch victory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ea580c', '#10b981', '#ffffff'],
      });

      onClose();
    } catch (err) {
      console.error('Error submitting order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F27D26]/10 border border-[#F27D26]/20 flex items-center justify-center text-[#F27D26]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                Finalizar Pedido
              </h2>
              <p className="text-xs text-gray-400">Preencha seus dados para receber o pedido</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Order Type Toggle */}
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
              Tipo de Pedido
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="select-order-type-delivery"
                onClick={() => setOrderType('entrega')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-bold text-xs sm:text-sm transition-all ${
                  orderType === 'entrega'
                    ? 'bg-[#F27D26] text-black border-[#F27D26] shadow-md shadow-black/40'
                    : 'bg-[#0A0A0A] text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Entrega (+{formatBRL(settings.defaultDeliveryFee)})</span>
              </button>

              <button
                type="button"
                id="select-order-type-takeout"
                onClick={() => setOrderType('retirada')}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border font-bold text-xs sm:text-sm transition-all ${
                  orderType === 'retirada'
                    ? 'bg-[#F27D26] text-black border-[#F27D26] shadow-md shadow-black/40'
                    : 'bg-[#0A0A0A] text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Retirar no Balcão (Grátis)</span>
              </button>
            </div>
          </div>

          {/* Customer Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Seus Dados de Contato</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Gabriel Silva"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">WhatsApp / Telefone</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ex: (11) 99123-4567"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address (if Delivery selected) */}
          {orderType === 'entrega' && (
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F27D26]" />
                <span>Endereço para Entrega</span>
              </h3>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8">
                  <label className="text-[11px] text-gray-400 mb-1 block">Rua / Avenida</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex: Rua Oscar Freire"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors"
                  />
                </div>

                <div className="col-span-4">
                  <label className="text-[11px] text-gray-400 mb-1 block">Número</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex: 1420"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors"
                  />
                </div>

                <div className="col-span-6">
                  <label className="text-[11px] text-gray-400 mb-1 block">Bairro</label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Cerqueira César"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors"
                  />
                </div>

                <div className="col-span-6">
                  <label className="text-[11px] text-gray-400 mb-1 block">Complemento</label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Ex: Apto 82, Bloco B"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors"
                  />
                </div>

                <div className="col-span-12">
                  <label className="text-[11px] text-gray-400 mb-1 block">Ponto de Referência (opcional)</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: Portaria 24h, ao lado da padaria"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Forma de Pagamento
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'pix'
                    ? 'border-green-500 bg-green-500/10 text-green-300'
                    : 'border-white/10 bg-[#0A0A0A] text-gray-400 hover:border-white/20'
                }`}
              >
                <QrCode className="w-5 h-5 text-green-400" />
                <span>Pix Instantâneo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao_credito')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'cartao_credito'
                    ? 'border-[#F27D26] bg-[#F27D26]/10 text-white'
                    : 'border-white/10 bg-[#0A0A0A] text-gray-400 hover:border-white/20'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#F27D26]" />
                <span>Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao_debito')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'cartao_debito'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-white/10 bg-[#0A0A0A] text-gray-400 hover:border-white/20'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-400" />
                <span>Débito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('dinheiro')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'dinheiro'
                    ? 'border-[#F27D26] bg-[#F27D26]/10 text-[#F27D26]'
                    : 'border-white/10 bg-[#0A0A0A] text-gray-400 hover:border-white/20'
                }`}
              >
                <Banknote className="w-5 h-5 text-[#F27D26]" />
                <span>Dinheiro</span>
              </button>
            </div>

            {paymentMethod === 'pix' && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400 shrink-0" />
                <span>Chave Pix CNPJ gerada automaticamente na finalização do pedido.</span>
              </div>
            )}

            {paymentMethod === 'dinheiro' && (
              <div className="p-3 bg-[#0A0A0A] border border-white/10 rounded-lg">
                <label className="text-xs text-gray-400 mb-1 block">Precisa de troco para quanto?</label>
                <input
                  type="number"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                  placeholder="Ex: 100 ou 150"
                  className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/10 text-xs text-white"
                />
              </div>
            )}
          </div>

          {/* General Notes */}
          <div className="pt-3 border-t border-white/10">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Instruções de Entrega / Observações</span>
            </label>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Ex: Chamar no interfone 82, não buzinar..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F27D26] resize-none"
            />
          </div>

          {/* Order Summary Breakdown */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal ({cart.length} itens)</span>
              <span className="font-mono text-gray-200">{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Taxa de Entrega</span>
              <span className="font-mono text-gray-200">
                {deliveryFee > 0 ? formatBRL(deliveryFee) : 'Grátis'}
              </span>
            </div>
            <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-white/10">
              <span>Total do Pedido</span>
              <span className="font-mono text-[#F27D26]">{formatBRL(total)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="submit-final-order-btn"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-base transition-all shadow-xl shadow-black/50"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>CONFIRMAR & ENVIAR PEDIDO ({formatBRL(total)})</span>
          </button>
        </form>
      </div>
    </div>
  );
};
