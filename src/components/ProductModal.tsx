import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductStatus } from '../types';
import {
  Boxes,
  Plus,
  Edit2,
  X,
  Tag,
  DollarSign,
  Package,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct } = useApp();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cómputo y Servidores');
  const [brand, setBrand] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [unit, setUnit] = useState('Pieza');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<ProductStatus>('active');

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setBrand(productToEdit.brand);
      setPurchasePrice(productToEdit.purchasePrice);
      setSalePrice(productToEdit.salePrice);
      setStock(productToEdit.stock);
      setMinStock(productToEdit.minStock);
      setUnit(productToEdit.unit);
      setImageUrl(productToEdit.imageUrl || '');
      setStatus(productToEdit.status);
    } else {
      setSku(`INF-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setDescription('');
      setCategory('Cómputo y Servidores');
      setBrand('');
      setPurchasePrice(0);
      setSalePrice(0);
      setStock(10);
      setMinStock(5);
      setUnit('Pieza');
      setImageUrl('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80');
      setStatus('active');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productToEdit) {
      updateProduct(productToEdit.id, {
        sku,
        name,
        description,
        category,
        brand,
        purchasePrice,
        salePrice,
        stock,
        minStock,
        unit,
        imageUrl,
        status,
      });
    } else {
      addProduct({
        sku,
        name,
        description,
        category,
        brand,
        purchasePrice,
        salePrice,
        stock,
        minStock,
        unit,
        imageUrl,
        status,
      });
    }
    onClose();
  };

  const margin = purchasePrice > 0 ? (((salePrice - purchasePrice) / purchasePrice) * 100).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            {productToEdit ? 'Editar Producto del Inventario' : 'Registrar Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Código / SKU:</label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value.toUpperCase())}
                placeholder="INF-001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nombre Comercial del Producto:</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Servidor Blade ProLiant DL380"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Descripción Técnica:</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Especificaciones, puertos, compatibilidad..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoría:</label>
              <input
                type="text"
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Cómputo, Redes, Almacenamiento..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Marca / Fabricante:</label>
              <input
                type="text"
                required
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Dell, HP, Cisco, Lenovo..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Pricing & Margins */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Precio de Compra (Costo):</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Precio de Venta (Público):</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={salePrice}
                  onChange={e => setSalePrice(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold text-blue-600"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Margen Bruto Calculado:</span>
              <span className="text-sm font-black text-emerald-600 font-mono mt-0.5">
                +{margin}% de ganancia
              </span>
            </div>
          </div>

          {/* Stock, MinStock, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cantidad Inicial / Stock:</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Stock Mínimo (Alerta):</label>
              <input
                type="number"
                required
                min="1"
                value={minStock}
                onChange={e => setMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Unidad de Medida:</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              >
                <option value="Pieza">Pieza (Pza)</option>
                <option value="Paquete">Paquete (Pq)</option>
                <option value="Caja">Caja (Cja)</option>
                <option value="Metro">Metro (M)</option>
                <option value="Litro">Litro (Lt)</option>
                <option value="Kg">Kilogramo (Kg)</option>
              </select>
            </div>
          </div>

          {/* Image & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">URL de Imagen (Opcional):</label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Estado:</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="discontinued">Descontinuado</option>
              </select>
            </div>
          </div>

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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
            >
              {productToEdit ? 'Guardar Cambios' : 'Registrar en Inventario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
