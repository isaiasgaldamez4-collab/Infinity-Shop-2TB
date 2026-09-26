import React from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Warehouse,
  Boxes,
  Store,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: 'inventory' | 'purchases' | 'kardex' | 'sales' | 'learning') => void;
  onOpenNewPurchase: () => void;
  onOpenNewProduct: () => void;
  onSelectKardexProduct?: (productId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onOpenNewPurchase,
  onOpenNewProduct,
  onSelectKardexProduct,
}) => {
  const {
    products,
    purchaseOrders,
    kardexMovements,
    sales,
    receivePurchaseOrder
  } = useInventory();

  // Metrics calculations
  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.currentStock * p.purchasePrice,
    0
  );

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock);
  const outOfStockProducts = products.filter(p => p.currentStock === 0);

  const totalPurchasesAmount = purchaseOrders
    .filter(po => po.status === 'Recibida')
    .reduce((acc, po) => acc + po.total, 0);

  const pendingPayableAmount = purchaseOrders
    .filter(po => po.paymentStatus === 'Pendiente' || po.paymentStatus === 'Crédito Vigente')
    .reduce((acc, po) => acc + po.total, 0);

  const totalSalesAmount = sales.reduce((acc, s) => acc + s.total, 0);
  const totalGrossProfit = sales.reduce((acc, s) => acc + s.grossProfit, 0);

  const recentMovements = kardexMovements.slice(0, 6);
  const pendingOrders = purchaseOrders.filter(po => po.status === 'Pendiente');

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Context Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wide uppercase mb-3 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Control de Flujo Empresarial 2TB
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panel de Control: Compras e Inventarios
          </h1>
          <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
            Monitorea el ciclo completo: desde la emisión de órdenes de compra a proveedores,
            la recepción en almacén con costeo promedio, hasta la salida en ventas y valuación en Kardex.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('learning')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-900 font-semibold text-sm hover:bg-blue-50 transition shadow-xs"
            >
              <span>Ver Explicación del Ciclo (2TB)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenNewPurchase}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/30 text-white border border-white/20 font-medium text-sm hover:bg-blue-500/40 transition backdrop-blur-xs"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Crear Orden de Compra</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Valor Inventario */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Valor en Almacén
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ${totalInventoryValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Warehouse className="w-3.5 h-3.5 text-slate-400" />
              <span>{totalStockUnits.toLocaleString()} unidades en {products.length} productos</span>
            </p>
          </div>
        </div>

        {/* Card 2: Stock Crítico */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Alertas de Stock
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              lowStockProducts.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>{lowStockProducts.length}</span>
              <span className="text-xs font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                {outOfStockProducts.length} agotados
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Productos en o por debajo del mínimo de seguridad
            </p>
          </div>
        </div>

        {/* Card 3: Total Compras */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Compras Recibidas
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ${totalPurchasesAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Por pagar: ${pendingPayableAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        {/* Card 4: Ventas y Utilidad */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Ventas / Utilidad Bruta
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ${totalSalesAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Utilidad: ${totalGrossProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Process Flow: El Ciclo de Compras e Inventarios */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Ciclo Operativo del Sistema (Compras, Almacén y Ventas)
            </h2>
            <p className="text-xs text-slate-500">
              Haz clic en cualquiera de las fases para interactuar directamente con su módulo correspondiente
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('learning')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            Ver Guía Teórica →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Paso 1 */}
          <div
            onClick={() => onNavigateTab('purchases')}
            className="group cursor-pointer p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded">
                Paso 1
              </span>
              <ShoppingCart className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
              1. Orden de Compra
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Se cotiza con proveedores autorizados y se genera la Orden de Compra (OC).
            </p>
          </div>

          {/* Paso 2 */}
          <div
            onClick={() => onNavigateTab('purchases')}
            className="group cursor-pointer p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded">
                Paso 2
              </span>
              <Warehouse className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
              2. Recepción en Almacén
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Llega el pedido físico con factura; se verifica y se ingresa el stock al sistema.
            </p>
          </div>

          {/* Paso 3 */}
          <div
            onClick={() => onNavigateTab('kardex')}
            className="group cursor-pointer p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded">
                Paso 3
              </span>
              <FileSpreadsheet className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition">
              3. Valuación en Kardex
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Se calcula el Costo Promedio Ponderado automáticamente con cada nueva entrada.
            </p>
          </div>

          {/* Paso 4 */}
          <div
            onClick={() => onNavigateTab('sales')}
            className="group cursor-pointer p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-violet-50/50 hover:border-violet-300 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-100/60 px-2 py-0.5 rounded">
                Paso 4
              </span>
              <Store className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition">
              4. Salida / Venta al Público
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              El cliente compra productos, se descuenta el stock y se obtiene la utilidad real.
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  {lowStockProducts.length} productos requieren reposición inmediata
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Están por debajo del nivel mínimo establecido. Genera una orden de compra para evitar roturas de stock.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewPurchase}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shadow-xs"
              >
                Crear Orden de Compra
              </button>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-amber-800 border border-amber-300 hover:bg-amber-100/50 transition"
              >
                Ver Productos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two columns: Pending Orders & Recent Kardex Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders Box */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Órdenes de Compra Pendientes de Recepción
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('purchases')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                Ver todas ({purchaseOrders.length})
              </button>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                No hay órdenes pendientes. Todas han sido recibidas en almacén.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map(po => (
                  <div
                    key={po.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {po.orderNumber}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[180px]">
                          {po.supplierName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {po.items.length} artículos • Esperada: {po.expectedDate}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          ${po.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          Pendiente
                        </span>
                      </div>
                      <button
                        onClick={() => receivePurchaseOrder(po.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-2xs"
                        title="Marcar como recibida e ingresar al stock"
                      >
                        Recibir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onOpenNewPurchase}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
            >
              + Nueva Orden de Compra
            </button>
          </div>
        </div>

        {/* Recent Kardex Activity */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Actividad Reciente del Kardex (Movimientos)
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('kardex')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                Ver Kardex Completo
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentMovements.map(m => (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                        m.type === 'ENTRADA' || m.type === 'AJUSTE_POSITIVO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {m.type === 'ENTRADA' ? '+ ENTRADA' : m.type === 'SALIDA' ? '- SALIDA' : m.type}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {m.productName}
                      </div>
                      <div className="text-[11px] text-slate-400">{m.concept}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">
                      {m.type === 'ENTRADA' || m.type === 'AJUSTE_POSITIVO' ? '+' : '-'}
                      {m.quantity} pzas
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Saldo: {m.balanceQuantity} (${m.balanceUnitCost.toFixed(2)})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Método de valuación activo:</span>
            <span className="font-semibold text-slate-700">Promedio Ponderado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
