import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/calculations';
import {
  Settings,
  Store,
  DollarSign,
  Phone,
  RotateCcw,
  Save,
  CheckCircle2,
  ShieldAlert,
  Percent,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllDataToDefault, showToast } = useApp();

  const [shopName, setShopName] = useState(settings.shopName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [cnpj, setCnpj] = useState(settings.cnpj);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(settings.defaultDeliveryFee);
  const [defaultCardFee, setDefaultCardFee] = useState(settings.defaultCardFee);
  const [defaultPackagingCost, setDefaultPackagingCost] = useState(settings.defaultPackagingCost);
  const [defaultOperationalCost, setDefaultOperationalCost] = useState(settings.defaultOperationalCost);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopName,
      address,
      phone,
      cnpj,
      defaultDeliveryFee: Number(defaultDeliveryFee),
      defaultCardFee: Number(defaultCardFee),
      defaultPackagingCost: Number(defaultPackagingCost),
      defaultOperationalCost: Number(defaultOperationalCost),
    });
    showToast('Configurações salvas com sucesso!', 'success');
  };

  const handleReset = () => {
    if (
      confirm(
        'Tem certeza que deseja restaurar os dados de demonstração originais? Isso resetará pedidos, receitas e estoque para o padrão.'
      )
    ) {
      resetAllDataToDefault();
    }
  };

  return (
    <div id="admin-settings-root" className="space-y-8 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
          Configurações da Hamburgueria
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Dados do estabelecimento, taxas padrão e parâmetros globais de custos.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Establishment Info */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Store className="w-5 h-5 text-[#F27D26]" />
            <h2 className="text-base font-bold text-white font-['Outfit']">
              Dados do Estabelecimento
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Nome da Hamburgueria
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                WhatsApp / Telefone de Contato
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">CNPJ / Razão Social</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Endereço Completo
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>
        </div>

        {/* Global Financial Parameters */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Percent className="w-5 h-5 text-[#F27D26]" />
            <h2 className="text-base font-bold text-white font-['Outfit']">
              Taxas Padrão & Parâmetros de Custo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Taxa de Entrega Padrão (R$)
              </label>
              <input
                type="number"
                step="any"
                min={0}
                value={defaultDeliveryFee}
                onChange={(e) => setDefaultDeliveryFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Taxa Cartão Média (%)
              </label>
              <input
                type="number"
                step="any"
                min={0}
                value={defaultCardFee}
                onChange={(e) => setDefaultCardFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Embalagem Média (R$)
              </label>
              <input
                type="number"
                step="any"
                min={0}
                value={defaultPackagingCost}
                onChange={(e) => setDefaultPackagingCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                Rateio Fixo/Op. (R$)
              </label>
              <input
                type="number"
                step="any"
                min={0}
                value={defaultOperationalCost}
                onChange={(e) => setDefaultOperationalCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0A0A] border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#F27D26]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-black text-sm transition-colors shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>

      {/* Demo Reset Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <h3 className="text-base font-bold text-red-300 font-['Outfit']">
            Restaurar Dados de Demonstração
          </h3>
        </div>
        <p className="text-xs text-red-300/80 leading-relaxed max-w-xl">
          Restaura todos os produtos, ingredientes, receitas com fichas técnicas completas, compras e pedidos iniciais com valores realistas para apresentação a clientes.
        </p>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 font-bold text-xs transition-colors border border-red-700/50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restaurar Banco de Dados Demo</span>
        </button>
      </div>
    </div>
  );
};
