import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MovementType } from '../types';
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Package,
  Layers,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  RotateCcw
} from 'lucide-react';

export const MovementsView: React.FC = () => {
  const { movements } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  const movementTypeConfig: Record<
    MovementType,
    { label: string; bg: string; text: string; sign: string }
  > = {
    entrada: { label: 'Entrada', bg: 'bg-emerald-100', text: 'text-emerald-800', sign: '+' },
    salida: { label: 'Salida', bg: 'bg-rose-100', text: 'text-rose-800', sign: '-' },
    venta: { label: 'Venta', bg: 'bg-blue-100', text: 'text-blue-800', sign: '-' },
    devolucion: { label: 'Devolución', bg: 'bg-purple-100', text: 'text-purple-800', sign: '+' },
    ajuste: { label: 'Ajuste', bg: 'bg-amber-100', text: 'text-amber-800', sign: '±' },
    correccion: { label: 'Corrección', bg: 'bg-indigo-100', text: 'text-indigo-800', sign: '±' },
  };

  const filteredMovements = movements.filter(m => {
    const matchesSearch =
      m.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || m.type === selectedType;
    const matchesDate = !dateFilter || m.date === dateFilter;

    return matchesSearch && matchesType && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Fecha,Hora,SKU,Producto,Tipo,Cantidad,Stock Anterior,Stock Resultante,Usuario,Motivo,Observaciones\n';
    const rows = filteredMovements.map(m =>
      `"${m.id}","${m.date}","${m.time}","${m.productSku}","${m.productName.replace(/"/g, '""')}","${m.type}",${m.quantity},${m.previousStock},${m.newStock},"${m.userName}","${m.reason.replace(/"/g, '""')}","${(m.notes || '').replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kardex_movimientos_infinity_2tb_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
            Movimientos de Inventario (Kardex de Auditoría)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico inmutable de entradas, salidas, ventas, devoluciones y correcciones de stock.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Exportar Kardex CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por producto, SKU, usuario o motivo..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            >
              <option value="all">Todos los Tipos ({movements.length})</option>
              <option value="entrada">Entradas (Compras / Ingresos)</option>
              <option value="salida">Salidas (Mermas / Consumo)</option>
              <option value="venta">Ventas (Facturación)</option>
              <option value="devolucion">Devoluciones de Clientes</option>
              <option value="ajuste">Ajustes de Conteo Físico</option>
              <option value="correccion">Correcciones</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>
            Mostrando <strong>{filteredMovements.length}</strong> movimientos registrados
          </span>
          {(searchQuery || selectedType !== 'all' || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setDateFilter('');
              }}
              className="text-indigo-600 hover:underline font-bold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Producto / SKU</th>
                <th className="py-3 px-3 text-center">Cantidad</th>
                <th className="py-3 px-3 text-center">Stock Antes</th>
                <th className="py-3 px-3 text-center">Stock Después</th>
                <th className="py-3 px-3">Usuario Responsable</th>
                <th className="py-3 px-4">Motivo / Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron movimientos registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredMovements.map(m => {
                  const conf = movementTypeConfig[m.type] || {
                    label: m.type,
                    bg: 'bg-slate-100',
                    text: 'text-slate-800',
                    sign: '',
                  };
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500">
                        <div>{m.date}</div>
                        <div className="text-[10px] text-slate-400">{m.time}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${conf.bg} ${conf.text}`}>
                          {conf.label}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{m.productName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{m.productSku}</div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`font-mono font-bold text-sm ${
                          m.type === 'entrada' || m.type === 'devolucion'
                            ? 'text-emerald-600'
                            : m.type === 'salida' || m.type === 'venta'
                            ? 'text-rose-600'
                            : 'text-indigo-600'
                        }`}>
                          {conf.sign}{m.quantity}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-slate-500">
                        {m.previousStock}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-bold text-slate-900">
                        {m.newStock}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{m.userName}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-[280px]">
                        <div className="font-medium truncate">{m.reason}</div>
                        {m.notes && <div className="text-[10px] text-slate-400 truncate">{m.notes}</div>}
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
  );
};
