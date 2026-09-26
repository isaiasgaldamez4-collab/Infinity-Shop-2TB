import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, MovementType } from '../types';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  Sliders,
  Eye,
  Tag,
  DollarSign,
  Package,
  Layers,
  X
} from 'lucide-react';

interface InventoryViewProps {
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenNewProduct,
  onEditProduct,
}) => {
  const { products, deleteProduct, adjustStock, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'normal'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price' | 'sku'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal for quick stock adjustment
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<MovementType>('entrada');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustNotes, setAdjustNotes] = useState<string>('');
  const [adjustFeedback, setAdjustFeedback] = useState<string | null>(null);

  // Viewing modal
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Categories list
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filtered & sorted products
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = product.stock > 0 && product.stock <= product.minStock;
    } else if (stockFilter === 'out') {
      matchesStock = product.stock === 0;
    } else if (stockFilter === 'normal') {
      matchesStock = product.stock > product.minStock;
    }

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortBy === 'sku') comparison = a.sku.localeCompare(b.sku);
    else if (sortBy === 'stock') comparison = a.stock - b.stock;
    else if (sortBy === 'price') comparison = a.salePrice - b.salePrice;

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleExportCSV = () => {
    const headers = 'ID,SKU,Nombre,Categoría,Marca,Precio Compra,Precio Venta,Stock,Stock Mínimo,Unidad,Estado,Fecha Creación\n';
    const rows = filteredProducts.map(p =>
      `"${p.id}","${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}","${p.brand}",${p.purchasePrice},${p.salePrice},${p.stock},${p.minStock},"${p.unit}","${p.status}","${p.createdAt}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_infinity_2tb_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    if (adjustQty <= 0) {
      setAdjustFeedback('La cantidad debe ser mayor a 0.');
      return;
    }

    const success = adjustStock(
      adjustingProduct.id,
      adjustType,
      adjustQty,
      adjustReason || `Ajuste manual de tipo ${adjustType}`,
      adjustNotes
    );

    if (success) {
      setAdjustFeedback(null);
      setAdjustingProduct(null);
      setAdjustQty(1);
      setAdjustReason('');
      setAdjustNotes('');
    } else {
      setAdjustFeedback('No hay suficiente stock disponible para realizar esta salida.');
    }
  };

  const canEdit = currentUser.role !== 'client';

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            Catálogo & Control de Inventario
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administración de productos, precios, márgenes de utilidad y control de existencias en almacén.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          {canEdit && (
            <button
              onClick={onOpenNewProduct}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por SKU, nombre, marca..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            >
              <option value="all">Todas las Categorías ({products.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Stock Condition */}
          <div className="flex items-center gap-1.5 text-xs">
            <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            >
              <option value="all">Todos los Niveles de Stock</option>
              <option value="low">⚠️ Stock Bajo (Poco Inventario)</option>
              <option value="out">🛑 Agotados (Stock 0)</option>
              <option value="normal">✅ Stock Suficiente</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [by, order] = e.target.value.split('-') as [any, any];
                setSortBy(by);
                setSortOrder(order);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            >
              <option value="name-asc">Nombre (A - Z)</option>
              <option value="name-desc">Nombre (Z - A)</option>
              <option value="stock-asc">Menor Stock Primero</option>
              <option value="stock-desc">Mayor Stock Primero</option>
              <option value="price-desc">Mayor Precio Venta</option>
              <option value="price-asc">Menor Precio Venta</option>
              <option value="sku-asc">Código / SKU</option>
            </select>
          </div>
        </div>

        {/* Active counter indicator */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>
            Mostrando <strong>{filteredProducts.length}</strong> de {products.length} productos
          </span>
          {(searchQuery || selectedCategory !== 'all' || stockFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStockFilter('all');
              }}
              className="text-blue-600 hover:underline font-bold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-3">SKU / Marca</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3 text-right">P. Compra</th>
                <th className="py-3 px-3 text-right">P. Venta</th>
                <th className="py-3 px-3 text-center">Nivel de Stock</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron productos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                  const margin = product.purchasePrice > 0
                    ? (((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&auto=format&fit=crop&q=80'}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{product.description}</div>
                          </div>
                        </div>
                      </td>

                      {/* SKU / Brand */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-800">{product.sku}</div>
                        <div className="text-[11px] text-slate-400">{product.brand}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {product.category}
                        </span>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 px-3 text-right font-mono text-slate-500 whitespace-nowrap">
                        ${product.purchasePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Sale Price & Margin */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-black text-slate-900 font-mono">
                          ${product.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          +{margin}% margen
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-sm font-black font-mono ${
                            isOutOfStock
                              ? 'text-rose-600'
                              : isLowStock
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}>
                            {product.stock} <span className="text-[10px] font-normal text-slate-500">{product.unit}s</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Mín: {product.minStock}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          product.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : product.status === 'inactive'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {product.status === 'active' ? 'Activo' : product.status === 'inactive' ? 'Inactivo' : 'Descontinuado'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingProduct(product)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition"
                            title="Ver detalles completos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canEdit && (
                            <>
                              <button
                                onClick={() => setAdjustingProduct(product)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition"
                                title="Ajustar existencias / Movimiento"
                              >
                                <Sliders className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => onEditProduct(product)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition"
                                title="Editar producto"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {currentUser.role === 'admin' && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`¿Eliminar producto "${product.name}"?`)) {
                                      deleteProduct(product.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                                  title="Eliminar producto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK STOCK ADJUSTMENT MODAL */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Ajustar Stock: {adjustingProduct.sku}
              </h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{adjustingProduct.name}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Existencia actual en bodega: <strong className="text-blue-600 font-mono text-sm">{adjustingProduct.stock} {adjustingProduct.unit}s</strong>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Movimiento:</label>
                <select
                  value={adjustType}
                  onChange={e => setAdjustType(e.target.value as MovementType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="entrada">Entrada (Aumentar stock por compra/lote)</option>
                  <option value="salida">Salida (Deducir por merma/uso interno)</option>
                  <option value="devolucion">Devolución (Reingreso de cliente)</option>
                  <option value="ajuste">Ajuste (Fijar cantidad exacta por conteo físico)</option>
                  <option value="correccion">Corrección contable</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {adjustType === 'ajuste' ? 'Nuevo Stock Total Resultante:' : 'Cantidad de Unidades a Operar:'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={e => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo del Movimiento:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Conteo físico de fin de mes, recepción de proveedor..."
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observaciones / Notas (Opcional):</label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales para auditoría..."
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {adjustFeedback && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                  {adjustFeedback}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                >
                  Confirmar y Registrar Kardex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PRODUCT DETAIL MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                SKU: {viewingProduct.sku}
              </span>
              <button
                onClick={() => setViewingProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <img
                src={viewingProduct.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80'}
                alt={viewingProduct.name}
                className="w-full sm:w-40 h-40 object-cover rounded-xl border border-slate-200"
              />
              <div className="space-y-1.5 flex-1">
                <h3 className="font-bold text-base text-slate-900">{viewingProduct.name}</h3>
                <div className="text-xs text-slate-500">{viewingProduct.description}</div>
                <div className="text-xs pt-1">
                  <span className="text-slate-400">Marca: </span>
                  <span className="font-bold text-slate-800">{viewingProduct.brand}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400">Categoría: </span>
                  <span className="font-bold text-slate-800">{viewingProduct.category}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400">Unidad de Medida: </span>
                  <span className="font-bold text-slate-800">{viewingProduct.unit}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">P. Compra</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  ${viewingProduct.purchasePrice.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">P. Venta</span>
                <span className="font-mono font-black text-blue-600 text-sm">
                  ${viewingProduct.salePrice.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Stock Actual</span>
                <span className="font-mono font-black text-emerald-600 text-sm">
                  {viewingProduct.stock} {viewingProduct.unit}s
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Registrado el: {viewingProduct.createdAt}</span>
              <button
                onClick={() => setViewingProduct(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
