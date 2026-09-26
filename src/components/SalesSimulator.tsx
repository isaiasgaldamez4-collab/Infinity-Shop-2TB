import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product, SaleTransaction } from '../types/inventory';
import { sendToN8n } from '../services/n8nService';
import {
  Store,
  ShoppingCart,
  Plus,
  Trash2,
  Receipt,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  Boxes,
  User,
  CreditCard,
  Workflow,
  Send
} from 'lucide-react';

interface CartItem {
  productId: string;
  quantity: number;
}

export const SalesSimulator: React.FC = () => {
  const { products, sales, registerSale } = useInventory();

  const [customerName, setCustomerName] = useState('Cliente Mostrador');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.find(p => p.currentStock > 0)?.id || ''
  );
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [completedSale, setCompletedSale] = useState<SaleTransaction | null>(null);
  const [sendingSaleId, setSendingSaleId] = useState<string | null>(null);
  const [ticketN8nStatus, setTicketN8nStatus] = useState<string | null>(null);

  const handleSendSaleToN8n = async (sale: SaleTransaction) => {
    setSendingSaleId(sale.id);
    setTicketN8nStatus(null);
    const res = await sendToN8n('INVOICE_SALE', sale);
    setTicketN8nStatus(res.message);
    setSendingSaleId(null);
    setTimeout(() => setTicketN8nStatus(null), 4000);
  };

  // Cart calculations
  const cartDetailed = cart.map(item => {
    const prod = products.find(p => p.id === item.productId)!;
    const subtotal = item.quantity * prod.salePrice;
    const cost = item.quantity * prod.purchasePrice;
    const profit = subtotal - cost;

    return {
      ...item,
      product: prod,
      subtotal,
      cost,
      profit,
    };
  });

  const cartSubtotal = cartDetailed.reduce((acc, i) => acc + i.subtotal, 0);
  const cartTax = cartSubtotal * 0.16;
  const cartTotal = cartSubtotal + cartTax;
  const cartCost = cartDetailed.reduce((acc, i) => acc + i.cost, 0);
  const cartProfit = cartSubtotal - cartCost;

  // Add item to cart
  const handleAddToCart = () => {
    if (!selectedProductId || selectedQuantity <= 0) return;

    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const existingIndex = cart.findIndex(i => i.productId === selectedProductId);
    const currentInCart = existingIndex !== -1 ? cart[existingIndex].quantity : 0;
    const totalRequested = currentInCart + selectedQuantity;

    if (totalRequested > prod.currentStock) {
      setFeedback({
        type: 'error',
        message: `No hay suficiente stock para "${prod.name}". Disponible: ${prod.currentStock}, en carrito: ${currentInCart}.`,
      });
      return;
    }

    if (existingIndex !== -1) {
      const updated = [...cart];
      updated[existingIndex].quantity = totalRequested;
      setCart(updated);
    } else {
      setCart([...cart, { productId: selectedProductId, quantity: selectedQuantity }]);
    }

    setFeedback(null);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(i => i.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (newQty > prod.currentStock) {
      setFeedback({
        type: 'error',
        message: `Stock máximo disponible para "${prod.name}" es ${prod.currentStock}.`,
      });
      return;
    }

    setCart(cart.map(i => (i.productId === productId ? { ...i, quantity: newQty } : i)));
    setFeedback(null);
  };

  // Process checkout
  const handleProcessSale = () => {
    if (cart.length === 0) {
      setFeedback({ type: 'error', message: 'El carrito está vacío. Agrega productos para vender.' });
      return;
    }

    const result = registerSale(
      customerName,
      cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
      paymentMethod
    );

    if (result.success && result.sale) {
      setCompletedSale(result.sale);
      setCart([]);
      setFeedback({
        type: 'success',
        message: `¡Venta procesada con éxito! Se descontaron las existencias del inventario y se registraron en el Kardex.`,
      });
    } else {
      setFeedback({ type: 'error', message: result.error || 'Error al procesar la venta.' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-violet-600" />
            Simulador de Salidas y Punto de Venta (POS)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Prueba cómo las ventas descuentan en tiempo real las existencias en almacén y generan registros contables de costo de venta.
          </p>
        </div>
      </div>

      {/* Main Grid: POS terminal & Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product selector & controls */}
        <div className="lg:col-span-2 space-y-5">
          {/* Add product card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-violet-600" />
              Seleccionar Producto para Vender
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Producto Disponible en Almacén:
                </label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.currentStock === 0}>
                      {p.name} — ${p.salePrice.toFixed(2)} (Stock: {p.currentStock} {p.unit}s)
                      {p.currentStock === 0 ? ' [AGOTADO]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Cantidad:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={e => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                  />
                  <button
                    onClick={handleAddToCart}
                    className="px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shrink-0 flex items-center gap-1 transition shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Selected product quick preview */}
            {selectedProductId && (
              (() => {
                const prod = products.find(p => p.id === selectedProductId);
                if (!prod) return null;
                const margin = prod.salePrice > 0 ? ((prod.salePrice - prod.purchasePrice) / prod.salePrice) * 100 : 0;

                return (
                  <div className="p-3 bg-violet-50/50 rounded-lg border border-violet-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-violet-950">{prod.name}</span>
                      <span className="text-violet-600 ml-2">SKU: {prod.sku}</span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-slate-500">Costo Promedio:</span>{' '}
                        <strong className="text-slate-800 font-mono">${prod.purchasePrice.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Precio Venta:</span>{' '}
                        <strong className="text-violet-900 font-mono">${prod.salePrice.toFixed(2)}</strong>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold font-mono text-[11px]">
                        Margen: {margin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Sales History Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-500" />
                Historial de Ventas Simuladas ({sales.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-2.5 px-3">Ticket</th>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Artículos</th>
                    <th className="py-2.5 px-3 text-right">Costo Mercancía</th>
                    <th className="py-2.5 px-3 text-right">Venta Total</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">Utilidad Bruta</th>
                    <th className="py-2.5 px-3 text-center">Ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No hay ventas registradas aún.
                      </td>
                    </tr>
                  ) : (
                    sales.map(sale => (
                      <tr key={sale.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-violet-700">
                          {sale.ticketNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{sale.date}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{sale.customerName}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {sale.items.length} prod ({sale.items.reduce((acc, i) => acc + i.quantity, 0)} u.)
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          ${sale.totalCost.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ${sale.total.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                          +${sale.grossProfit.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSendSaleToN8n(sale)}
                              disabled={sendingSaleId === sale.id}
                              className="p-1 text-orange-600 hover:text-orange-800 transition"
                              title="Enviar comprobante a n8n (Email y Telegram)"
                            >
                              <Workflow className={`w-3.5 h-3.5 ${sendingSaleId === sale.id ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              onClick={() => setCompletedSale(sale)}
                              className="p-1 text-slate-400 hover:text-slate-600 transition"
                              title="Reimprimir ticket"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Cart Summary & Checkout */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-violet-600" />
                  Carrito de Venta
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                  {cart.length} ítems
                </span>
              </div>

              {/* Customer and payment options */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Cliente / Razón Social:
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Ej. Público General"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Forma de Pago:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
                    {(['Efectivo', 'Tarjeta', 'Transferencia'] as const).map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1.5 rounded-md border text-center transition ${
                          paymentMethod === method
                            ? 'bg-violet-600 text-white border-violet-600 font-semibold shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cart items list */}
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    El carrito está vacío. Agrega artículos desde el panel izquierdo.
                  </div>
                ) : (
                  cartDetailed.map(item => (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex-1 pr-2">
                        <div className="font-semibold text-slate-800">{item.product.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.quantity} x ${item.product.salePrice.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          ${item.subtotal.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-200 pt-4 mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal (Neto):</span>
                <span className="font-mono">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IVA (16%):</span>
                <span className="font-mono">${cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Total a Cobrar:</span>
                <span className="font-mono text-base text-violet-700">${cartTotal.toFixed(2)}</span>
              </div>

              {/* Profit simulation for students */}
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/60 mt-3 text-emerald-900 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Costo Mercancía Vendida (COGS):</span>
                  <span className="font-mono">${cartCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 mt-1">
                  <span>Utilidad Bruta Estimada:</span>
                  <span className="font-mono">+${cartProfit.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProcessSale}
                disabled={cart.length === 0}
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-md shadow-violet-600/20"
              >
                Cobrar e Imprimir Ticket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setCompletedSale(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            {/* Receipt Styling */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <h3 className="font-extrabold text-base tracking-tight text-slate-900">
                INFINITYSHOP - 2TB
              </h3>
              <p className="text-[11px] text-slate-500">RFC: IFS-260901-2TB</p>
              <p className="text-[11px] text-slate-500">Av. Comercio Central #204, Col. Centro</p>
              <div className="mt-2 text-xs font-mono font-bold text-slate-700">
                TICKET #{completedSale.ticketNumber}
              </div>
              <div className="text-[10px] text-slate-400">{completedSale.date}</div>
            </div>

            <div className="py-3 text-xs space-y-1 border-b border-dashed border-slate-300">
              <div className="text-slate-600">Cliente: <strong>{completedSale.customerName}</strong></div>
              <div className="text-slate-600">Pago: <strong>{completedSale.paymentMethod}</strong></div>
            </div>

            <div className="py-3 space-y-2 border-b border-dashed border-slate-300 text-xs">
              {completedSale.items.map(item => (
                <div key={item.productId} className="flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">{item.productName}</span>
                    <div className="text-[10px] text-slate-400">
                      {item.quantity} x ${item.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    ${item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="py-3 text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">${completedSale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%):</span>
                <span className="font-mono">${completedSale.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-1">
                <span>TOTAL:</span>
                <span className="font-mono text-violet-700">${completedSale.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[10px] text-slate-400 border-t border-dashed border-slate-300">
              ¡Gracias por su compra!<br />
              Este ticket actualizó automáticamente las existencias y Kardex.
            </div>

            {ticketN8nStatus && (
              <div className="mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{ticketN8nStatus}</span>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => handleSendSaleToN8n(completedSale)}
                disabled={sendingSaleId === completedSale.id}
                className="w-full py-2 px-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold hover:bg-orange-100 transition flex items-center justify-center gap-1.5"
                title="Enviar comprobante a n8n (Email y Telegram)"
              >
                <Workflow className={`w-3.5 h-3.5 ${sendingSaleId === completedSale.id ? 'animate-spin text-orange-600' : 'text-orange-600'}`} />
                <span>{sendingSaleId === completedSale.id ? 'Enviando a n8n...' : 'Enviar Ticket a n8n (Email/Telegram)'}</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => {
                    setCompletedSale(null);
                    setTicketN8nStatus(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-violet-600 text-xs font-semibold text-white hover:bg-violet-700 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
