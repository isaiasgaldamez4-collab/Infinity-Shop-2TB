import React, { useState } from 'react';
import { PurchaseOrder } from '../types/inventory';
import { sendToN8n } from '../services/n8nService';
import { X, ShoppingCart, Printer, CheckCircle2, Clock, Workflow, Send, Check } from 'lucide-react';

interface PurchaseDetailModalProps {
  order: PurchaseOrder | null;
  onClose: () => void;
  onReceiveOrder?: (orderId: string) => void;
}

export const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
  order,
  onClose,
  onReceiveOrder,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [n8nStatus, setN8nStatus] = useState<string | null>(null);

  if (!order) return null;

  const handleSendN8n = async () => {
    setIsSending(true);
    setN8nStatus(null);
    const res = await sendToN8n('INVOICE_PURCHASE', order);
    setN8nStatus(res.message);
    setIsSending(false);
    setTimeout(() => setN8nStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Orden de Compra: {order.orderNumber}
              </h2>
              <p className="text-xs text-slate-500">
                Emitida el {order.date} • Llegada prevista: {order.expectedDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {order.status === 'Recibida' ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Mercancía Recibida en Almacén ({order.receivedDate || order.date})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4 text-amber-600" />
              Pendiente de Recepción Físcia
            </span>
          )}

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Pago: {order.paymentStatus}
          </span>

          {order.invoiceFolio && (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700">
              Factura: {order.invoiceFolio}
            </span>
          )}
        </div>

        {/* Supplier details box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
            Datos del Proveedor
          </span>
          <div className="font-bold text-slate-900 text-sm">{order.supplierName}</div>
          <div className="text-slate-600">RFC / Tax ID: <strong className="font-mono">{order.supplierTaxId}</strong></div>
          {order.notes && (
            <div className="text-slate-500 pt-1 italic">"{order.notes}"</div>
          )}
        </div>

        {/* Line Items Table */}
        <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3">Producto / SKU</th>
                <th className="py-2.5 px-2 text-right">Cantidad</th>
                <th className="py-2.5 px-2 text-right">Costo Unit.</th>
                <th className="py-2.5 px-2 text-right">Desc. %</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{item.productName}</div>
                    <div className="text-[10px] text-blue-600 font-mono">{item.sku}</div>
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                    ${item.unitCost.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-500">
                    {item.discountPercent}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA (16%):</span>
              <span className="font-mono">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL ORDEN:</span>
              <span className="font-mono text-blue-700">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* n8n Status Toast */}
        {n8nStatus && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{n8nStatus}</span>
          </div>
        )}

        {/* Footer buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleSendN8n}
              disabled={isSending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition shadow-2xs"
              title="Enviar factura formateada a n8n (Email y Telegram)"
            >
              <Workflow className={`w-4 h-4 ${isSending ? 'animate-spin text-orange-600' : 'text-orange-600'}`} />
              <span>{isSending ? 'Enviando...' : 'Enviar a n8n'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {order.status === 'Pendiente' && onReceiveOrder && (
              <button
                onClick={() => {
                  onReceiveOrder(order.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-xs"
              >
                Recibir en Almacén
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
