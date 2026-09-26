import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { PurchaseOrder, Supplier } from '../types/inventory';
import { sendToN8n } from '../services/n8nService';
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Eye,
  Check,
  Star,
  DollarSign,
  Send,
  Workflow
} from 'lucide-react';

interface PurchasesViewProps {
  onOpenNewPurchase: () => void;
  onOpenNewSupplier: () => void;
  onViewOrderDetails: (order: PurchaseOrder) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  onOpenNewPurchase,
  onOpenNewSupplier,
  onViewOrderDetails,
}) => {
  const {
    purchaseOrders,
    suppliers,
    receivePurchaseOrder,
    cancelPurchaseOrder,
    updatePurchaseOrderStatus
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pendiente' | 'Recibida'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [receivingOrderId, setReceivingOrderId] = useState<string | null>(null);
  const [invoiceFolioInput, setInvoiceFolioInput] = useState('');
  const [sendingOrderId, setSendingOrderId] = useState<string | null>(null);
  const [n8nFeedback, setN8nFeedback] = useState<{ message: string; success: boolean } | null>(null);

  const handleSendOrderToN8n = async (order: PurchaseOrder) => {
    setSendingOrderId(order.id);
    const res = await sendToN8n('INVOICE_PURCHASE', order);
    setN8nFeedback({ message: res.message, success: res.success });
    setSendingOrderId(null);
    setTimeout(() => setN8nFeedback(null), 5000);
  };

  // Orders filtering
  const filteredOrders = purchaseOrders.filter(po => {
    const matchesSearch =
      po.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.invoiceFolio && po.invoiceFolio.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Suppliers filtering
  const filteredSuppliers = suppliers.filter(s =>
    s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.taxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmReceive = (orderId: string) => {
    receivePurchaseOrder(orderId, invoiceFolioInput || undefined);
    setReceivingOrderId(null);
    setInvoiceFolioInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Módulo de Compras y Proveedores
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Control de adquisiciones, emisión de órdenes de compra, cuentas por pagar y directorio comercial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'orders' ? (
            <button
              onClick={onOpenNewPurchase}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Orden de Compra</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewSupplier}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Proveedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub tabs: Órdenes vs Proveedores */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-6 text-sm font-semibold">
          <button
            onClick={() => {
              setActiveTab('orders');
              setSearchQuery('');
            }}
            className={`pb-3 transition relative ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Órdenes de Compra ({purchaseOrders.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('suppliers');
              setSearchQuery('');
            }}
            className={`pb-3 transition relative ${
              activeTab === 'suppliers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Directorio de Proveedores ({suppliers.length})
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* n8n Feedback Banner */}
          {n8nFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                n8nFeedback.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {n8nFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{n8nFeedback.message}</span>
              </div>
              <button
                onClick={() => setN8nFeedback(null)}
                className="text-slate-400 hover:text-slate-600 ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por OC, proveedor o factura..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setStatusFilter('Pendiente')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  statusFilter === 'Pendiente'
                    ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pendientes ({purchaseOrders.filter(p => p.status === 'Pendiente').length})</span>
              </button>
              <button
                onClick={() => setStatusFilter('Recibida')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  statusFilter === 'Recibida'
                    ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Recibidas ({purchaseOrders.filter(p => p.status === 'Recibida').length})</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Folio OC</th>
                    <th className="py-3 px-4">Proveedor</th>
                    <th className="py-3 px-4">Fecha Emisión</th>
                    <th className="py-3 px-4">Artículos / Cant.</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">IVA (16%)</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Estado Almacén</th>
                    <th className="py-3 px-4 text-center">Pago</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No se encontraron órdenes de compra registradas.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const totalUnits = order.items.reduce((acc, i) => acc + i.quantity, 0);

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          {/* Folio */}
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                            {order.orderNumber}
                            {order.invoiceFolio && (
                              <div className="text-[10px] text-slate-400 font-normal">
                                Fac: {order.invoiceFolio}
                              </div>
                            )}
                          </td>

                          {/* Supplier */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 max-w-[200px] truncate">
                              {order.supplierName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {order.supplierTaxId}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                            <div>{order.date}</div>
                            <div className="text-[10px] text-slate-400">
                              Llegada: {order.expectedDate}
                            </div>
                          </td>

                          {/* Items summary */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">
                              {order.items.length} productos ({totalUnits} u.)
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                              {order.items.map(i => i.productName).join(', ')}
                            </div>
                          </td>

                          {/* Subtotal */}
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                            ${order.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Tax */}
                          <td className="py-3.5 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                            ${order.tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Total */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Warehouse Status */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {order.status === 'Recibida' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Recibida
                              </span>
                            ) : order.status === 'Pendiente' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Pendiente
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                                {order.status}
                              </span>
                            )}
                          </td>

                          {/* Payment status */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                order.paymentStatus === 'Pagada'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Receive Button (If pending) */}
                              {order.status === 'Pendiente' && (
                                <button
                                  onClick={() => setReceivingOrderId(order.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition shadow-2xs"
                                  title="Ingresar mercancía físicamente al almacén y actualizar Kardex"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Recibir</span>
                                </button>
                              )}

                              {/* Send to n8n (Email & Telegram) */}
                              <button
                                onClick={() => handleSendOrderToN8n(order)}
                                disabled={sendingOrderId === order.id}
                                className="p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition"
                                title="Enviar factura a n8n (Email y Telegram)"
                              >
                                <Workflow className={`w-4 h-4 ${sendingOrderId === order.id ? 'animate-spin' : ''}`} />
                              </button>

                              {/* View detail */}
                              <button
                                onClick={() => onViewOrderDetails(order)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                                title="Ver desglose completo de la orden"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Cancel (If pending) */}
                              {order.status === 'Pendiente' && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`¿Seguro que deseas cancelar la orden ${order.orderNumber}?`)) {
                                      cancelPurchaseOrder(order.id);
                                    }
                                  }}
                                  className="text-xs text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition"
                                  title="Cancelar orden"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por razón social, RFC o contacto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.map(supplier => (
              <div
                key={supplier.id}
                className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {supplier.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2">
                        {supplier.tradeName}
                      </h3>
                      <p className="text-xs text-slate-500">{supplier.companyName}</p>
                    </div>

                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < supplier.rating ? 'fill-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400 w-16">RFC/Tax ID:</span>
                      <span className="font-mono font-medium text-slate-900">{supplier.taxId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 w-16 shrink-0" />
                      <span>{supplier.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 w-16 shrink-0" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 w-16 shrink-0" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 w-16 shrink-0" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Crédito acordado: <strong className="text-slate-800">{supplier.paymentTerms}</strong>
                  </span>
                  <button
                    onClick={onOpenNewPurchase}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    Crear Orden de Compra →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Prompt for Receiving Order with Invoice Folio */}
      {receivingOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Recepción de Mercancía en Almacén
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Al confirmar, los artículos de la orden se sumarán inmediatamente a las existencias físicas en inventario y se generará el asiento de entrada en el Kardex.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Factura o Folio del Proveedor (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. FAC-A-98432"
                value={invoiceFolioInput}
                onChange={e => setInvoiceFolioInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setReceivingOrderId(null);
                  setInvoiceFolioInput('');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmReceive(receivingOrderId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs"
              >
                Confirmar e Ingresar a Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
