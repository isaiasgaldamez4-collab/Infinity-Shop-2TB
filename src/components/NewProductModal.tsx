import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product, ProductCategory, ProductUnit } from '../types/inventory';
import { X, Boxes, AlertCircle } from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, products } = useInventory();

  const categories: ProductCategory[] = [
    'Tecnología y Electrónica',
    'Abarrotes y Alimentos',
    'Papelería y Oficina',
    'Ferretería e Industrial',
    'Hogar y Limpieza',
    'Ropa y Accesorios',
  ];

  const units: ProductUnit[] = ['pza', 'caja', 'kg', 'litro', 'paquete'];

  const [sku, setSku] = useState(productToEdit?.sku || `INF-PRD-${String(products.length + 1).padStart(3, '0')}`);
  const [barcode, setBarcode] = useState(productToEdit?.barcode || `7501${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [name, setName] = useState(productToEdit?.name || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [category, setCategory] = useState<ProductCategory>(productToEdit?.category || 'Tecnología y Electrónica');
  const [unit, setUnit] = useState<ProductUnit>(productToEdit?.unit || 'pza');
  const [purchasePrice, setPurchasePrice] = useState(productToEdit?.purchasePrice.toString() || '100.00');
  const [salePrice, setSalePrice] = useState(productToEdit?.salePrice.toString() || '160.00');
  const [currentStock, setCurrentStock] = useState(productToEdit?.currentStock.toString() || '20');
  const [minStock, setMinStock] = useState(productToEdit?.minStock.toString() || '5');
  const [maxStock, setMaxStock] = useState(productToEdit?.maxStock.toString() || '50');
  const [reorderPoint, setReorderPoint] = useState(productToEdit?.reorderPoint.toString() || '10');
  const [location, setLocation] = useState(productToEdit?.location || 'Almacén Central - Pasillo A');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }

    const pCost = parseFloat(purchasePrice) || 0;
    const sPrice = parseFloat(salePrice) || 0;
    const stock = parseInt(currentStock) || 0;
    const min = parseInt(minStock) || 1;
    const max = parseInt(maxStock) || 50;
    const reorder = parseInt(reorderPoint) || min;

    if (pCost < 0 || sPrice < 0) {
      setError('Los precios y costos deben ser valores positivos.');
      return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        sku,
        barcode,
        name,
        description,
        category,
        unit,
        purchasePrice: pCost,
        salePrice: sPrice,
        currentStock: stock,
        minStock: min,
        maxStock: max,
        reorderPoint: reorder,
        location,
        status: stock === 0 ? 'Agotado' : 'Activo',
      });
    } else {
      addProduct({
        sku,
        barcode,
        name,
        description,
        category,
        unit,
        purchasePrice: pCost,
        salePrice: sPrice,
        currentStock: stock,
        minStock: min,
        maxStock: max,
        reorderPoint: reorder,
        location,
        status: stock === 0 ? 'Agotado' : 'Activo',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {productToEdit ? 'Editar Producto' : 'Registrar Nuevo Producto'}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre del Producto:</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Teclado Mecánico RGB"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoría:</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Código SKU:</label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Código de Barras:</label>
              <input
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unidad de Medida:</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as ProductUnit)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {units.map(u => (
                  <option key={u} value={u}>{u.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ubicación Física en Almacén:</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ej. Pasillo B, Anaquel 4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Costo Unitario de Compra ($):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Precio de Venta al Público ($):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stock Físico Actual:</label>
              <input
                type="number"
                min="0"
                required
                value={currentStock}
                onChange={e => setCurrentStock(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stock Mínimo (Alerta):</label>
              <input
                type="number"
                min="1"
                required
                value={minStock}
                onChange={e => setMinStock(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Punto de Reorden:</label>
              <input
                type="number"
                min="1"
                required
                value={reorderPoint}
                onChange={e => setReorderPoint(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Capacidad Máxima de Almacén:</label>
              <input
                type="number"
                min="1"
                required
                value={maxStock}
                onChange={e => setMaxStock(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Descripción / Especificaciones:</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles sobre presentación, empaque, características técnicas..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs"
            >
              {productToEdit ? 'Guardar Cambios' : 'Registrar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
