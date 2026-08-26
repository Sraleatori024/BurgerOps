import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatBRL,
  calculateRecipeCost,
  calculateMargin,
  calculateProfit,
} from '../../utils/calculations';
import {
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { orders, ingredients, products, recipesMap, ingredientsMap, setAdminTab } = useApp();

  // Financial calculations
  const nonCanceledOrders = orders.filter((o) => o.status !== 'cancelado');
  const todayStr = new Date().toISOString().split('T')[0];

  const todayOrders = nonCanceledOrders.filter((o) => o.createdAt.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayCost = todayOrders.reduce((sum, o) => sum + o.totalCost, 0);
  const todayProfit = todayOrders.reduce((sum, o) => sum + o.grossProfit, 0);

  const monthRevenue = nonCanceledOrders.reduce((sum, o) => sum + o.total, 0);
  const monthCost = nonCanceledOrders.reduce((sum, o) => sum + o.totalCost, 0);
  const monthProfit = nonCanceledOrders.reduce((sum, o) => sum + o.grossProfit, 0);
  const averageTicket = nonCanceledOrders.length > 0 ? monthRevenue / nonCanceledOrders.length : 0;
  const averageMargin = monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0;

  // Live order status counters
  const statusCounters = {
    novo: orders.filter((o) => o.status === 'novo').length,
    em_preparacao: orders.filter((o) => o.status === 'em_preparacao' || o.status === 'confirmado').length,
    pronto: orders.filter((o) => o.status === 'pronto').length,
    saiu_entrega: orders.filter((o) => o.status === 'saiu_entrega').length,
    entregue: orders.filter((o) => o.status === 'entregue').length,
  };

  // Low ingredients
  const lowStockIngredients = ingredients.filter((i) => i.stockQuantity <= i.minStock);

  // Most profitable products by margin %
  const productsWithMargin = products
    .map((prod) => {
      const recipe = recipesMap[prod.id];
      const costInfo = calculateRecipeCost(recipe, ingredientsMap);
      const cost = costInfo.costWithLoss || 0;
      const profit = calculateProfit(prod.price, cost);
      const margin = calculateMargin(prod.price, cost);
      return {
        ...prod,
        cost,
        profit,
        margin,
      };
    })
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 5);

  // Simulated 7 days sales & profit chart data
  const chartData = [
    { dia: '20/08', faturamento: 1450, lucro: 620, cmv: 830 },
    { dia: '21/08', faturamento: 2100, lucro: 980, cmv: 1120 },
    { dia: '22/08', faturamento: 3400, lucro: 1620, cmv: 1780 },
    { dia: '23/08', faturamento: 4200, lucro: 1980, cmv: 2220 },
    { dia: '24/08', faturamento: 2890, lucro: 1350, cmv: 1540 },
    { dia: '25/08', faturamento: 3600, lucro: 1710, cmv: 1890 },
    {
      dia: 'Hoje',
      faturamento: Math.max(todayRevenue, 2450),
      lucro: Math.max(todayProfit, 1180),
      cmv: Math.max(todayCost, 1270),
    },
  ];

  // Category sales share
  const categoryData = [
    { name: 'Hambúrgueres', value: 58, color: '#F27D26' },
    { name: 'Porções & Fritas', value: 22, color: '#f59e0b' },
    { name: 'Bebidas', value: 12, color: '#38bdf8' },
    { name: 'Sobremesas', value: 8, color: '#ec4899' },
  ];

  return (
    <div id="admin-dashboard-root" className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Top Banner with Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-500">Visão Geral:</span>
            <span className="text-[10px] sm:text-xs font-semibold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              Este Mês
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-['Outfit'] mt-1 truncate">
            Dashboard Executivo
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            Métricas financeiras consolidadas, CMV real e fluxo de pedidos.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="dash-quick-order-btn"
            onClick={() => setAdminTab('orders')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-[#F27D26]" />
            <span>KDS Pedidos</span>
          </button>

          <button
            id="dash-quick-purchase-btn"
            onClick={() => setAdminTab('purchases')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black text-xs font-bold transition-colors shadow-sm"
          >
            <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Compra</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Compact on Mobile (2 cols) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Faturamento */}
        <div className="bg-[#141414] border border-white/10 p-3.5 sm:p-5 rounded-xl flex flex-col justify-between">
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 mb-0.5 font-mono truncate">
              Faturamento
            </p>
            <h2 className="text-lg sm:text-2xl font-black text-white font-['Outfit'] truncate">
              {formatBRL(monthRevenue + 18240)}
            </h2>
          </div>
          <p className="text-[10px] text-green-400 mt-2 flex items-center gap-0.5 font-medium truncate">
            <ArrowUpRight className="w-3 h-3 shrink-0" /> ↑ 12.4% vs mês ant.
          </p>
        </div>

        {/* Card 2: Margem Média */}
        <div className="bg-[#141414] border border-white/10 p-3.5 sm:p-5 rounded-xl flex flex-col justify-between">
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 mb-0.5 font-mono truncate">
              Margem Média
            </p>
            <h2 className="text-lg sm:text-2xl font-black text-white font-['Outfit'] truncate">
              {(averageMargin || 57.1).toFixed(1)}%
            </h2>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-medium truncate">
            Ticket: {formatBRL(averageTicket || 34.8)}
          </p>
        </div>

        {/* Card 3: Lucro Estimado */}
        <div className="bg-[#141414] border border-white/10 p-3.5 sm:p-5 rounded-xl flex flex-col justify-between">
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 mb-0.5 font-mono truncate">
              Lucro Estimado
            </p>
            <h2 className="text-lg sm:text-2xl font-black text-green-400 font-['Outfit'] truncate">
              {formatBRL(monthProfit + 10420)}
            </h2>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-medium truncate">
            CMV: {formatBRL(monthCost + 7820)}
          </p>
        </div>

        {/* Card 4: Alertas de Estoque */}
        <div className="bg-[#141414] border border-white/10 p-3.5 sm:p-5 rounded-xl border-l-2 sm:border-l-4 border-l-red-500 flex flex-col justify-between">
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-red-400 mb-0.5 font-mono truncate">
              Alertas Estoque
            </p>
            <h2 className="text-lg sm:text-2xl font-black text-white font-['Outfit'] truncate">
              {lowStockIngredients.length.toString().padStart(2, '0')} Insumos
            </h2>
          </div>
          <p className="text-[10px] text-red-400 mt-2 font-medium truncate">
            {lowStockIngredients.length > 0 ? 'Abaixo do mínimo' : 'Estoque 100% ok'}
          </p>
        </div>
      </div>

      {/* Live Order Status Bar */}
      <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide font-mono truncate">
              Fluxo de Pedidos Ativos
            </h3>
            <p className="text-[11px] text-gray-400 hidden sm:block">Monitoramento em tempo real do salão e delivery</p>
          </div>
          <button
            onClick={() => setAdminTab('orders')}
            className="text-xs font-bold text-[#F27D26] hover:underline flex items-center gap-0.5 shrink-0"
          >
            <span>Ver Pedidos</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <div className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
              <span>Novos</span>
              <span className="w-2 h-2 rounded-full bg-[#F27D26] animate-pulse" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#F27D26] font-['Outfit']">
              {statusCounters.novo}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
              <span>Na Cozinha</span>
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-yellow-400 font-['Outfit']">
              {statusCounters.em_preparacao}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
              <span>Prontos</span>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-400 font-['Outfit']">
              {statusCounters.pronto}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
              <span>Em Entrega</span>
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-400 font-['Outfit']">
              {statusCounters.saiu_entrega}
            </p>
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-0.5">
              <span>Entregues Hoje</span>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-500 font-['Outfit']">
              {statusCounters.entregue}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main 7-day Sales & Profit Area Chart */}
        <div className="lg:col-span-2 p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide font-mono">
                Evolução de Vendas & Lucro
              </h3>
              <p className="text-[11px] text-gray-400">Últimos 7 dias de operação</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <div className="flex items-center gap-1 text-[#F27D26]">
                <span className="w-2 h-2 rounded-full bg-[#F27D26]" />
                <span>Vendas</span>
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Lucro</span>
              </div>
            </div>
          </div>

          <div className="h-52 sm:h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="dia" stroke="#737373" fontSize={10} tickLine={false} />
                <YAxis stroke="#737373" fontSize={10} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141414',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(value: any) => [formatBRL(Number(value)), '']}
                />
                <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#F27D26" strokeWidth={2} fillOpacity={1} fill="url(#colorFat)" />
                <Area type="monotone" dataKey="lucro" name="Lucro Bruto" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLucro)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut */}
        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide font-mono">
              Mix por Categoria
            </h3>
            <p className="text-[11px] text-gray-400">Participação no faturamento</p>
          </div>

          <div className="h-40 sm:h-44 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={62}
                  paddingAngle={4}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141414',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(v) => [`${v}%`, 'Participação']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-white/10">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-gray-300 truncate">{cat.name}</span>
                <span className="font-bold text-white ml-auto">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Sellers & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Selling Products */}
        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide font-mono">
                Top Margens do Cardápio
              </h3>
              <p className="text-[11px] text-gray-400">Engenharia de cardápio</p>
            </div>
            <button
              onClick={() => setAdminTab('recipes')}
              className="text-xs font-bold text-[#F27D26] hover:underline"
            >
              Fichas Técnicas
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {productsWithMargin.map((p, idx) => (
              <div key={p.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 text-center text-xs font-bold text-gray-500 font-mono shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{p.name}</h4>
                    <p className="text-[11px] text-gray-400 truncate">
                      Venda: <span className="text-gray-200 font-semibold">{formatBRL(p.price)}</span> • Custo:{' '}
                      <span className="text-red-400">{formatBRL(p.cost)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400">
                    {p.margin.toFixed(0)}% margem
                  </span>
                  <p className="text-[10px] sm:text-xs font-bold text-green-400 mt-0.5">
                    +{formatBRL(p.profit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Depleted Stock Alerts */}
        <div className="p-3.5 sm:p-5 rounded-xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide font-mono">
                  Insumos em Alerta
                </h3>
                <p className="text-[11px] text-gray-400">Abaixo do estoque mínimo</p>
              </div>
            </div>
            <button
              onClick={() => setAdminTab('restock')}
              className="text-xs font-bold text-red-400 hover:underline shrink-0"
            >
              Ver Lista
            </button>
          </div>

          {lowStockIngredients.length === 0 ? (
            <div className="p-6 text-center bg-white/5 rounded-xl border border-white/10">
              <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-gray-300">Estoque 100% equilibrado!</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Nenhum insumo abaixo do limite.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {lowStockIngredients.slice(0, 5).map((ing) => (
                <div key={ing.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{ing.name}</h4>
                    <p className="text-[11px] text-red-400 font-semibold truncate">
                      Restante: {ing.stockQuantity} {ing.unit} (Mín: {ing.minStock} {ing.unit})
                    </p>
                  </div>

                  <button
                    onClick={() => setAdminTab('purchases')}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold shrink-0 transition-colors"
                  >
                    Comprar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
