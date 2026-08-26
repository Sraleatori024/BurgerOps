import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { formatBRL } from '../../utils/calculations';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ShoppingBag,
  Award,
  DollarSign,
  TrendingUp,
  Star,
  MessageSquare,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSegment, setFilterSegment] = useState<'todos' | 'vip' | 'recorrente' | 'novo'>('todos');

  // Categorize customers
  const categorizedCustomers = customers.map((c) => {
    let segment: 'vip' | 'recorrente' | 'novo' = 'novo';
    if (c.totalSpent > 300 || c.totalOrders >= 4) {
      segment = 'vip';
    } else if (c.totalOrders >= 2) {
      segment = 'recorrente';
    }
    return { ...c, segment };
  });

  const filteredCustomers = categorizedCustomers.filter((c) => {
    const matchesSegment = filterSegment === 'todos' || c.segment === filterSegment;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    return matchesSegment && matchesSearch;
  });

  const totalLTV = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrdersPerCustomer =
    customers.length > 0
      ? (customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length).toFixed(1)
      : '0';

  const generateWhatsAppMessage = (customer: Customer) => {
    const phone = customer.phone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá ${customer.name}! Tudo bem? Aqui é da ${settings.shopName}.\nTemos novidades especiais no cardápio de hoje!`
    );
    return `https://wa.me/55${phone}?text=${msg}`;
  };

  return (
    <div id="admin-customers-root" className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            CRM de Clientes & Fidelização
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Histórico de pedidos, LTV (Lifetime Value), ticket médio e canal direto WhatsApp.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total de Clientes na Base
          </span>
          <p className="text-2xl font-black text-white font-['Outfit'] mt-2">
            {customers.length} cadastros
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Captura automática nos pedidos</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Faturamento Total Acumulado (LTV)
          </span>
          <p className="text-2xl font-black text-green-400 font-['Outfit'] mt-2">
            {formatBRL(totalLTV)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Média de {avgOrdersPerCustomer} pedidos por cliente</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Clientes VIP / Recorrentes
          </span>
          <p className="text-2xl font-black text-[#F27D26] font-['Outfit'] mt-2">
            {categorizedCustomers.filter((c) => c.segment === 'vip').length} VIPs
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Alta frequência de consumo</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#141414] border border-white/10">
        <div className="flex items-center gap-2">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'vip', label: '⭐ VIPs' },
            { id: 'recorrente', label: 'Recorrentes' },
            { id: 'novo', label: 'Novos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterSegment(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterSegment === tab.id
                  ? 'bg-[#F27D26] text-black shadow-md'
                  : 'bg-[#0A0A0A] text-gray-400 hover:text-white hover:bg-white/5 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F27D26]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px] font-mono">
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Segmento</th>
              <th className="py-3 px-4">Endereço Principal</th>
              <th className="py-3 px-4">Pedidos Feitos</th>
              <th className="py-3 px-4">Total Gasto (LTV)</th>
              <th className="py-3 px-4">Ticket Médio</th>
              <th className="py-3 px-4">Último Pedido</th>
              <th className="py-3 px-4 text-right">Contato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {filteredCustomers.map((customer) => {
              const avgTicket = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;

              return (
                <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white text-sm">{customer.name}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{customer.phone}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    {customer.segment === 'vip' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/30">
                        <Star className="w-3 h-3 fill-[#F27D26] text-[#F27D26]" />
                        <span>VIP</span>
                      </span>
                    )}
                    {customer.segment === 'recorrente' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                        Recorrente
                      </span>
                    )}
                    {customer.segment === 'novo' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-400">
                        Novo
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-gray-400">
                    {customer.address
                      ? `${customer.address.street}, ${customer.address.number} - ${customer.address.neighborhood}`
                      : 'Retirada no Balcão'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {customer.totalOrders} {customer.totalOrders === 1 ? 'pedido' : 'pedidos'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-green-400 text-sm">
                    {formatBRL(customer.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-300">
                    {formatBRL(avgTicket)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">
                    {new Date(customer.lastOrderAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={generateWhatsAppMessage(customer)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-950/60 text-green-400 hover:bg-green-900 border border-green-800 font-bold text-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
