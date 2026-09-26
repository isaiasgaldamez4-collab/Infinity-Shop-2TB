import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice, InvoiceItem, InvoiceStatus, PaymentMethod } from '../types';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Trash2,
  DollarSign,
  Download,
  Building,
  User,
  X,
  CreditCard
} from 'lucide-react';

interface InvoicingViewProps {
  onOpenNewInvoiceModal: () => void;
}

export const InvoicingView: React.FC<InvoicingViewProps> = ({
  onOpenNewInvoiceModal,
}) => {
  const { invoices, updateInvoiceStatus, sendInvoiceEmail, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Email sending states
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailModalInvoice, setEmailModalInvoice] = useState<Invoice | null>(null);
  const [emailOverride, setEmailOverride] = useState('');
  const [emailFeedback, setEmailFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerTaxId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEmailModal = (inv: Invoice) => {
    setEmailModalInvoice(inv);
    setEmailOverride(inv.customerEmail);
    setEmailFeedback(null);
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailModalInvoice) return;

    setIsSendingEmail(true);
    setEmailFeedback(null);

    const res = await sendInvoiceEmail(emailModalInvoice.id, emailOverride);
    setIsSendingEmail(false);
    setEmailFeedback(res);

    if (res.success) {
      setTimeout(() => {
        setEmailModalInvoice(null);
      }, 2500);
    }
  };

  const canCreate = currentUser.role !== 'client';

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            Módulo de Facturación Digital
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Emisión de facturas electrónicas, cálculo de IVA, control de pagos y despacho vía correo Gmail SMTP.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={onOpenNewInvoiceModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nueva Factura</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por folio, cliente o RFC..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
          >
            <option value="all">Todos los Estados ({invoices.length})</option>
            <option value="emitida">Emitida</option>
            <option value="pagada">Pagada</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Folio / Número</th>
                <th className="py-3 px-3">Cliente</th>
                <th className="py-3 px-3">Fecha Emisión</th>
                <th className="py-3 px-3">Vencimiento</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">IVA (16%)</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-center">Estado Pago</th>
                <th className="py-3 px-3 text-center">Correo</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No hay facturas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {invoice.invoiceNumber}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{invoice.customerName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{invoice.customerTaxId}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {invoice.date}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {invoice.dueDate}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      ${invoice.subtotal.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      ${invoice.taxAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                      ${invoice.total.toFixed(2)}
                    </td>

                    {/* Status Dropdown/Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {canCreate ? (
                        <select
                          value={invoice.status}
                          onChange={e => updateInvoiceStatus(invoice.id, e.target.value as InvoiceStatus)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-transparent cursor-pointer ${
                            invoice.status === 'pagada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : invoice.status === 'emitida'
                              ? 'bg-blue-100 text-blue-800'
                              : invoice.status === 'cancelada'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <option value="emitida">Emitida</option>
                          <option value="pagada">Pagada</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 capitalize">
                          {invoice.status}
                        </span>
                      )}
                    </td>

                    {/* Email status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {invoice.sentViaEmail ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Enviado
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                          title="Ver e imprimir factura"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEmailModal(invoice)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded transition"
                          title="Enviar por correo electrónico (Gmail SMTP)"
                        >
                          <Mail className="w-4 h-4" />
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

      {/* OFFICIAL PRINTABLE INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => {
                    handleOpenEmailModal(selectedInvoice);
                    setSelectedInvoice(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Enviar por Correo</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Printable Document Body */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-6 text-xs text-slate-800">
              {/* Header: Company & Invoice Data */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="text-xl font-black tracking-tight text-slate-900">
                    Infinity<span className="text-blue-600">-2TB</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Soluciones Tecnológicas & Suministros Empresariales
                  </div>
                  <div className="text-slate-400 text-[10px] mt-1 space-y-0.5">
                    <div>RFC: INF2409262TB</div>
                    <div>Av. Revolución 1250, Col. San Ángel, CDMX, C.P. 01000</div>
                    <div>contacto@infinity2tb.com • +52 55 8000 2000</div>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Factura Electrónica
                  </div>
                  <div className="text-lg font-black font-mono text-blue-600">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Fecha Emisión: <strong className="font-mono text-slate-800">{selectedInvoice.date}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Vencimiento: <strong className="font-mono text-slate-800">{selectedInvoice.dueDate}</strong>
                  </div>
                  <div className="mt-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Facturado a (Cliente):</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoice.customerName}</div>
                  <div className="font-mono text-slate-600 text-[11px]">RFC / Tax ID: {selectedInvoice.customerTaxId}</div>
                  <div className="text-slate-500 text-[11px]">{selectedInvoice.customerAddress || 'Domicilio Fiscal Registrado'}</div>
                  <div className="text-blue-600 text-[11px]">{selectedInvoice.customerEmail}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Condiciones Comerciales:</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    Método de Pago: <strong className="capitalize text-slate-800">{selectedInvoice.paymentMethod}</strong>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Moneda: <strong className="text-slate-800">MXN ($ - Pesos Mexicanos)</strong>
                  </div>
                  {selectedInvoice.notes && (
                    <div className="text-slate-500 text-[11px] mt-1 bg-slate-50 p-2 rounded">
                      <strong>Observaciones:</strong> {selectedInvoice.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Descripción</th>
                      <th className="py-2 px-3 text-center">Cant.</th>
                      <th className="py-2 px-3 text-right">P. Unitario</th>
                      <th className="py-2 px-3 text-right">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{item.productSku}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{item.productName}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA (16%):</span>
                    <span className="font-mono font-semibold">${selectedInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Descuento:</span>
                      <span className="font-mono font-semibold">-${selectedInvoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                    <span>TOTAL:</span>
                    <span className="font-mono text-blue-600">${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Digital Footer */}
              <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
                <div>Documento fiscal generado digitalmente por la plataforma <strong>Infinity-2TB</strong></div>
                <div className="font-mono text-[9px] text-slate-300">
                  SELLO DIGITAL: c4b8f102a9e3d748f22039ab1e6d4c0293fa88d927a4e6bb9230fa187c
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Cerrar Previsualización
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND VIA EMAIL MODAL */}
      {emailModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-600" />
                Enviar Factura por Gmail SMTP
              </h3>
              <button onClick={() => setEmailModalInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">
                  {emailModalInvoice.invoiceNumber} — {emailModalInvoice.customerName}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Importe Total: <strong className="text-slate-900 font-mono">${emailModalInvoice.total.toFixed(2)} MXN</strong>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Correo Electrónico Destinatario:
                </label>
                <input
                  type="email"
                  required
                  value={emailOverride}
                  onChange={e => setEmailOverride(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-[11px] space-y-1">
                <div className="font-bold">Plantilla Automática:</div>
                <p>
                  El cliente recibirá un correo con el desglose formal de artículos, importes con IVA desglosado, y enlace de descarga de su factura <strong>Infinity-2TB</strong>.
                </p>
              </div>

              {emailFeedback && (
                <div className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
                  emailFeedback.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {emailFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{emailFeedback.message}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEmailModalInvoice(null)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Enviando vía SMTP...' : 'Enviar Factura Ahora'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
