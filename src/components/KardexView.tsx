import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product } from '../types/inventory';
import {
  ReceiptText,
  FileSpreadsheet,
  Download,
  Filter,
  SlidersHorizontal,
  Info,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  Warehouse,
  CheckCircle2
} from 'lucide-react';

interface KardexViewProps {
  initialProductId?: string;
  onOpenManualMovement: (product: Product) => void;
}

export const KardexView: React.FC<KardexViewProps> = ({
  initialProductId,
  onOpenManualMovement,
}) => {
  const {
    products,
    kardexMovements,
    valuationMethod,
    setValuationMethod
  } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || (products.length > 0 ? products[0].id : '')
  );

  const [movementFilter, setMovementFilter] = useState<'ALL' | 'ENTRADA' | 'SALIDA' | 'AJUSTE'>('ALL');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Filter movements for this product
  const productMovements = useMemo(() => {
    return kardexMovements
      .filter(m => m.productId === selectedProductId)
      .filter(m => {
        if (movementFilter === 'ENTRADA') return m.type === 'ENTRADA' || m.type === 'AJUSTE_POSITIVO';
        if (movementFilter === 'SALIDA') return m.type === 'SALIDA' || m.type === 'MERMA' || m.type === 'AJUSTE_NEGATIVO';
        if (movementFilter === 'AJUSTE') return m.type.startsWith('AJUSTE') || m.type === 'MERMA';
        return true;
      });
  }, [kardexMovements, selectedProductId, movementFilter]);

  // Aggregate stats
  const totalEntriesQty = productMovements
    .filter(m => m.type === 'ENTRADA' || m.type === 'AJUSTE_POSITIVO')
    .reduce((acc, m) => acc + m.quantity, 0);

  const totalExitsQty = productMovements
    .filter(m => m.type === 'SALIDA' || m.type === 'MERMA' || m.type === 'AJUSTE_NEGATIVO')
    .reduce((acc, m) => acc + m.quantity, 0);

  // Export Kardex CSV
  const handleExportCSV = () => {
    if (!selectedProduct) return;

    const headers = [
      'Fecha',
      'Documento Referencia',
      'Concepto',
      'Tipo',
      'Entrada Cant.',
      'Entrada C.U.',
      'Entrada Total',
      'Salida Cant.',
      'Salida C.U.',
      'Salida Total',
      'Saldo Existencias',
      'Saldo Costo Promedio',
      'Saldo Valor Total',
    ];

    const rows = productMovements.map(m => {
      const isInput = m.type === 'ENTRADA' || m.type === 'AJUSTE_POSITIVO';
      const inQty = isInput ? m.quantity : 0;
      const inCu = isInput ? m.unitCost.toFixed(2) : '0.00';
      const inTotal = isInput ? m.totalCost.toFixed(2) : '0.00';

      const outQty = !isInput ? m.quantity : 0;
      const outCu = !isInput ? m.unitCost.toFixed(2) : '0.00';
      const outTotal = !isInput ? m.totalCost.toFixed(2) : '0.00';

      return [
        `"${m.date}"`,
        `"${m.referenceDoc}"`,
        `"${m.concept.replace(/"/g, '""')}"`,
        `"${m.type}"`,
        inQty,
        inCu,
        inTotal,
        outQty,
        outCu,
        outTotal,
        m.balanceQuantity,
        m.balanceUnitCost.toFixed(2),
        m.balanceTotalCost.toFixed(2),
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        `"KARDEX DE ALMACÉN - INFINITYSHOP 2TB"`,
        `"Producto: ${selectedProduct.name} (SKU: ${selectedProduct.sku})"`,
        `"Método de Valuación: ${valuationMethod === 'PROMEDIO_PONDERADO' ? 'Costo Promedio Ponderado' : 'PEPS'}"`,
        headers.join(','),
        ...rows.map(r => r.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kardex-${selectedProduct.sku}-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-indigo-600" />
            Tarjeta Kardex de Control Físico y Valuado
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro cronológico y analítico de entradas, salidas y saldos con determinación del Costo Promedio Ponderado.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedProduct && (
            <button
              onClick={() => onOpenManualMovement(selectedProduct)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Ajuste de Almacén</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            disabled={!selectedProduct || productMovements.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Descargar Kardex CSV</span>
          </button>
        </div>
      </div>

      {/* Product Selector & Valuation Config Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Select dropdown */}
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Seleccionar Producto para Inspección Contable:
            </label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full max-w-xl px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} — Stock: {p.currentStock} {p.unit}s (Costo Prom: ${p.purchasePrice.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Method selector */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold">Método de Valuación:</span>
            </div>
            <div className="inline-flex rounded-lg p-1 bg-white border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setValuationMethod('PROMEDIO_PONDERADO')}
                className={`px-3 py-1.5 rounded-md transition ${
                  valuationMethod === 'PROMEDIO_PONDERADO'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Promedio Ponderado
              </button>
              <button
                onClick={() => setValuationMethod('PEPS')}
                className={`px-3 py-1.5 rounded-md transition ${
                  valuationMethod === 'PEPS'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Primeras Entradas, Primeras Salidas (FIFO)"
              >
                PEPS / FIFO
              </button>
            </div>
          </div>
        </div>

        {/* Selected Product KPI ribbon */}
        {selectedProduct && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block font-medium">Existencia Actual</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {selectedProduct.currentStock} {selectedProduct.unit}s
              </span>
              <span className="text-[10px] text-slate-500">Mín: {selectedProduct.minStock} | Máx: {selectedProduct.maxStock}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block font-medium">Costo Promedio Unitario</span>
              <span className="text-base font-bold text-indigo-700 mt-0.5 block font-mono">
                ${selectedProduct.purchasePrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">Precio Venta: ${selectedProduct.salePrice.toFixed(2)}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block font-medium">Valor Total Valuado</span>
              <span className="text-base font-bold text-emerald-700 mt-0.5 block font-mono">
                ${(selectedProduct.currentStock * selectedProduct.purchasePrice).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500">Saldo activo en balance</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="text-slate-400 block font-medium">Flujo Histórico</span>
              <span className="text-sm font-semibold text-slate-800 mt-1 block">
                +{totalEntriesQty} ent. / -{totalExitsQty} sal.
              </span>
              <span className="text-[10px] text-slate-500">{productMovements.length} asientos contables</span>
            </div>
          </div>
        )}
      </div>

      {/* Movement Filter Chips */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filtrar:
          </span>
          <button
            onClick={() => setMovementFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              movementFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos ({productMovements.length})
          </button>
          <button
            onClick={() => setMovementFilter('ENTRADA')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              movementFilter === 'ENTRADA'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            <span>Entradas</span>
          </button>
          <button
            onClick={() => setMovementFilter('SALIDA')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              movementFilter === 'SALIDA'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
            <span>Salidas</span>
          </button>
          <button
            onClick={() => setMovementFilter('AJUSTE')}
            className={`px-3 py-1.5 rounded-lg transition ${
              movementFilter === 'AJUSTE'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Ajustes / Mermas
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          Norma de Información Financiera: <strong>Valuación al Costo de Adquisición</strong>
        </div>
      </div>

      {/* Main Kardex Multi-column Accounting Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            {/* Top Tier Header */}
            <thead>
              <tr className="bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider border-b border-slate-700">
                <th colSpan={3} className="py-2.5 px-4 border-r border-slate-700">
                  Datos Generales del Movimiento
                </th>
                <th colSpan={3} className="py-2.5 px-4 text-center bg-emerald-950/70 border-r border-slate-700 text-emerald-200">
                  Entradas (Compras / Ingresos)
                </th>
                <th colSpan={3} className="py-2.5 px-4 text-center bg-rose-950/70 border-r border-slate-700 text-rose-200">
                  Salidas (Ventas / Bajas)
                </th>
                <th colSpan={3} className="py-2.5 px-4 text-center bg-indigo-950/70 text-indigo-200">
                  Saldos en Existencia
                </th>
              </tr>
              {/* Secondary Header */}
              <tr className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                {/* General */}
                <th className="py-2 px-3">Fecha y Hora</th>
                <th className="py-2 px-3">Doc / Folio</th>
                <th className="py-2 px-3 border-r border-slate-200">Concepto Operativo</th>
                {/* Entradas */}
                <th className="py-2 px-2 text-right bg-emerald-50/50">Cant.</th>
                <th className="py-2 px-2 text-right bg-emerald-50/50">C.U.</th>
                <th className="py-2 px-3 text-right bg-emerald-50/50 border-r border-slate-200">Total</th>
                {/* Salidas */}
                <th className="py-2 px-2 text-right bg-rose-50/50">Cant.</th>
                <th className="py-2 px-2 text-right bg-rose-50/50">C.U.</th>
                <th className="py-2 px-3 text-right bg-rose-50/50 border-r border-slate-200">Total</th>
                {/* Saldos */}
                <th className="py-2 px-2 text-right bg-indigo-50/50">Cant.</th>
                <th className="py-2 px-2 text-right bg-indigo-50/50">C.P.U.</th>
                <th className="py-2 px-3 text-right bg-indigo-50/50 font-bold">Importe</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {productMovements.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No hay movimientos registrados para este producto o filtro.
                  </td>
                </tr>
              ) : (
                productMovements.map(mov => {
                  const isInput = mov.type === 'ENTRADA' || mov.type === 'AJUSTE_POSITIVO';

                  return (
                    <tr
                      key={mov.id}
                      className="hover:bg-slate-50/80 transition-colors font-mono"
                    >
                      {/* Fecha */}
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {mov.date}
                      </td>

                      {/* Doc */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-700">
                          {mov.referenceDoc}
                        </span>
                      </td>

                      {/* Concepto */}
                      <td className="py-2.5 px-3 border-r border-slate-200 max-w-[220px] font-sans">
                        <div className="font-semibold text-slate-800 truncate" title={mov.concept}>
                          {mov.concept}
                        </div>
                        <span
                          className={`inline-block text-[9px] font-bold uppercase px-1 py-0.2 rounded font-mono ${
                            isInput ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {mov.type}
                        </span>
                      </td>

                      {/* ENTRADAS */}
                      <td className="py-2.5 px-2 text-right bg-emerald-50/30 text-emerald-800 font-bold">
                        {isInput ? `+${mov.quantity}` : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right bg-emerald-50/30 text-slate-600">
                        {isInput ? `$${mov.unitCost.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right bg-emerald-50/30 border-r border-slate-200 text-emerald-900 font-bold">
                        {isInput ? `$${mov.totalCost.toFixed(2)}` : '-'}
                      </td>

                      {/* SALIDAS */}
                      <td className="py-2.5 px-2 text-right bg-rose-50/30 text-rose-800 font-bold">
                        {!isInput ? `-${mov.quantity}` : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right bg-rose-50/30 text-slate-600">
                        {!isInput ? `$${mov.unitCost.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right bg-rose-50/30 border-r border-slate-200 text-rose-900 font-bold">
                        {!isInput ? `$${mov.totalCost.toFixed(2)}` : '-'}
                      </td>

                      {/* SALDOS */}
                      <td className="py-2.5 px-2 text-right bg-indigo-50/30 font-bold text-slate-900">
                        {mov.balanceQuantity}
                      </td>
                      <td className="py-2.5 px-2 text-right bg-indigo-50/30 text-indigo-700 font-semibold">
                        ${mov.balanceUnitCost.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right bg-indigo-50/30 font-bold text-indigo-950">
                        ${mov.balanceTotalCost.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Explanation Note */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p>
            <strong>Fórmula de Costo Promedio Ponderado:</strong> Cada vez que entra nueva mercancía a un costo distinto,
            el nuevo costo unitario se obtiene sumando el valor del inventario anterior más el costo total de la compra recibida,
            y dividiendo entre la cantidad total de piezas físicas acumuladas: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px] text-slate-800">C.P. = (Saldo Anterior $ + Entrada $) / Existencia Total</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
