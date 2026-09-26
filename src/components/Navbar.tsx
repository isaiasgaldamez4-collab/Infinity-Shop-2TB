import React from 'react';
import {
  Boxes,
  LayoutDashboard,
  ShoppingCart,
  ReceiptText,
  RotateCcw,
  Sparkles,
  BookOpen,
  Plus,
  Store,
  DollarSign,
  Workflow
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'inventory' | 'purchases' | 'kardex' | 'sales' | 'learning' | 'n8n';
  setCurrentTab: (tab: 'dashboard' | 'inventory' | 'purchases' | 'kardex' | 'sales' | 'learning' | 'n8n') => void;
  onOpenNewProduct: () => void;
  onOpenNewPurchase: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewProduct,
  onOpenNewPurchase,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  Infinity<span className="text-blue-600">Shop</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">
                  2TB Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistema Integral de Compras, Almacén y Kardex
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewPurchase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
              title="Registrar nueva orden de compra"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Compra</span>
            </button>
            <button
              onClick={onOpenNewProduct}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              title="Agregar nuevo producto al catálogo"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Producto</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Restablecer los datos a los valores de demostración iniciales?')) {
                  onResetData();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Restablecer datos de prueba"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 -mb-px text-sm font-medium text-slate-600 border-t border-slate-100">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition shrink-0 ${
              currentTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('inventory')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition shrink-0 ${
              currentTab === 'inventory'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventario & Stock</span>
          </button>

          <button
            onClick={() => setCurrentTab('purchases')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition shrink-0 ${
              currentTab === 'purchases'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Compras & Proveedores</span>
          </button>

          <button
            onClick={() => setCurrentTab('kardex')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition shrink-0 ${
              currentTab === 'kardex'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Kardex de Valuación</span>
          </button>

          <button
            onClick={() => setCurrentTab('sales')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition shrink-0 ${
              currentTab === 'sales'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Simulador de Ventas</span>
          </button>

          <button
            onClick={() => setCurrentTab('n8n')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition shrink-0 ${
              currentTab === 'n8n'
                ? 'bg-orange-50 text-orange-700 font-semibold border border-orange-200/60'
                : 'text-orange-600 hover:text-orange-900 hover:bg-orange-50/50'
            }`}
          >
            <Workflow className="w-4 h-4 text-orange-600" />
            <span className="font-semibold">Automatización n8n</span>
            <span className="px-1.5 py-0.2 bg-orange-100 text-orange-800 text-[10px] rounded font-bold">
              Email / Telegram
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('learning')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition shrink-0 ${
              currentTab === 'learning'
                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60'
                : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold">¿Cómo Funciona? (2TB)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
