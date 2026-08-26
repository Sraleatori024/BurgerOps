import React from 'react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/calculations';
import { Printer, X, Check, MapPin, Phone, User, Clock } from 'lucide-react';

interface ThermalReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = useApp();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="thermal-receipt-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#F27D26]" />
            <h3 className="text-base font-bold text-white font-['Outfit']">Comanda Térmica (80mm)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realistic Thermal Paper Simulation */}
        <div className="mt-4 p-5 bg-stone-100 text-stone-900 rounded-lg shadow-inner font-mono text-xs leading-relaxed max-h-[60vh] overflow-y-auto border border-stone-300">
          {/* Shop Info */}
          <div className="text-center pb-3 border-b border-dashed border-stone-400">
            <p className="font-bold text-sm uppercase tracking-wider">{settings.shopName}</p>
            <p className="text-[11px] text-stone-700">{settings.address}</p>
            <p className="text-[11px] text-stone-700">Tel: {settings.phone}</p>
            <div className="mt-2 inline-block px-3 py-1 bg-stone-900 text-white font-bold text-sm rounded">
              PEDIDO {order.code}
            </div>
            <p className="text-[10px] text-stone-600 mt-1">
              Data: {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
              {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Order Type & Customer */}
          <div className="py-2 border-b border-dashed border-stone-400">
            <p className="font-bold text-xs uppercase">
              TIPO: <span className="bg-stone-300 px-1 py-0.5 rounded">{order.orderType.toUpperCase()}</span>
            </p>
            <p className="font-bold mt-1">CLIENTE: {order.customerName}</p>
            <p>TEL: {order.customerPhone}</p>
            {order.deliveryAddress && (
              <div className="mt-1 bg-stone-200 p-1.5 rounded text-[11px]">
                <p className="font-bold">ENDEREÇO DE ENTREGA:</p>
                <p>
                  {order.deliveryAddress.street}, Nº {order.deliveryAddress.number}
                </p>
                {order.deliveryAddress.complement && <p>Comp: {order.deliveryAddress.complement}</p>}
                <p>Bairro: {order.deliveryAddress.neighborhood}</p>
                {order.deliveryAddress.reference && <p>Ref: {order.deliveryAddress.reference}</p>}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="py-2 border-b border-dashed border-stone-400">
            <div className="grid grid-cols-12 font-bold pb-1 text-[11px]">
              <span className="col-span-2">QTD</span>
              <span className="col-span-7">ITEM</span>
              <span className="col-span-3 text-right">TOTAL</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="py-1 border-t border-dotted border-stone-300">
                <div className="grid grid-cols-12 font-bold text-[11px]">
                  <span className="col-span-2">{item.quantity}x</span>
                  <span className="col-span-7">{item.productName}</span>
                  <span className="col-span-3 text-right">{formatBRL(item.totalPrice)}</span>
                </div>
                {item.selectedAddons && item.selectedAddons.length > 0 && (
                  <div className="pl-4 text-[10px] text-stone-700">
                    {item.selectedAddons.map((addon, aIdx) => (
                      <p key={aIdx}>+ {addon.name} ({formatBRL(addon.price)})</p>
                    ))}
                  </div>
                )}
                {item.removedIngredients && item.removedIngredients.length > 0 && (
                  <div className="pl-4 text-[10px] text-rose-700 font-semibold">
                    {item.removedIngredients.map((rem, rIdx) => (
                      <p key={rIdx}>- SEM {rem.toUpperCase()}</p>
                    ))}
                  </div>
                )}
                {item.notes && (
                  <p className="pl-4 text-[10px] italic text-stone-600 bg-stone-200/60 p-0.5 rounded mt-0.5">
                    Obs: "{item.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>{formatBRL(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>TAXA DE ENTREGA:</span>
                <span>{formatBRL(order.deliveryFee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>DESCONTO:</span>
                <span>-{formatBRL(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-stone-300">
              <span>TOTAL A PAGAR:</span>
              <span>{formatBRL(order.total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="pt-2 text-[11px]">
            <p>
              FORMA DE PGTO:{' '}
              <span className="font-bold uppercase">{order.paymentMethod.replace('_', ' ')}</span>
            </p>
            {order.paymentMethod === 'dinheiro' && order.changeFor && (
              <p>
                Troco para: {formatBRL(order.changeFor)} (Troco:{' '}
                {formatBRL(order.changeFor - order.total)})
              </p>
            )}
            {order.notes && (
              <div className="mt-2 p-1.5 bg-stone-200 rounded text-[10px]">
                <span className="font-bold">OBSERVAÇÕES DO PEDIDO:</span>
                <p>{order.notes}</p>
              </div>
            )}
          </div>

          <div className="text-center text-[10px] text-stone-500 pt-4">
            <p>--- OBRIGADO PELA PREFERÊNCIA! ---</p>
            <p className="text-[9px]">BurgerOps Management Engine</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-sm transition-colors shadow-lg shadow-black/40"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comanda</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
