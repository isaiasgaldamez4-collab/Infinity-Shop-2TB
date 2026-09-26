import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product, ProductCategory } from '../types/inventory';
import {
  Boxes,
  Search,
  Plus,
  Filter,
  Download,
  AlertTriangle,
  ReceiptText,
  SlidersHorizontal,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Tag,
  Warehouse
} from 'lucide-react';

interface InventoryViewProps {
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onOpenAdjustment: (product: Product) => void;
  onViewProductKardex: (productId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenNewProduct,
  onEditProduct,
  onOpenAdjustment,
  onViewProductKardex,
}) => {
  const { products, deleteProduct } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'normal' | 'out'>('all');

  const categories: ProductCategory[] = [
    'Tecnología y Electrónica',
    'Abarrotes y Alimentos',
    'Papelería y Oficina',
    'Ferretería e Industrial',
    'Hogar y Limpieza',
    'Ropa y Accesorios',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;

      // Stock filter
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = p.currentStock > 0 && p.currentStock <= p.minStock;
      } else if (stockFilter === 'normal') {
        matchesStock = p.currentStock > p.minStock;
      } else if (stockFilter === 'out') {
        matchesStock = p.currentStock === 0;
      }

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Código de Barras',
      'Nombre',
      'Categoría',
      'Unidad',
      'Stock Actual',
      'Stock Mínimo',
      'Stock Máximo',
      'Punto Reorden',
      'Costo Compra Promedio',
      'Precio Venta',
      'Valor Total Inventario',
      'Ubicación',
      'Estado',
    ];

    const rows = products.map(p => [
      `"${p.sku}"`,
      `"${p.barcode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.unit}"`,
      p.currentStock,
      p.minStock,
      p.maxStock,
      p.reorderPoint,
      p.purchasePrice.toFixed(2),
      p.salePrice.toFixed(2),
      (p.currentStock * p.purchasePrice).toFixed(2),
      `"${p.location}"`,
      `"${p.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario-infinityshop-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            Catálogo de Productos y Almacén
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona existencias, niveles de reorden, márgenes de ganancia y ubicaciones físicas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
            title="Descargar inventario en formato CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onOpenNewProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU, código de barras o descripción..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Stock Level Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 text-xs font-medium">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-md transition ${
                stockFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                stockFilter === 'low'
                  ? 'bg-white text-amber-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Stock Bajo ({products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock).length})</span>
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1.5 rounded-md transition ${
                stockFilter === 'out'
                  ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Agotados ({products.filter(p => p.currentStock === 0).length})
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
          <span className="text-xs text-slate-400 font-medium shrink-0 mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            Categoría:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-xs rounded-full transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white font-medium shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-full transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-medium shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Producto / SKU</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-center">Nivel de Stock</th>
                <th className="py-3 px-4 text-right">Costo Promedio</th>
                <th className="py-3 px-4 text-right">Precio Venta</th>
                <th className="py-3 px-4 text-center">Margen %</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No se encontraron productos con los criterios de búsqueda seleccionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isLow = product.currentStock > 0 && product.currentStock <= product.minStock;
                  const isOut = product.currentStock === 0;
                  const marginPercent = product.salePrice > 0
                    ? ((product.salePrice - product.purchasePrice) / product.salePrice) * 100
                    : 0;
                  const totalValue = product.currentStock * product.purchasePrice;

                  // Percentage of max stock
                  const stockRatio = Math.min(100, Math.round((product.currentStock / product.maxStock) * 100));

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {/* Product Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 max-w-[220px]">
                          {product.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
                            {product.sku}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {product.barcode}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {product.category}
                      </td>

                      {/* Stock Level with Visual Bar */}
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span
                            className={`flex items-center gap-1 ${
                              isOut
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {isOut && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                            <span>{product.currentStock} {product.unit}s</span>
                          </span>
                          <span className="text-[10px] font-normal text-slate-400">
                            Mín: {product.minStock} / Máx: {product.maxStock}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOut
                                ? 'bg-rose-500 w-0'
                                : isLow
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${stockRatio}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 text-right">
                          Reorden: &lt; {product.reorderPoint}
                        </div>
                      </td>

                      {/* Purchase Cost */}
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                        ${product.purchasePrice.toFixed(2)}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        ${product.salePrice.toFixed(2)}
                      </td>

                      {/* Margin % */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                            marginPercent >= 35
                              ? 'bg-emerald-100 text-emerald-800'
                              : marginPercent >= 20
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {marginPercent.toFixed(1)}%
                        </span>
                      </td>

                      {/* Total Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        ${totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Warehouse className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{product.location}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Kardex */}
                          <button
                            onClick={() => onViewProductKardex(product.id)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition"
                            title="Ver Kardex de movimientos de este producto"
                          >
                            <ReceiptText className="w-4 h-4" />
                          </button>

                          {/* Quick Adjustment (Mermas / Conteo Físico) */}
                          <button
                            onClick={() => onOpenAdjustment(product)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition"
                            title="Ajuste manual de inventario (Merma o Sobrante)"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                            title="Editar información del producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar el producto "${product.name}"?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Stock Normal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Stock Bajo / Reorden
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Agotado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
