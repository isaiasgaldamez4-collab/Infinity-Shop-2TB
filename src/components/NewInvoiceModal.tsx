import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InvoiceItem, PaymentMethod, InvoiceStatus } from '../types';
import {
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  CreditCard,
  User,
  Package,
  Calendar
} from 'lucide-react';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customers, products, createInvoice } = useApp();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [status, setStatus] = useState<InvoiceStatus>('emitida');
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Items in invoice
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === customerId);
  const candidateProduct = products.find(p => p.id === selectedProductId);

  const handleAddItem = () => {
    if (!candidateProduct) return;

    if (candidateProduct.stock <= 0) {
      setErrorMsg(`El producto "${candidateProduct.name}" no tiene existencias en almacén.`);
      return;
    }

    if (selectedQuantity > candidateProduct.stock) {
      setErrorMsg(`Solo hay ${candidateProduct.stock} unidades disponibles en inventario.`);
      return;
    }

    // Check if already in items
    const existingIndex = items.findIndex(i => i.productId === candidateProduct.id);
    if (existingIndex >= 0) {
      const currentQty = items[existingIndex].quantity;
      const newTotalQty = currentQty + selectedQuantity;
      if (newTotalQty > candidateProduct.stock) {
        setErrorMsg(`La suma de unidades (${newTotalQty}) supera el stock físico disponible (${candidateProduct.stock}).`);
        return;
      }
      const updated = [...items];
      updated[existingIndex].quantity = newTotalQty;
      updated[existingIndex].subtotal = newTotalQty * candidateProduct.salePrice;
      setItems(updated);
    } else {
      const newItem: InvoiceItem = {
        productId: candidateProduct.id,
        productSku: candidateProduct.sku,
        productName: candidateProduct.name,
        quantity: selectedQuantity,
        unitPrice: candidateProduct.salePrice,
        subtotal: selectedQuantity * candidateProduct.salePrice,
      };
      setItems([...items, newItem]);
    }

    setErrorMsg(null);
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Totals calculations
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const taxRate = 0.16;
  const taxAmount = (subtotal - discount) * taxRate;
  const total = Math.max(0, subtotal - discount + taxAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setErrorMsg('Debes seleccionar un cliente válido.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Debes agregar al menos un producto a la factura.');
      return;
    }

    createInvoice({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email,
      customerTaxId: selectedCustomer.taxId,
      customerAddress: selectedCustomer.address,
      date,
      dueDate,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      status,
      paymentMethod,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Nueva Factura Electrónica — Infinity-2TB
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cliente:</label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.taxId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha Emisión:</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha Vencimiento:</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Payment method and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Forma de Pago:</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs capitalize"
              >
                <option value="transferencia">Transferencia Electrónica</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta de Débito / Crédito</option>
                <option value="credito">Crédito Comercial (15 a 30 días)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Estado Inicial:</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as InvoiceStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs capitalize font-semibold"
              >
                <option value="emitida">Emitida (Por cobrar)</option>
                <option value="pagada">Pagada (Cobro inmediato)</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          {/* Add Item Row */}
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
              Agregar Producto a la Factura:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8">
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock === 0}>
                      {p.sku} — {p.name} (${p.salePrice.toFixed(2)}) — {p.stock === 0 ? 'AGOTADO' : `Stock: ${p.stock}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  max={candidateProduct?.stock || 99}
                  value={selectedQuantity}
                  onChange={e => setSelectedQuantity(Number(e.target.value))}
                  placeholder="Cant."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-center"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Items Table in Modal */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                  <th className="py-2 px-3">Producto</th>
                  <th className="py-2 px-3 text-center">Cant.</th>
                  <th className="py-2 px-3 text-right">P. Unitario</th>
                  <th className="py-2 px-3 text-right">Subtotal</th>
                  <th className="py-2 px-3 text-center">Quitar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Agrega productos para calcular los importes de la factura.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{item.productSku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ${item.subtotal.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Notas u Observaciones:</label>
              <textarea
                rows={3}
                placeholder="Condiciones de entrega, número de orden de compra del cliente..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA (16%):</span>
                <span className="font-mono font-semibold">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pt-1">
                <span>Descuento ($):</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="w-24 px-2 py-0.5 bg-white border border-slate-300 rounded text-right font-mono text-xs"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={items.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-xs"
            >
              Generar y Emitir Factura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
