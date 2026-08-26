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
  MapPin,
  Search,
  Filter,
  Plus,
  ArrowRight,
  User,
  MessageSquare,
} from 'lucide-react';
import { ThermalReceiptModal } from '../common/ThermalReceiptModal';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  novo: {
    label: 'Novo Pedido',
    bg: 'bg-white/5',
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

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
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
        return 'Confirmar Pedido';
      case 'em_preparacao':
        return 'Enviar p/ Chapa';
      case 'pronto':
        return 'Marcar como Pronto';
      case 'saiu_entrega':
        return 'Despachar Entrega';
      case 'entregue':
        return 'Concluir Entrega';
      default:
        return 'Avançar';
    }
  };

  const generateWhatsAppLink = (order: Order) => {
    const phone = order.customerPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${order.customerName}! Aqui é da ${settings.shopName}.\nSeu pedido ${order.code} está com status: ${STATUS_CONFIG[order.status].label.toUpperCase()}!\nTotal: ${formatBRL(order.total)}.`
    );
    return `https://wa.me/55${phone}?text=${message}`;
  };

  return (
    <div id="admin-orders-root" className="space-y-6 pb-16">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Gestão de Pedidos & KDS Cozinha
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Acompanhe o fluxo da chapa ao delivery com baixa automática de estoque.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="open-manual-pdv-btn"
            onClick={() => setNewManualOrderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs sm:text-sm transition-colors shadow-md shadow-black/40"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Novo Pedido Balcão (PDV)</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & View Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-[#141414] border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {['todos', 'novo', 'em_preparacao', 'pronto', 'saiu_entrega', 'entregue'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-[#F27D26] text-black font-bold shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {st === 'todos' ? 'Todos os Status' : STATUS_CONFIG[st as OrderStatus]?.label || st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código (#1048) ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="flex items-center bg-[#0A0A0A] border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                viewMode === 'kanban' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                viewMode === 'table' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Tabela
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Grid Mode */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className="flex flex-col rounded-xl bg-[#141414] border border-white/10 p-4 shadow-xl min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ColIcon className={`w-4 h-4 ${config.text}`} />
                    <h3 className="font-bold text-white text-sm font-['Outfit']">{config.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-gray-300">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[650px] pr-1">
                  {colOrders.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-gray-600 border border-dashed border-white/10 rounded-xl">
                      Nenhum pedido aqui
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const nextStatus = getNextStatus(order.status);

                      return (
                        <div
                          key={order.id}
                          className="p-4 rounded-xl bg-[#0D0D0D] border border-white/10 shadow-md hover:border-white/20 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#F27D26] text-sm">
                                  {order.code}
                                </span>
                                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                                  {order.orderType}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-white mt-1 truncate max-w-[170px]">
                                {order.customerName}
                              </h4>
                              <p className="text-[11px] text-gray-400">{order.customerPhone}</p>
                            </div>

                            <div className="text-right">
                              <span className="font-mono text-sm font-bold text-white">
                                {formatBRL(order.total)}
                              </span>
                              <p className="text-[10px] text-green-400 font-semibold">
                                Lucro: +{formatBRL(order.grossProfit)}
                              </p>
                            </div>
                          </div>

                          {/* Items summary */}
                          <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] space-y-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="font-semibold text-gray-200">
                                  {it.quantity}x {it.productName}
                                </span>
                              </div>
                            ))}
                            {order.notes && (
                              <p className="text-[10px] italic text-[#F27D26] pt-1 border-t border-white/5 truncate">
                                Obs: {order.notes}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            {nextStatus && (
                              <button
                                onClick={() => updateOrderStatus(order.id, nextStatus)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs transition-colors shadow-sm"
                              >
                                <span>{getNextStatusLabel(nextStatus)}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedOrderForReceipt(order)}
                              title="Imprimir Comanda"
                              className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <a
                              href={generateWhatsAppLink(order)}
                              target="_blank"
                              rel="noreferrer"
                              title="Enviar WhatsApp"
                              className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
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
      ) : (
        /* Table Mode */
        <div className="p-5 rounded-xl bg-[#141414] border border-white/10 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Cliente & Tel</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Itens</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Custo CMV</th>
                <th className="py-3 px-4">Lucro Bruto</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredOrders.map((order) => {
                const config = STATUS_CONFIG[order.status];
                const nextStatus = getNextStatus(order.status);

                return (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#F27D26]">{order.code}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{order.customerName}</p>
                      <p className="text-[11px] text-gray-400">{order.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-semibold text-[11px]">
                      {order.orderType}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatBRL(order.total)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-red-400">
                      {formatBRL(order.totalCost)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-green-400">
                      +{formatBRL(order.grossProfit)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${config.bg} ${config.text} ${config.border}`}
                      >
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {nextStatus && (
                          <button
                            onClick={() => updateOrderStatus(order.id, nextStatus)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs transition-colors"
                          >
                            {getNextStatusLabel(nextStatus)}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrderForReceipt(order)}
                          className="p-1.5 rounded-lg bg-white/5 text-gray-300 hover:text-white border border-white/10"
                          title="Imprimir Comanda"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 border border-white/10"
                          title="Cancelar"
                        >
                          <XCircle className="w-3.5 h-3.5" />
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

      {/* Thermal Receipt Modal */}
      {selectedOrderForReceipt && (
        <ThermalReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}

      {/* Manual PDV Cashier Order Modal */}
      {newManualOrderModalOpen && (
        <ManualPDVModal onClose={() => setNewManualOrderModalOpen(false)} />
      )}
    </div>
  );
};

// Sub-component for fast manual cashier order creation
const ManualPDVModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { products, submitCustomerOrder, showToast } = useApp();
  const [customerName, setCustomerName] = useState('Cliente Balcão');
  const [customerPhone, setCustomerPhone] = useState('(11) 99999-0000');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<OrderType>('retirada');

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // Use cart simulation for direct PDV
    submitCustomerOrder({
      customerName,
      customerPhone,
      orderType,
      paymentMethod: 'cartao_debito',
      deliveryFee: 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit']">Lançar Pedido Balcão (PDV)</h3>
        <p className="text-xs text-gray-400">
          Lança pedido manual com baixa imediata no estoque e cálculo de lucro.
        </p>

        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block font-medium">Nome do Cliente</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block font-medium">Telefone</label>
            <input
              type="text"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block font-medium">Produto</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {formatBRL(p.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block font-medium">Quantidade</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F27D26]"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white font-semibold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold text-xs transition-colors"
            >
              Confirmar e Baixar Estoque
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
