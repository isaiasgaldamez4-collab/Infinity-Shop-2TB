export type UserRole = 'admin' | 'employee' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  imageUrl?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export type MovementType =
  | 'entrada'
  | 'salida'
  | 'venta'
  | 'devolucion'
  | 'ajuste'
  | 'correccion';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  userId: string;
  userName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  notes?: string;
  date: string;
  time: string;
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  taxId: string; // RFC, NIT, CIF, RUT
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt: string;
  totalPurchases: number;
  ordersCount: number;
}

export interface InvoiceItem {
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type InvoiceStatus = 'emitida' | 'pagada' | 'cancelada' | 'pendiente';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'credito';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerTaxId: string;
  customerAddress?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // 0.16 by default
  taxAmount: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  sentViaEmail?: boolean;
  emailSentAt?: string;
}

export interface SmtpConfig {
  smtpServer: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  useTls: boolean;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  active: boolean;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  to: string;
  subject: string;
  type: 'invoice' | 'stock_alert' | 'welcome' | 'test';
  status: 'sent' | 'pending' | 'failed';
  message: string;
  invoiceNumber?: string;
}
