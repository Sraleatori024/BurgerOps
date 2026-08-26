import React from 'react';
import { Order, OrderStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/calculations';
import {
  CheckCircle2,
  Clock,
  Flame,
  Bike,
  PackageCheck,
  X,
  Phone,
  Printer,
  Sparkles,
} from 'lucide-react';
import { ThermalReceiptModal } from '../common/ThermalReceiptModal';

interface OrderTrackerModalProps {
  order: Order | null;
  onClose: () => void;
}

const STATUS_STEPS: Array<{
  status: OrderStatus;
  title: string;
  desc: string;
  icon: React.ElementType;
}> = [
  {
    status: 'novo',
    title: 'Pedido Recebido',
    desc: 'Seu pedido foi registrado no sistema e aguarda confirmação.',
    icon: Clock,
  },
  {
    status: 'confirmado',
    title: 'Confirmado pela Cozinha',
    desc: 'O restaurante confirmou seu pedido.',
    icon: CheckCircle2,
  },
  {
    status: 'em_preparacao',
    title: 'Em Preparação na Chapa',
    desc: 'Nossos mestres chapeiros estão preparando seus burgers.',
    icon: Flame,
  },
  {
    status: 'pronto',
    title: 'Pronto / Embalado',
    desc: 'Pedido pronto e devidamente embalado.',
    icon: PackageCheck,
  },
  {
    status: 'saiu_entrega',
    title: 'Saiu para Entrega',
    desc: 'O entregador já está a caminho do seu endereço.',
    icon: Bike,
  },
  {
    status: 'entregue',
    title: 'Entregue com Sucesso',
    desc: 'Pedido entregue! Bom apetite!',
    icon: CheckCircle2,
  },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({ order, onClose }) => {
  const { settings } = useApp();
  const [showReceipt, setShowReceipt] = React.useState(false);

  if (!order) return null;

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === order.status);
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <>
      <div
        id="order-tracker-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      >
        <div className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-6">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F27D26]/10 border border-[#F27D26]/20 flex items-center justify-center text-[#F27D26]">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-['Outfit']">
                    Acompanhar Pedido
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#F27D26]/20 text-[#F27D26] text-xs font-mono font-bold">
                    {order.code}
                  </span>
                </div>
                <p className="text-xs text-gray-400">Status em tempo real</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Body */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Live Progress Bar */}
            <div className="space-y-4">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= activeStep;
                const isCurrent = idx === activeStep;
                const IconComponent = step.icon;

                return (
                  <div key={step.status} className="flex items-start gap-4">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-[#F27D26] text-black shadow-lg shadow-black/50 scale-110 ring-4 ring-[#F27D26]/20'
                            : isPassed
                            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                            : 'bg-[#0A0A0A] text-gray-600 border border-white/10'
                        }`}
                      >
                        <IconComponent className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-10 mt-1 transition-colors ${
                            idx < activeStep ? 'bg-green-500/60' : 'bg-white/10'
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-bold ${
                            isCurrent ? 'text-[#F27D26]' : isPassed ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F27D26] bg-[#F27D26]/10 px-2 py-0.5 rounded-full border border-[#F27D26]/20 animate-pulse">
                            Agora
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Items Breakdown */}
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Resumo dos Itens
              </h4>
              <div className="space-y-2 text-xs divide-y divide-white/5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex justify-between items-start">
                    <div>
                      <span className="font-bold text-white">
                        {item.quantity}x {item.productName}
                      </span>
                      {item.selectedAddons && (
                        <p className="text-[10px] text-[#F27D26]">
                          + {item.selectedAddons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-mono text-gray-300">{formatBRL(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                <span>Total Pago:</span>
                <span className="font-mono text-[#F27D26]">{formatBRL(order.total)}</span>
              </div>
            </div>

            {/* Help / Contact */}
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F27D26]" />
                <span>Dúvidas com seu pedido?</span>
              </div>
              <a
                href={`https://wa.me/55${settings.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#F27D26] hover:underline"
              >
                Falar com a Hamburgueria
              </a>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-6 bg-[#0A0A0A] border-t border-white/10 flex gap-3">
            <button
              onClick={() => setShowReceipt(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold text-xs sm:text-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Ver Comanda Fiscal / Impressão</span>
            </button>
            <button
              onClick={onClose}
              className="py-3 px-5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-md shadow-black/40"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {showReceipt && (
        <ThermalReceiptModal order={order} onClose={() => setShowReceipt(false)} />
      )}
    </>
  );
};
