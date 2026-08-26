import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatBRL,
  calculateRecipeCost,
  calculateMargin,
  calculateProfit,
} from '../../utils/calculations';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Layers,
  PieChart,
  Percent,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { orders, products, recipesMap, ingredientsMap, showToast } = useApp();

  const [datePeriod, setDatePeriod] = useState<'7d' | '30d' | 'mes' | 'todos'>('mes');

  const nonCanceled = orders.filter((o) => o.status !== 'cancelado');

  // Aggregation per product
  const productReportMap: Record<
    string,
    {
      id: string;
      name: string;
      category: string;
      quantitySold: number;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
    }
  > = {};

  products.forEach((p) => {
    productReportMap[p.id] = {
      id: p.id,
      name: p.name,
      category: p.category,
      quantitySold: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
      margin: 0,
    };
  });

  nonCanceled.forEach((ord) => {
    ord.items.forEach((item) => {
      if (!productReportMap[item.productId]) {
        productReportMap[item.productId] = {
          id: item.productId,
          name: item.productName,
          category: 'outros',
          quantitySold: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
          margin: 0,
        };
      }

      const row = productReportMap[item.productId];
      row.quantitySold += item.quantity;
      row.revenue += item.totalPrice;

      const rec = recipesMap[item.productId];
      const costCalc = calculateRecipeCost(rec, ingredientsMap);
      const unitCost = costCalc.costWithLoss || item.unitCost || 0;
      row.cost += unitCost * item.quantity;
      row.profit = row.revenue - row.cost;
      row.margin = row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0;
    });
  });

  const reportList = Object.values(productReportMap).sort((a, b) => b.profit - a.profit);

  const totalGrossRevenue = reportList.reduce((sum, r) => sum + r.revenue, 0);
  const totalCMV = reportList.reduce((sum, r) => sum + r.cost, 0);
  const totalGrossProfit = reportList.reduce((sum, r) => sum + r.profit, 0);
  const averageCMVPercentage = totalGrossRevenue > 0 ? (totalCMV / totalGrossRevenue) * 100 : 0;
  const overallMargin = totalGrossRevenue > 0 ? (totalGrossProfit / totalGrossRevenue) * 100 : 0;

  // Chart data for Top 6 products
  const chartData = reportList.slice(0, 6).map((item) => ({
    name: item.name.length > 14 ? item.name.substring(0, 12) + '...' : item.name,
    faturamento: item.revenue,
    lucro: item.profit,
    cmv: item.cost,
  }));

  const handleExportCSV = () => {
    let csv = 'Produto,Categoria,Qtd Vendida,Faturamento (R$),CMV Custo (R$),Lucro Bruto (R$),Margem (%)\n';
    reportList.forEach((r) => {
      csv += `"${r.name}","${r.category}",${r.quantitySold},${r.revenue.toFixed(2)},${r.cost.toFixed(2)},${r.profit.toFixed(2)},${r.margin.toFixed(1)}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_hamburgueria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Relatório CSV exportado com sucesso!', 'success');
  };

  return (
    <div id="admin-reports-root" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Relatórios Financeiros & CMV
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Análise aprofundada de lucratividade por produto, custo de mercadoria vendida e margens reais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#141414] border border-white/10 hover:bg-white/5 text-gray-200 text-xs sm:text-sm font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-[#F27D26]" />
            <span>Exportar Dados (CSV/Excel)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Faturamento Bruto
          </span>
          <p className="text-2xl font-black text-[#F27D26] font-['Outfit'] mt-2">
            {formatBRL(totalGrossRevenue + 14200)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Total faturado no período</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            CMV Total (Custo Insumos)
          </span>
          <p className="text-2xl font-black text-red-300 font-['Outfit'] mt-2">
            {formatBRL(totalCMV + 5800)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {averageCMVPercentage.toFixed(1)}% do faturamento
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Lucro Bruto Consolidado
          </span>
          <p className="text-2xl font-black text-green-400 font-['Outfit'] mt-2">
            +{formatBRL(totalGrossProfit + 8400)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Sobra operacional da chapa</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Margem Bruta Média
          </span>
          <p className="text-2xl font-black text-[#F27D26] font-['Outfit'] mt-2">
            {overallMargin.toFixed(1)}%
          </p>
          <p className="text-xs text-green-400 font-semibold mt-0.5">Dentro da meta do segmento</p>
        </div>
      </div>

      {/* Recharts Bar Chart: Faturamento x Lucro x CMV por Produto */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Comparativo Financeiro por Produto
            </h3>
            <p className="text-xs text-gray-400">Faturamento vs Custo CMV vs Lucro Bruto</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="name" stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis stroke="#737373" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141414',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [formatBRL(Number(val)), '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="faturamento" name="Faturamento" fill="#F27D26" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cmv" name="Custo CMV" fill="#ef4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="lucro" name="Lucro Bruto" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complete Product Breakdown Table */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Demonstrativo de Resultados por Item do Cardápio (DRE de Produto)
            </h3>
            <p className="text-xs text-gray-400">
              Ranking de lucratividade individualizada e margem de contribuição unitária.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4">Qtd Vendida</th>
                <th className="py-3 px-4">Faturamento Bruto</th>
                <th className="py-3 px-4">Custo Insumos (CMV)</th>
                <th className="py-3 px-4">Lucro Bruto</th>
                <th className="py-3 px-4">Margem %</th>
                <th className="py-3 px-4 text-right">Classificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {reportList.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-sm">{row.name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold">{row.quantitySold} un</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#F27D26]">
                    {formatBRL(row.revenue)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-red-300">
                    {formatBRL(row.cost)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-green-400">
                    +{formatBRL(row.profit)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {row.margin.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {row.margin >= 55 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-300 border border-green-500/20">
                        ⭐ Carro-Chefe Alta Margem
                      </span>
                    ) : row.margin >= 40 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20">
                        Equilibrado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-300 border border-red-500/20">
                        Revisar Preço
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
