import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product, MovementType } from '../types/inventory';
import { X, SlidersHorizontal, AlertCircle } from 'lucide-react';

interface ManualMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ManualMovementModal: React.FC<ManualMovementModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { registerManualMovement } = useInventory();

  const [type, setType] = useState<MovementType>('AJUSTE_POSITIVO');
  const [quantity, setQuantity] = useState<number>(1);
  const [concept, setConcept] = useState('Ajuste de conteo físico mensual');
  const [unitCost, setUnitCost] = useState<number>(product?.purchasePrice || 0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }

    const isOutput = type === 'SALIDA' || type === 'AJUSTE_NEGATIVO' || type === 'MERMA';
    if (isOutput && product.currentStock < quantity) {
      setError(`Stock insuficiente. Solo hay ${product.currentStock} ${product.unit}s disponibles para dar de baja.`);
      return;
    }

    const success = registerManualMovement(
      product.id,
      type,
      quantity,
      concept,
      unitCost
    );

    if (success) {
      onClose();
    } else {
      setError('No se pudo procesar el ajuste.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Ajuste de Existencias / Kardex
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-800">{product.name}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              SKU: <span className="font-mono">{product.sku}</span> | Stock Actual:{' '}
              <strong className="text-slate-800">{product.currentStock} {product.unit}s</strong>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tipo de Movimiento:</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as MovementType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium"
            >
              <option value="AJUSTE_POSITIVO">Ajuste Positivo (+ Ingreso / Sobrante de inventario)</option>
              <option value="AJUSTE_NEGATIVO">Ajuste Negativo (- Salida / Faltante de inventario)</option>
              <option value="MERMA">Baja por Merma / Daño / Caducidad (- Salida)</option>
              <option value="ENTRADA">Entrada Extraordinaria (+)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cantidad a Mover:</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Costo Unitario Aplicado ($):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Motivo / Justificación:</label>
            <input
              type="text"
              required
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="Ej. Conteo físico anual / Producto golpeado en pasillo"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

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
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-xs"
            >
              Aplicar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
