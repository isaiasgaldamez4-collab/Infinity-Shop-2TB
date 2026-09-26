export type ProductCategory =
  | 'Tecnología y Electrónica'
  | 'Abarrotes y Alimentos'
  | 'Papelería y Oficina'
  | 'Ferretería e Industrial'
  | 'Hogar y Limpieza'
  | 'Ropa y Accesorios';

export type ProductUnit = 'pza' | 'caja' | 'kg' | 'litro' | 'paquete';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  category: ProductCategory;
  unit: ProductUnit;
  purchasePrice: number; // Costo unitario promedio
  salePrice: number;     // Precio de venta sugerido
  currentStock: number;
  minStock: number;      // Stock de seguridad / alerta
  maxStock: number;      // Capacidad máxima de almacén
  reorderPoint: number;  // Punto en que se debe emitir nueva OC
  location: string;      // Ubicación física (Pasillo / Estante)
  status: 'Activo' | 'Agotado' | 'Descontinuado';
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  tradeName: string;
  taxId: string; // RFC / NIT
  contactName: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  paymentTerms: 'Contado' | '15 Días' | '30 Días' | '60 Días';
  rating: number; // 1-5
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  discountPercent: number;
  subtotal: number;
}

export type PurchaseOrderStatus = 'Borrador' | 'Pendiente' | 'Recibida' | 'Cancelada';
export type PurchasePaymentStatus = 'Pagada' | 'Pendiente' | 'Crédito Vigente';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  supplierTaxId: string;
  date: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number; // 16% IVA
  total: number;
  status: PurchaseOrderStatus;
  paymentStatus: PurchasePaymentStatus;
  invoiceFolio?: string;
  notes?: string;
  receivedDate?: string;
}

export type MovementType =
  | 'ENTRADA'
  | 'SALIDA'
  | 'AJUSTE_POSITIVO'
  | 'AJUSTE_NEGATIVO'
  | 'MERMA';

export interface KardexMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  concept: string;
  referenceDoc: string;
  // Entrada / Salida
  quantity: number;
  unitCost: number;
  totalCost: number;
  // Saldos acumulados post-movimiento
  balanceQuantity: number;
  balanceUnitCost: number;
  balanceTotalCost: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  subtotal: number;
}

export interface SaleTransaction {
  id: string;
  ticketNumber: string;
  date: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalCost: number;
  grossProfit: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia';
}
