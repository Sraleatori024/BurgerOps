import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, OrderType } from '../../types';
import { formatBRL } from '../../utils/calculations';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Flame,
  Bike,
  PackageCheck,
  XCircle,
  Printer,
  Phone,
  Search,
  Plus,
  ArrowRight,
  User,
  Eye,
  X,
} from 'lucide-react';
import { ThermalReceiptModal } from '../common/ThermalReceiptModal';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  novo: {
    label: 'Novo Pedido',
    bg: 'bg-amber-500/10',
    text: 'text-[#F27D26]',
    border: 'border-[#F27D26]/40',
    icon: Clock,
  },
  confirmado: {
    label: 'Confirmado',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: CheckCircle2,
  },
  em_preparacao: {
    label: 'Na Cozinha',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    icon: Flame,
  },
  pronto: {
    label: 'Pronto p/ Envio',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    icon: PackageCheck,
  },
  saiu_entrega: {
    label: 'Em Entrega',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: Bike,
  },
  entregue: {
    label: 'Entregue',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    icon: CheckCircle2,
  },
  cancelado: {
    label: 'Cancelado',
    bg: 'bg-white/5',
    text: 'text-gray-500',
    border: 'border-white/10',
    icon: XCircle,
  },
};

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, cancelOrder, settings, products, submitCustomerOrder } = useApp();

  const [viewMode, setViewMode] = useState<'cards' | 'kanban' | 'table'>('cards');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [newManualOrderModalOpen, setNewManualOrderModalOpen] = useState(false);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'novo':
        return 'confirmado';
      case 'confirmado':
        return 'em_preparacao';
      case 'em_preparacao':
        return 'pronto';
      case 'pronto':
        return 'saiu_entrega';
      case 'saiu_entrega':
        return 'entregue';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (next: OrderStatus): string => {
    switch (next) {
      case 'confirmado':
        return 'Confirmar';
      case 'em_preparacao':
        return 'Chapa';
      case 'pronto':
        return 'Pronto';
      case 'saiu_entrega':
        return 'Despachar';
      case 'entregue':
        return 'Entregar';
      default:
        return 'Avançar';
    }
  };

  const generateWhatsAppLink = (order: Order) => {
    const phone = order.customerPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${order.customerName}! Aqui é da ${settings.shopName}.\nSeu pedido ${order.code} está com status: ${STATUS_CONFIG[order.status]?.label.toUpperCase() || order.status}!\nTotal: ${formatBRL(order.total)}.`
    );
    return `https://wa.me/55${phone}?text=${message}`;
  };

  return (
    <div id="admin-orders-root" className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Outfit'] truncate">
            Gestão de Pedidos & Cozinha
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            Acompanhe o fluxo da chapa ao delivery com baixa automática de estoque.
          </p>
        </div>

        <button
          id="open-manual-pdv-btn"
          onClick={() => setNewManualOrderModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Novo Pedido (PDV)</span>
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#141414] border border-white/10 space-y-3">
        {/* Horizontal scrollable status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {['todos', 'novo', 'em_preparacao', 'pronto', 'saiu_entrega', 'entregue'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                statusFilter === st
                  ? 'bg-[#F27D26] text-black font-bold shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {st === 'todos' ? 'Todos' : STATUS_CONFIG[st as OrderStatus]?.label || st}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código (#1048), cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-[11px] text-gray-500 font-mono">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
            </span>

            {/* View switch buttons */}
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
                onClick={() => setViewMode('kanban')}
                className={`hidden sm:block px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                  viewMode === 'kanban' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Kanban
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

      {/* 1. Mobile & Desktop Cards Mode */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-[#141414] border border-white/10 rounded-xl">
              <ClipboardList className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-300">Nenhum pedido encontrado</p>
              <p className="text-xs text-gray-500 mt-0.5">Ajuste os filtros ou crie um novo pedido no PDV.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.novo;
              const StatusIcon = config.icon;

              return (
                <div
                  key={order.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between gap-3 shadow-md hover:border-white/20 transition-all"
                >
                  {/* Card Top: Code, Type, Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-[#F27D26] text-sm sm:text-base">
                          {order.code}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                          {order.orderType}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
                        {order.customerName}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">{order.customerPhone}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${config.bg} ${config.text} border ${config.border}`}
                      >
                        <StatusIcon className="w-3 h-3 shrink-0" />
                        <span>{config.label}</span>
                      </span>
                      <p className="font-mono text-sm sm:text-base font-bold text-white mt-1">
                        {formatBRL(order.total)}
                      </p>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-white/5 text-xs space-y-1">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-gray-200">
                        <span className="font-semibold truncate">
                          {it.quantity}x {it.productName}
                        </span>
                        <span className="font-mono text-gray-400 text-[11px] shrink-0 ml-2">
                          {formatBRL(it.totalPrice)}
                        </span>
                      </div>
                    ))}
                    {order.notes && (
                      <p className="text-[11px] italic text-[#F27D26] pt-1 border-t border-white/5 truncate">
                        Obs: {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {nextStatus ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, nextStatus)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs transition-colors shadow-sm"
                      >
                        <span>{getNextStatusLabel(nextStatus)}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="flex-1 text-center py-2 text-[11px] font-bold text-green-400 bg-green-500/10 rounded-lg border border-green-500/20">
                        ✓ Concluído
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedOrderDetails(order)}
                      title="Ver Detalhes"
                      className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white border border-white/10 transition-colors shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSelectedOrderForReceipt(order)}
                      title="Imprimir Comanda"
                      className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white border border-white/10 transition-colors shrink-0"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <a
                      href={generateWhatsAppLink(order)}
                      target="_blank"
                      rel="noreferrer"
                      title="WhatsApp"
                      className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors shrink-0"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Kanban Mode (for Desktop/Tablet) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['novo', 'em_preparacao', 'pronto', 'saiu_entrega'] as OrderStatus[]).map((statusCol) => {
            const colOrders = filteredOrders.filter(
              (o) =>
                o.status === statusCol ||
                (statusCol === 'em_preparacao' && o.status === 'confirmado')
            );
            const config = STATUS_CONFIG[statusCol];
            const ColIcon = config.icon;

            return (
              <div
                key={statusCol}
                className="flex flex-col rounded-xl bg-[#141414] border border-white/10 p-3.5 shadow-xl min-h-[450px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ColIcon className={`w-4 h-4 shrink-0 ${config.text}`} />
                    <h3 className="font-bold text-white text-xs sm:text-sm font-['Outfit'] truncate">
                      {config.label}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/5 border border-white/10 text-gray-300 shrink-0">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
                  {colOrders.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-xs text-gray-600 border border-dashed border-white/10 rounded-lg">
                      Nenhum pedido aqui
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const nextStatus = getNextStatus(order.status);

                      return (
                        <div
                          key={order.id}
                          className="p-3 rounded-lg bg-[#0D0D0D] border border-white/10 shadow-sm space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-[#F27D26] text-xs">
                                {order.code}
                              </span>
                              <h4 className="text-xs font-bold text-white truncate">
                                {order.customerName}
                              </h4>
                            </div>
                            <span className="font-mono text-xs font-bold text-white shrink-0">
                              {formatBRL(order.total)}
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-300 space-y-0.5 bg-white/5 p-2 rounded">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="truncate">
                                {it.quantity}x {it.productName}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-1 pt-1">
                            {nextStatus && (
                              <button
                                onClick={() => updateOrderStatus(order.id, nextStatus)}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-[#F27D26] text-black font-bold text-[11px]"
                              >
                                <span>{getNextStatusLabel(nextStatus)}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedOrderForReceipt(order)}
                              className="p-1.5 rounded bg-white/5 text-gray-300 hover:text-white border border-white/10"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Table Mode */}
      {viewMode === 'table' && (
        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Itens</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredOrders.map((order) => {
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.novo;
                const nextStatus = getNextStatus(order.status);

                return (
                  <tr key={order.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-mono font-bold text-[#F27D26]">{order.code}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{order.customerName}</p>
                      <p className="text-[11px] text-gray-500">{order.customerPhone}</p>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-gray-400">
                      {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">{formatBRL(order.total)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.text} border ${config.border}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {nextStatus && (
                          <button
                            onClick={() => updateOrderStatus(order.id, nextStatus)}
                            className="px-2.5 py-1 rounded bg-[#F27D26] text-black font-bold text-xs"
                          >
                            {getNextStatusLabel(nextStatus)}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrderForReceipt(order)}
                          className="p-1 rounded bg-white/5 text-gray-300 hover:text-white border border-white/10"
                        >
                          <Printer className="w-3.5 h-3.5" />
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

      {/* Order Details Modal (Responsive Bottom Sheet / Full screen on Mobile) */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            onClick={() => setSelectedOrderDetails(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-[#F27D26] text-lg">
                  {selectedOrderDetails.code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-white/5 text-gray-300 border border-white/10">
                  {selectedOrderDetails.orderType}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-gray-400">
                Cliente: <span className="text-white font-bold">{selectedOrderDetails.customerName}</span>
              </p>
              <p className="text-gray-400">
                Telefone: <span className="text-white font-bold">{selectedOrderDetails.customerPhone}</span>
              </p>
              {selectedOrderDetails.deliveryAddress && (
                <p className="text-gray-400">
                  Endereço:{' '}
                  <span className="text-white font-medium">
                    {selectedOrderDetails.deliveryAddress.street},{' '}
                    {selectedOrderDetails.deliveryAddress.number} - {selectedOrderDetails.deliveryAddress.neighborhood}
                  </span>
                </p>
              )}
            </div>

            <div className="p-3 bg-[#0A0A0A] rounded-xl border border-white/5 space-y-2 text-xs">
              <h5 className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">
                Itens do Pedido
              </h5>
              {selectedOrderDetails.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-bold text-white">
                      {it.quantity}x {it.productName}
                    </p>
                    {it.selectedAddons && it.selectedAddons.length > 0 && (
                      <p className="text-[10px] text-[#F27D26]">
                        + {it.selectedAddons.map((a) => a.name).join(', ')}
                      </p>
                    )}
                    {it.removedIngredients && it.removedIngredients.length > 0 && (
                      <p className="text-[10px] text-red-400">
                        - Sem {it.removedIngredients.join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-bold text-white">{formatBRL(it.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-white/10">
              <span>Total do Pedido:</span>
              <span className="text-[#F27D26] text-base font-mono">{formatBRL(selectedOrderDetails.total)}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedOrderForReceipt(selectedOrderDetails);
                  setSelectedOrderDetails(null);
                }}
                className="flex-1 py-2.5 rounded-lg bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors"
              >
                Imprimir Comanda
              </button>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="flex-1 py-2.5 rounded-lg bg-[#F27D26] text-black font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual PDV Order Modal */}
      {newManualOrderModalOpen && (
        <ManualPDVOrderModal
          products={products}
          onClose={() => setNewManualOrderModalOpen(false)}
          onSubmit={(payload) => {
            submitCustomerOrder(payload);
            setNewManualOrderModalOpen(false);
          }}
        />
      )}

      {/* Thermal Receipt Print Modal */}
      {selectedOrderForReceipt && (
        <ThermalReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
};

// Responsive Manual PDV Order Modal
const ManualPDVOrderModal: React.FC<{
  products: any[];
  onClose: () => void;
  onSubmit: (payload: any) => void;
}> = ({ products, onClose, onSubmit }) => {
  const [customerName, setCustomerName] = useState('Cliente Balcão');
  const [customerPhone, setCustomerPhone] = useState('(11) 99999-0000');
  const [orderType, setOrderType] = useState<OrderType>('balcao');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    onSubmit({
      customerName,
      customerPhone,
      orderType,
      paymentMethod: 'pix',
      deliveryFee: 0,
      notes: notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-[#141414] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-bold text-white text-base font-['Outfit']">Lançar Pedido Balcão (PDV)</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 font-bold mb-1">Nome do Cliente / Mesa</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 font-bold mb-1">Tipo</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
              >
                <option value="balcao">Balcão</option>
                <option value="mesa">Mesa</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-1">Telefone</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Produto</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {formatBRL(p.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Observações do Pedido</label>
            <input
              type="text"
              placeholder="Ex: Sem cebola, carne bem passada"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-white focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-[#F27D26] text-black font-bold"
            >
              Confirmar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
