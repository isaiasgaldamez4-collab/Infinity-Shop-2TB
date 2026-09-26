import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { PurchaseOrderItem } from '../types/inventory';
import { X, ShoppingCart, Plus, Trash2, AlertCircle } from 'lucide-react';

interface NewPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPurchaseModal: React.FC<NewPurchaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { suppliers, products, createPurchaseOrder, receivePurchaseOrder } = useInventory();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentStatus, setPaymentStatus] = useState<'Pagada' | 'Pendiente' | 'Crédito Vigente'>('Pendiente');
  const [notes, setNotes] = useState('');
  const [receiveImmediately, setReceiveImmediately] = useState(false);
  const [invoiceFolio, setInvoiceFolio] = useState('');

  // Items in the purchase order
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      sku: products[0]?.sku || '',
      quantity: 10,
      unitCost: products[0]?.purchasePrice || 100,
      discountPercent: 0,
      subtotal: (products[0]?.purchasePrice || 100) * 10,
    },
  ]);

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        sku: defaultProd.sku,
        quantity: 5,
        unitCost: defaultProd.purchasePrice,
        discountPercent: 0,
        subtotal: defaultProd.purchasePrice * 5,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const prod = products.find(p => p.id === newProductId);
    if (!prod) return;

    const updated = [...items];
    const item = updated[index];
    item.productId = prod.id;
    item.productName = prod.name;
    item.sku = prod.sku;
    item.unitCost = prod.purchasePrice;
    item.subtotal = item.quantity * prod.purchasePrice * (1 - item.discountPercent / 100);
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    const item = updated[index];
    item.quantity = Math.max(1, qty);
    item.subtotal = item.quantity * item.unitCost * (1 - item.discountPercent / 100);
    setItems(updated);
  };

  const handleUnitCostChange = (index: number, cost: number) => {
    const updated = [...items];
    const item = updated[index];
    item.unitCost = Math.max(0, cost);
    item.subtotal = item.quantity * item.unitCost * (1 - item.discountPercent / 100);
    setItems(updated);
  };

  const handleDiscountChange = (index: number, disc: number) => {
    const updated = [...items];
    const item = updated[index];
    item.discountPercent = Math.min(100, Math.max(0, disc));
    item.subtotal = item.quantity * item.unitCost * (1 - item.discountPercent / 100);
    setItems(updated);
  };

  // Totals
  const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);
  const tax = subtotal * 0.16; // 16% IVA
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    if (!selectedSupplier) {
      setError('Debes seleccionar un proveedor.');
      return;
    }

    if (items.length === 0) {
      setError('Debes agregar al menos un producto a la orden de compra.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const newPO = createPurchaseOrder({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.companyName,
      supplierTaxId: selectedSupplier.taxId,
      date: today,
      expectedDate,
      items,
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      status: receiveImmediately ? 'Recibida' : 'Pendiente',
      paymentStatus,
      invoiceFolio: invoiceFolio || undefined,
      notes: notes || undefined,
      receivedDate: receiveImmediately ? today : undefined,
    });

    if (receiveImmediately) {
      receivePurchaseOrder(newPO.id, invoiceFolio);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Nueva Orden de Compra (OC)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Supplier and Date info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proveedor:</label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.tradeName} ({s.taxId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Estimada de Llegada:</label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={e => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Condición de Pago:</label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              >
                <option value="Pendiente">Pendiente de Pago</option>
                <option value="Crédito Vigente">Crédito Vigente (A Plazo)</option>
                <option value="Pagada">Pagada (Contado)</option>
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Productos a Ordenar:
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Producto</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <th className="py-2 px-3">Producto</th>
                    <th className="py-2 px-2 text-right">Cant.</th>
                    <th className="py-2 px-2 text-right">Costo Unit. ($)</th>
                    <th className="py-2 px-2 text-right">Desc. %</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                    <th className="py-2 px-2 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <select
                          value={item.productId}
                          onChange={e => handleProductChange(idx, e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-2 text-right w-20">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1 text-right border border-slate-200 rounded text-xs font-semibold"
                        />
                      </td>
                      <td className="py-2 px-2 text-right w-28">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitCost}
                          onChange={e => handleUnitCostChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-right border border-slate-200 rounded text-xs font-mono font-medium"
                        />
                      </td>
                      <td className="py-2 px-2 text-right w-20">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={e => handleDiscountChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-right border border-slate-200 rounded text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                        ${item.subtotal.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subtotal & Taxes calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-3 border-t border-slate-100">
            <div className="space-y-3 max-w-sm w-full">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas de Compra / Observaciones:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Instrucciones para recepción o entrega en almacén..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Immediate Reception option */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/60 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-blue-950">
                  <input
                    type="checkbox"
                    checked={receiveImmediately}
                    onChange={e => setReceiveImmediately(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Recibir en almacén inmediatamente</span>
                </label>
                {receiveImmediately && (
                  <div>
                    <label className="block text-[11px] text-blue-800 font-medium mb-1">
                      Folio de Factura del Proveedor:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. F-98214"
                      value={invoiceFolio}
                      onChange={e => setInvoiceFolio(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs bg-white border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Calculations Box */}
            <div className="w-full sm:w-64 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA (16%):</span>
                <span className="font-mono">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>TOTAL:</span>
                <span className="font-mono text-blue-700">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs"
            >
              {receiveImmediately ? 'Emitir y Recibir en Almacén' : 'Crear Orden de Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
