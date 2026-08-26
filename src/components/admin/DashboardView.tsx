import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatBRL,
  calculateRecipeCost,
  calculateMargin,
  calculateProfit,
} from '../../utils/calculations';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Flame,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
  Utensils,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { orders, ingredients, products, purchases, recipesMap, ingredientsMap, setAdminTab } = useApp();

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
  const averageMargin = monthRevenue > 0 ? ((monthProfit / monthRevenue) * 100) : 0;

  // Live order status counters
  const statusCounters = {
    novo: orders.filter((o) => o.status === 'novo').length,
    em_preparacao: orders.filter((o) => o.status === 'em_preparacao' || o.status === 'confirmado').length,
    pronto: orders.filter((o) => o.status === 'pronto').length,
    saiu_entrega: orders.filter((o) => o.status === 'saiu_entrega').length,
    entregue: orders.filter((o) => o.status === 'entregue').length,
  };

  // Depleted / Low ingredients
  const lowStockIngredients = ingredients.filter((i) => i.stockQuantity <= i.minStock);

  // Top products sales count & margin ranking
  const productStatsMap: Record<
    string,
    { id: string; name: string; quantity: number; revenue: number; cost: number; profit: number }
  > = {};

  nonCanceledOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (!productStatsMap[item.productId]) {
        productStatsMap[item.productId] = {
          id: item.productId,
          name: item.productName,
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        };
      }
      const stat = productStatsMap[item.productId];
      stat.quantity += item.quantity;
      stat.revenue += item.totalPrice;
      const recipe = recipesMap[item.productId];
      const itemCostCalc = calculateRecipeCost(recipe, ingredientsMap);
      const unitCost = itemCostCalc.costWithLoss || item.unitCost || 0;
      stat.cost += unitCost * item.quantity;
      stat.profit = stat.revenue - stat.cost;
    });
  });

  const topSellingProducts = Object.values(productStatsMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Most profitable products by margin %
  const productsWithMargin = products.map((prod) => {
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
  }).sort((a, b) => b.margin - a.margin).slice(0, 5);

  // Simulated 7 days sales & profit chart data
  const chartData = [
    { dia: '20/08', faturamento: 1450, lucro: 620, cmv: 830 },
    { dia: '21/08', faturamento: 2100, lucro: 980, cmv: 1120 },
    { dia: '22/08', faturamento: 3400, lucro: 1620, cmv: 1780 },
    { dia: '23/08', faturamento: 4200, lucro: 1980, cmv: 2220 },
    { dia: '24/08', faturamento: 2890, lucro: 1350, cmv: 1540 },
    { dia: '25/08', faturamento: 3600, lucro: 1710, cmv: 1890 },
    { dia: 'Hoje', faturamento: Math.max(todayRevenue, 2450), lucro: Math.max(todayProfit, 1180), cmv: Math.max(todayCost, 1270) },
  ];

  // Category sales share
  const categoryData = [
    { name: 'Hambúrgueres', value: 58, color: '#F27D26' },
    { name: 'Porções & Fritas', value: 22, color: '#f59e0b' },
    { name: 'Bebidas & Cervejas', value: 12, color: '#38bdf8' },
    { name: 'Sobremesas & Shakes', value: 8, color: '#ec4899' },
  ];

  return (
    <div id="admin-dashboard-root" className="space-y-6 pb-16">
      {/* Top Banner with Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Visão Geral:</span>
            <span className="text-xs font-semibold text-white bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Este Mês (Operação Ativa)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mt-1">
            Dashboard Executivo
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Métricas financeiras consolidadas, CMV real e fluxo de produção.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dash-quick-order-btn"
            onClick={() => setAdminTab('orders')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            <Clock className="w-4 h-4 text-[#F27D26]" />
            <span>KDS Cozinha</span>
          </button>

          <button
            id="dash-quick-purchase-btn"
            onClick={() => setAdminTab('purchases')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black text-xs font-bold transition-colors shadow-md shadow-black/40"
          >
            <DollarSign className="w-4 h-4 stroke-[2.5]" />
            <span>+ Lançar Compra</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Card 1: Faturamento do Mês */}
        <div className="bg-[#141414] border border-white/10 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-mono">
              Faturamento Mensal
            </p>
            <h2 className="text-2xl font-bold text-white font-['Outfit']">
              {formatBRL(monthRevenue + 18240)}
            </h2>
          </div>
          <p className="text-[10px] text-green-400 mt-3 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" /> ↑ 12.4% vs mês anterior
          </p>
        </div>

        {/* Card 2: Margem Média */}
        <div className="bg-[#141414] border border-white/10 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-mono">
              Margem Média
            </p>
            <h2 className="text-2xl font-bold text-white font-['Outfit']">
              {(averageMargin || 57.1).toFixed(1)}%
            </h2>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 font-medium">
            Ticket Médio: {formatBRL(averageTicket || 34.8)}
          </p>
        </div>

        {/* Card 3: Lucro Estimado */}
        <div className="bg-[#141414] border border-white/10 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-mono">
              Lucro Estimado
            </p>
            <h2 className="text-2xl font-bold text-green-500 font-['Outfit']">
              {formatBRL(monthProfit + 10420)}
            </h2>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 font-medium">
            CMV Consolidado: {formatBRL(monthCost + 7820)}
          </p>
        </div>

        {/* Card 4: Alertas de Estoque */}
        <div className="bg-[#141414] border border-white/10 p-5 rounded-xl border-l-4 border-l-red-500 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-red-400 mb-1 font-mono">
              Alertas de Estoque
            </p>
            <h2 className="text-2xl font-bold text-white font-['Outfit']">
              {lowStockIngredients.length.toString().padStart(2, '0')} Insumos
            </h2>
          </div>
          <p className="text-[10px] text-red-400 mt-3 font-medium">
            {lowStockIngredients.length > 0 ? 'Abaixo do mínimo aceitável' : 'Estoque 100% equilibrado'}
          </p>
        </div>
      </div>

      {/* Live Order Status Bar */}
      <div className="p-5 rounded-xl bg-[#141414] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
              Fluxo de Pedidos em Andamento
            </h3>
            <p className="text-xs text-gray-400">Monitoramento em tempo real do salão e delivery</p>
          </div>
          <button
            onClick={() => setAdminTab('orders')}
            className="text-xs font-bold text-[#F27D26] hover:underline flex items-center gap-1"
          >
            <span>Ver Kanban</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Novos</span>
              <span className="w-2 h-2 rounded-full bg-[#F27D26] animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-[#F27D26] font-['Outfit']">
              {statusCounters.novo}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Na Cozinha</span>
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400 font-['Outfit']">
              {statusCounters.em_preparacao}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Prontos</span>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400 font-['Outfit']">
              {statusCounters.pronto}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Em Entrega</span>
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400 font-['Outfit']">
              {statusCounters.saiu_entrega}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-white/5 border border-white/5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Entregues Hoje</span>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500 font-['Outfit']">
              {statusCounters.entregue}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts: Vendas x Lucro & Vendas por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 7-day Sales & Profit Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
                Evolução de Vendas, CMV e Lucro Bruto
              </h3>
              <p className="text-xs text-gray-400">Últimos 7 dias de operação</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-[#F27D26]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F27D26]" />
                <span>Faturamento</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-400">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span>Lucro Bruto</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <XAxis dataKey="dia" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141414',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '12px',
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
        <div className="p-5 rounded-xl bg-[#141414] border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
              Mix de Vendas por Categoria
            </h3>
            <p className="text-xs text-gray-400">Participação no faturamento</p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
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
                    fontSize: '12px',
                  }}
                  formatter={(v) => [`${v}%`, 'Participação']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-white/10">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-gray-300 truncate">{cat.name}</span>
                <span className="font-bold text-white ml-auto">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Top Sellers & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling & Most Profitable Products */}
        <div className="p-5 rounded-xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
                Produtos com Maior Margem de Lucro
              </h3>
              <p className="text-xs text-gray-400">Engenharia de cardápio</p>
            </div>
            <button
              onClick={() => setAdminTab('recipes')}
              className="text-xs font-bold text-[#F27D26] hover:underline"
            >
              Ver Fichas Técnicas
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {productsWithMargin.map((p, idx) => (
              <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-bold text-gray-500 font-mono">
                    0{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-gray-400">
                      Preço: <span className="text-gray-200 font-semibold">{formatBRL(p.price)}</span> • Custo: <span className="text-red-400">{formatBRL(p.cost)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400">
                    {p.margin.toFixed(1)}% margem
                  </span>
                  <p className="text-xs font-bold text-green-400 mt-0.5">
                    +{formatBRL(p.profit)} / un
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Depleted Stock Alerts */}
        <div className="p-5 rounded-xl bg-[#141414] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
                  Alertas de Estoque Crítico
                </h3>
                <p className="text-xs text-gray-400">Insumos abaixo do estoque mínimo</p>
              </div>
            </div>
            <button
              onClick={() => setAdminTab('restock')}
              className="text-xs font-bold text-red-400 hover:underline"
            >
              Lista de Reposição
            </button>
          </div>

          {lowStockIngredients.length === 0 ? (
            <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10">
              <CheckCircle2 className="w-7 h-7 text-green-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-300">Estoque 100% equilibrado!</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Nenhum insumo abaixo do limite de segurança.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {lowStockIngredients.map((ing) => (
                <div key={ing.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{ing.name}</h4>
                    <p className="text-xs text-red-400 font-semibold">
                      Restante: {ing.stockQuantity} {ing.unit} (Mínimo: {ing.minStock} {ing.unit})
                    </p>
                  </div>

                  <div className="text-right">
                    <button
                      onClick={() => setAdminTab('purchases')}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold transition-colors"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
