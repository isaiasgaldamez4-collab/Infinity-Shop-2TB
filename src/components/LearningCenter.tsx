import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  TrendingUp,
  Layers,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Warehouse,
  ShoppingCart,
  FileSpreadsheet,
  DollarSign
} from 'lucide-react';

export const LearningCenter: React.FC = () => {
  // Simulator State: Reorder point
  const [dailyDemand, setDailyDemand] = useState(5);
  const [leadTimeDays, setLeadTimeDays] = useState(4);
  const [safetyStock, setSafetyStock] = useState(8);

  const calculatedReorderPoint = (dailyDemand * leadTimeDays) + safetyStock;

  // Simulator State: Valuation comparison
  const [purchase1Qty, setPurchase1Qty] = useState(10);
  const [purchase1Price, setPurchase1Price] = useState(100);
  const [purchase2Qty, setPurchase2Qty] = useState(10);
  const [purchase2Price, setPurchase2Price] = useState(140);
  const [saleQty, setSaleQty] = useState(12);

  // Weighted Average Math
  const totalPurchasedUnits = purchase1Qty + purchase2Qty;
  const totalPurchasedCost = (purchase1Qty * purchase1Price) + (purchase2Qty * purchase2Price);
  const weightedAverageUnitCost = totalPurchasedUnits > 0 ? totalPurchasedCost / totalPurchasedUnits : 0;
  const cogsWeighted = saleQty * weightedAverageUnitCost;
  const endingInventoryWeighted = (totalPurchasedUnits - saleQty) * weightedAverageUnitCost;

  // PEPS / FIFO Math
  const pepsQtyFromP1 = Math.min(saleQty, purchase1Qty);
  const pepsQtyFromP2 = Math.max(0, saleQty - purchase1Qty);
  const cogsPeps = (pepsQtyFromP1 * purchase1Price) + (pepsQtyFromP2 * purchase2Price);
  const endingInventoryPeps = totalPurchasedCost - cogsPeps;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wide uppercase mb-3 backdrop-blur-xs">
            <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
            Guía Didáctica 2TB (Segundo Técnico de Bachillerato)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ¿Cómo Funciona el Sistema de Compras e Inventarios?
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed max-w-3xl">
            Aprende los fundamentos contables y operativos que rigen a InfinityShop: desde la
            solicitud inicial de mercancías hasta el costeo ponderado y la entrega al cliente final.
          </p>
        </div>
      </div>

      {/* Module 1: El Flujo Completo Paso a Paso */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            1. El Ciclo de Operaciones Comerciales
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            En cualquier negocio o empresa comercial, el flujo de compras e inventarios sigue 5 etapas obligatorias:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Fase 1</span>
              <h3 className="font-bold text-xs text-slate-900 mt-2">Detección de Necesidad</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                El sistema detecta que el stock llegó al Punto de Reorden o hay un producto agotado.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-slate-400">Almacén → Compras</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Fase 2</span>
              <h3 className="font-bold text-xs text-slate-900 mt-2">Cotización y Orden</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Se selecciona el mejor proveedor del catálogo y se emite formalmente la Orden de Compra (OC).
              </p>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-slate-400">Compras → Proveedor</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Fase 3</span>
              <h3 className="font-bold text-xs text-slate-900 mt-2">Recepción en Almacén</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Llega el camión de reparto. Se coteja la mercancía física contra la factura o remisión.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-slate-400">Proveedor → Almacén</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Fase 4</span>
              <h3 className="font-bold text-xs text-slate-900 mt-2">Kardex y Costeo</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Se da entrada al sistema y se recalcula el Costo Promedio Ponderado de cada artículo.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-slate-400">Contabilidad / Almacén</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Fase 5</span>
              <h3 className="font-bold text-xs text-slate-900 mt-2">Venta y Utilidad</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Se vende al cliente, se descuenta el stock y se calcula la Utilidad: Precio Venta - Costo Promedio.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-semibold text-slate-400">Ventas → Finanzas</div>
          </div>
        </div>
      </section>

      {/* Module 2: Simulador Interactivo de Métodos de Valuación (Promedio vs PEPS) */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              2. Laboratorio Interactivo: Promedio Ponderado vs. PEPS (FIFO)
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
              Simulador Contable
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Modifica las compras sucesivas y la cantidad vendida para comparar cómo cambia el Costo de Ventas
            y el Inventario Final según el método de valuación seleccionado.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Compra 1 (Lote Inicial):
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">Unidades:</span>
                <input
                  type="number"
                  min="1"
                  value={purchase1Qty}
                  onChange={e => setPurchase1Qty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                />
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Costo Unitario $:</span>
                <input
                  type="number"
                  min="1"
                  value={purchase1Price}
                  onChange={e => setPurchase1Price(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Compra 2 (Lote con Inflación):
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">Unidades:</span>
                <input
                  type="number"
                  min="1"
                  value={purchase2Qty}
                  onChange={e => setPurchase2Qty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                />
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Costo Unitario $:</span>
                <input
                  type="number"
                  min="1"
                  value={purchase2Price}
                  onChange={e => setPurchase2Price(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Venta Realizada:
            </label>
            <div>
              <span className="text-slate-400 text-[10px]">Unidades Vendidas:</span>
              <input
                type="number"
                min="1"
                max={totalPurchasedUnits}
                value={saleQty}
                onChange={e => setSaleQty(Math.min(totalPurchasedUnits, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Total acumulado en almacén: {totalPurchasedUnits} u.
              </span>
            </div>
          </div>
        </div>

        {/* Side by side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Promedio Ponderado */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <h3 className="font-bold text-sm text-indigo-950">
                Método Promedio Ponderado
              </h3>
              <span className="text-xs bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-mono font-bold">
                C.P. = ${weightedAverageUnitCost.toFixed(2)}
              </span>
            </div>

            <div className="text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span>Costo de lo Vendido (COGS):</span>
                <span className="font-mono font-bold text-slate-900">${cogsWeighted.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Inventario Final en Balance:</span>
                <span className="font-mono font-bold text-indigo-700">${endingInventoryWeighted.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Unidades restantes:</span>
                <span>{totalPurchasedUnits - saleQty} unidades</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-indigo-900/80 border-t border-indigo-100">
              💡 <strong>Ventaja:</strong> Suaviza las fluctuaciones de precios o inflación. Es el método más recomendado por las Normas de Información Financiera (NIF C-4).
            </div>
          </div>

          {/* PEPS */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <h3 className="font-bold text-sm text-emerald-950">
                Método PEPS / FIFO
              </h3>
              <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                1er Lote Primero
              </span>
            </div>

            <div className="text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span>Costo de lo Vendido (COGS):</span>
                <span className="font-mono font-bold text-slate-900">${cogsPeps.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Inventario Final en Balance:</span>
                <span className="font-mono font-bold text-emerald-700">${endingInventoryPeps.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Unidades restantes:</span>
                <span>{totalPurchasedUnits - saleQty} unidades</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-emerald-900/80 border-t border-emerald-100">
              💡 <strong>Efecto con inflación:</strong> Al salir primero los costos más antiguos ($100), el costo de venta es menor y el inventario final queda valuado a precios más recientes ($140).
            </div>
          </div>
        </div>
      </section>

      {/* Module 3: Calculadora de Punto de Reorden y Stock de Seguridad */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            3. El Punto de Reorden (ROP) y Stock de Seguridad
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ¿Cuándo debemos hacer un nuevo pedido al proveedor para no quedarnos sin existencias?
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <div className="text-xs text-slate-700 font-mono bg-white p-3 rounded-lg border border-slate-200">
            <strong>Fórmula Universal:</strong> Punto de Reorden = (Demanda Diaria Promedio × Tiempo de Entrega del Proveedor en Días) + Stock de Seguridad
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Demanda Diaria Promedio (Ventas/día):
              </label>
              <input
                type="number"
                min="1"
                value={dailyDemand}
                onChange={e => setDailyDemand(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tiempo de Entrega (Lead Time en Días):
              </label>
              <input
                type="number"
                min="1"
                value={leadTimeDays}
                onChange={e => setLeadTimeDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Stock de Seguridad (Colchón de Reserva):
              </label>
              <input
                type="number"
                min="0"
                value={safetyStock}
                onChange={e => setSafetyStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Resultado del Cálculo:
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-1">
                Punto de Reorden: {calculatedReorderPoint} unidades
              </div>
              <p className="text-xs text-amber-800/80 mt-1">
                En el momento en que las existencias caigan a <strong>{calculatedReorderPoint} piezas</strong>,
                el sistema de compras debe disparar automáticamente una nueva Orden de Compra.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-amber-200 text-amber-900 rounded-lg text-xs font-bold">
                {dailyDemand * leadTimeDays} consumo en espera + {safetyStock} reserva
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Module 4: Fórmulas Financieras Clave */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          4. Fórmulas Financieras y Ratios de Inventario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-sm text-slate-900">Rotación de Inventarios</h3>
            <p className="text-slate-500">Mide cuántas veces al año el inventario se convierte en ventas.</p>
            <div className="font-mono bg-white p-2 rounded border border-slate-200 font-semibold text-slate-800">
              Rotación = Costo de Ventas / Inventario Promedio
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-sm text-slate-900">Días de Inventario (DSI)</h3>
            <p className="text-slate-500">Días que tarda la mercancía en el almacén antes de ser vendida.</p>
            <div className="font-mono bg-white p-2 rounded border border-slate-200 font-semibold text-slate-800">
              Días = 365 / Rotación de Inventarios
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-sm text-slate-900">Margen de Utilidad Bruta</h3>
            <p className="text-slate-500">Porcentaje de ganancia que queda después de descontar el costo.</p>
            <div className="font-mono bg-white p-2 rounded border border-slate-200 font-semibold text-slate-800">
              Margen % = ((Precio Venta - Costo) / Precio Venta) * 100
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
