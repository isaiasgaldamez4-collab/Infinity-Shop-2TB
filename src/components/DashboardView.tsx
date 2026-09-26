import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Boxes,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  Plus
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenNewProduct: () => void;
  onOpenNewInvoice: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewProduct,
  onOpenNewInvoice,
}) => {
  const { products, movements, customers, invoices, users, currentUser } = useApp();

  // Metrics calculations
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  // Sales calculations
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7); // YYYY-MM

  const todayInvoices = invoices.filter(i => i.date === today && i.status !== 'cancelada');
  const todaySalesTotal = todayInvoices.reduce((sum, i) => sum + i.total, 0);

  const monthInvoices = invoices.filter(i => i.date.startsWith(thisMonth) && i.status !== 'cancelada');
  const monthSalesTotal = monthInvoices.reduce((sum, i) => sum + i.total, 0);

  const totalInvoicesCount = invoices.length;
  const totalCustomersCount = customers.length;
  const totalUsersCount = users.length;

  // Total valuation of current inventory
  const totalInventoryValuation = products.reduce((sum, p) => sum + p.stock * p.purchasePrice, 0);
  const totalSalePotential = products.reduce((sum, p) => sum + p.stock * p.salePrice, 0);

  // Recent Invoices (last 5)
  const recentInvoices = [...invoices].reverse().slice(0, 5);

  // Recent Movements (last 6)
  const recentMovements = [...movements].reverse().slice(0, 6);

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  products.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20 backdrop-blur-xs">
              <Activity className="w-3.5 h-3.5" />
              Panel de Control Empresarial
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bienvenido a Infinity-2TB
            </h1>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Sistema activo en modo <strong>{currentUser.role.toUpperCase()}</strong>.
              Supervisa el inventario físico, movimientos contables, facturas emitidas y clientes registrados en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            {currentUser.role !== 'client' && (
              <>
                <button
                  onClick={onOpenNewProduct}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 flex items-center gap-1.5 backdrop-blur-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Producto</span>
                </button>
                <button
                  onClick={onOpenNewInvoice}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/30 flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Emitir Factura</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (8 Cards Required in Prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* 1. Total Productos */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Productos</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalProducts}</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span>En catálogo activo</span>
            <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition flex items-center">
              Ver <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* 2. Productos con poco inventario */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Poco Inventario</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{lowStockProducts.length}</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span>En nivel de reorden</span>
            <span className="font-semibold text-amber-600 group-hover:translate-x-0.5 transition flex items-center">
              Revisar <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* 3. Productos agotados */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-rose-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Agotados (Stock 0)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">{outOfStockProducts.length}</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Urgente reabastecer</span>
            <span className="font-semibold text-rose-600 group-hover:translate-x-0.5 transition flex items-center">
              Detalle <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* 4. Ventas del día */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ventas del Día</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">${todaySalesTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            {todayInvoices.length} facturas hoy
          </div>
        </div>

        {/* 5. Ventas del mes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ventas del Mes</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-600">${monthSalesTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            {monthInvoices.length} facturas facturadas este mes
          </div>
        </div>

        {/* 6. Facturas emitidas */}
        <div
          onClick={() => onNavigate('invoicing')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Facturas Emitidas</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalInvoicesCount}</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Historial completo</span>
            <span className="font-semibold text-sky-600 group-hover:translate-x-0.5 transition flex items-center">
              Ver <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* 7. Clientes registrados */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-violet-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Clientes</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalCustomersCount}</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Directorio comercial</span>
            <span className="font-semibold text-violet-600 group-hover:translate-x-0.5 transition flex items-center">
              Ver <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* 8. Usuarios del sistema */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Usuarios Sistema</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalUsersCount}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Admin, Empleados y Clientes
          </div>
        </div>
      </div>

      {/* Financial Valuation Strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Valuación Total en Almacén (Costo)
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            ${totalInventoryValuation.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Capital inmovilizado en existencia física</p>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Valor Comercial Proyectado (Venta)
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
            ${totalSalePotential.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Potencial bruto si se liquida el inventario</p>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Margen Bruto Teórico
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            +${(totalSalePotential - totalInventoryValuation).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Rentabilidad estimada ({totalInventoryValuation > 0 ? (((totalSalePotential - totalInventoryValuation) / totalInventoryValuation) * 100).toFixed(1) : 0}%)
          </p>
        </div>
      </div>

      {/* Main Grid: Últimas Ventas / Facturas & Movimientos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Últimas Facturas Emitidas */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Últimas Facturas Emitidas</h2>
            </div>
            <button
              onClick={() => onNavigate('invoicing')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                  <th className="py-2.5 px-4">Folio</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 max-w-[150px] truncate">
                      {inv.customerName}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {inv.date}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      ${inv.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        inv.status === 'pagada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'emitida'
                          ? 'bg-blue-100 text-blue-800'
                          : inv.status === 'cancelada'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Movimientos Recientes de Inventario (Kardex) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Movimientos Recientes del Inventario</h2>
            </div>
            <button
              onClick={() => onNavigate('movements')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Auditoría completa <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentMovements.map(mov => {
              const isPositive = mov.type === 'entrada' || mov.type === 'devolucion';
              return (
                <div key={mov.id} className="p-3.5 hover:bg-slate-50/70 transition flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isPositive ? `+${mov.quantity}` : `-${mov.quantity}`}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800 line-clamp-1">{mov.productName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize font-medium text-slate-600 font-mono text-[10px] px-1 bg-slate-100 rounded">
                          {mov.type}
                        </span>
                        <span>•</span>
                        <span>Por {mov.userName}</span>
                        <span>•</span>
                        <span className="font-mono">{mov.date} {mov.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-slate-900 font-mono font-bold text-xs">
                      {mov.newStock} <span className="text-[10px] font-normal text-slate-500">en stock</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Antes: {mov.previousStock}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stock Alert Summary Callout */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Atención: Hay {lowStockProducts.length} producto(s) en punto de reorden
              </h3>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Los productos listados están en o por debajo de su stock mínimo de seguridad. Recomendado emitir órdenes de compra a proveedores.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lowStockProducts.map(p => (
                  <span key={p.id} className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded">
                    {p.name} ({p.stock} {p.unit}s)
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('inventory')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition shrink-0 shadow-xs"
          >
            Gestionar en Inventario
          </button>
        </div>
      )}
    </div>
  );
};
