import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, showToast } = useApp();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#F27D26] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500/40 bg-[#141414] text-green-100 shadow-green-950/30';
      case 'warning':
        return 'border-[#F27D26]/40 bg-[#141414] text-[#F27D26] shadow-black/30';
      case 'error':
        return 'border-red-500/40 bg-[#141414] text-red-100 shadow-red-950/30';
      default:
        return 'border-blue-500/40 bg-[#141414] text-blue-100 shadow-blue-950/30';
    }
  };

  return (
    <div
      id="app-toast"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-2xl transition-all duration-300 max-w-md ${getBorderColor()}`}
    >
      {getIcon()}
      <p className="text-sm font-medium pr-2 leading-snug">{toast.message}</p>
    </div>
  );
};
