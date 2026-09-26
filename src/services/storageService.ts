import {
  User,
  Product,
  InventoryMovement,
  Customer,
  Invoice,
  SmtpConfig,
  EmailLog,
  MovementType
} from '../types';

const USERS_KEY = 'inf2tb_users';
const CURRENT_USER_KEY = 'inf2tb_current_user';
const PRODUCTS_KEY = 'inf2tb_products';
const MOVEMENTS_KEY = 'inf2tb_movements';
const CUSTOMERS_KEY = 'inf2tb_customers';
const INVOICES_KEY = 'inf2tb_invoices';
const SMTP_KEY = 'inf2tb_smtp_config';
const EMAIL_LOGS_KEY = 'inf2tb_email_logs';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Carlos Mendoza (Administrador)',
    email: 'admin@infinity2tb.com',
    role: 'admin',
    phone: '+52 55 1234 5678',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15',
    lastLogin: '2026-09-26 14:00',
  },
  {
    id: 'usr-2',
    name: 'Valeria Soto (Empleado/Ventas)',
    email: 'empleado@infinity2tb.com',
    role: 'employee',
    phone: '+52 55 8765 4321',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-02-10',
    lastLogin: '2026-09-26 13:45',
  },
  {
    id: 'usr-3',
    name: 'Alejandro Morales (Cliente)',
    email: 'cliente@infinity2tb.com',
    role: 'client',
    phone: '+52 55 9988 7766',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01',
    lastLogin: '2026-09-25 18:20',
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'INF-LAP-001',
    name: 'Laptop Profesional Dell Inspiron 15',
    description: 'Intel Core i7 13va Gen, 16GB RAM DDR5, 1TB SSD NVMe, Pantalla FHD IPS 15.6"',
    category: 'Cómputo y Servidores',
    brand: 'Dell',
    purchasePrice: 11500.0,
    salePrice: 16499.0,
    stock: 14,
    minStock: 5,
    unit: 'Pieza',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-10',
    updatedAt: '2026-09-20',
  },
  {
    id: 'prod-2',
    sku: 'INF-MON-002',
    name: 'Monitor Curvo UltraWide 34" 165Hz',
    description: 'Resolución WQHD 3440x1440, HDR400, 1ms, DisplayPort 1.4, HDMI 2.1, Altavoces',
    category: 'Pantallas y Monitores',
    brand: 'Samsung',
    purchasePrice: 6200.0,
    salePrice: 9199.0,
    stock: 4,
    minStock: 6,
    unit: 'Pieza',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-12',
    updatedAt: '2026-09-22',
  },
  {
    id: 'prod-3',
    sku: 'INF-SSD-003',
    name: 'Disco de Estado Sólido NVMe 2TB PCIe 4.0',
    description: 'Velocidad de lectura 7400 MB/s, escritura 6800 MB/s, disipador de grafeno',
    category: 'Almacenamiento',
    brand: 'Kingston',
    purchasePrice: 1400.0,
    salePrice: 2250.0,
    stock: 35,
    minStock: 10,
    unit: 'Pieza',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-15',
    updatedAt: '2026-09-25',
  },
  {
    id: 'prod-4',
    sku: 'INF-ROU-004',
    name: 'Router Empresarial Wi-Fi 6 Mesh Gigabit',
    description: 'Doble banda AX3000, 4 puertos Gigabit WAN/LAN, VPN integrada, firewall SPI',
    category: 'Redes y Telecomunicaciones',
    brand: 'TP-Link',
    purchasePrice: 950.0,
    salePrice: 1599.0,
    stock: 8,
    minStock: 8,
    unit: 'Pieza',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-18',
    updatedAt: '2026-09-24',
  },
  {
    id: 'prod-5',
    sku: 'INF-IMP-005',
    name: 'Impresora Multifuncional Térmica POS 80mm',
    description: 'Corte automático de papel, interfaz USB + LAN + Serial, para tickets y facturas',
    category: 'Puntos de Venta (POS)',
    brand: 'Epson',
    purchasePrice: 1850.0,
    salePrice: 2890.0,
    stock: 0,
    minStock: 4,
    unit: 'Pieza',
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-01',
    updatedAt: '2026-09-26',
  },
  {
    id: 'prod-6',
    sku: 'INF-RAM-006',
    name: 'Memoria RAM DDR5 32GB (2x16GB) 6000MHz',
    description: 'Kit dual channel con perfil XMP 3.0 y EXPO, disipador de aluminio negro',
    category: 'Componentes',
    brand: 'Corsair',
    purchasePrice: 1600.0,
    salePrice: 2450.0,
    stock: 18,
    minStock: 6,
    unit: 'Paquete',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-05',
    updatedAt: '2026-09-23',
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Alejandro Morales',
    company: 'Soluciones Digitales 2TB S.A. de C.V.',
    taxId: 'SDT240115K89',
    email: 'cliente@infinity2tb.com',
    phone: '+52 55 9988 7766',
    address: 'Av. Insurgentes Sur 1602, Piso 4',
    city: 'Ciudad de México',
    country: 'México',
    status: 'active',
    createdAt: '2026-01-20',
    totalPurchases: 45890.0,
    ordersCount: 4,
  },
  {
    id: 'cust-2',
    name: 'Mariana Gómez',
    company: 'Grupo Industrial del Norte',
    taxId: 'GIN190822M12',
    email: 'compras@industrialnorte.com.mx',
    phone: '+52 81 2233 4455',
    address: 'Parque Tecnológico Apodaca Edif. 3',
    city: 'Monterrey, N.L.',
    country: 'México',
    status: 'active',
    createdAt: '2026-02-05',
    totalPurchases: 28450.0,
    ordersCount: 2,
  },
  {
    id: 'cust-3',
    name: 'Roberto Villanueva',
    company: 'Consultoría Tecnológica Gamma',
    taxId: 'CTG210405B44',
    email: 'contacto@gammaconsultores.com',
    phone: '+52 33 4455 6677',
    address: 'Calzada Lázaro Cárdenas 2850',
    city: 'Guadalajara, Jal.',
    country: 'México',
    status: 'active',
    createdAt: '2026-02-18',
    totalPurchases: 12890.0,
    ordersCount: 1,
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'FAC-2026-0001',
    customerId: 'cust-1',
    customerName: 'Alejandro Morales (Soluciones Digitales 2TB)',
    customerEmail: 'cliente@infinity2tb.com',
    customerTaxId: 'SDT240115K89',
    customerAddress: 'Av. Insurgentes Sur 1602, Piso 4, CDMX',
    date: '2026-09-24',
    dueDate: '2026-10-09',
    items: [
      {
        productId: 'prod-1',
        productSku: 'INF-LAP-001',
        productName: 'Laptop Profesional Dell Inspiron 15',
        quantity: 2,
        unitPrice: 16499.0,
        subtotal: 32998.0,
      },
      {
        productId: 'prod-3',
        productSku: 'INF-SSD-003',
        productName: 'Disco de Estado Sólido NVMe 2TB PCIe 4.0',
        quantity: 2,
        unitPrice: 2250.0,
        subtotal: 4500.0,
      }
    ],
    subtotal: 37498.0,
    taxRate: 0.16,
    taxAmount: 5999.68,
    discount: 0,
    total: 43497.68,
    status: 'pagada',
    paymentMethod: 'transferencia',
    notes: 'Entrega en oficinas corporativas. Garantía de 1 año.',
    sentViaEmail: true,
    emailSentAt: '2026-09-24 16:30',
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'FAC-2026-0002',
    customerId: 'cust-2',
    customerName: 'Mariana Gómez (Grupo Industrial del Norte)',
    customerEmail: 'compras@industrialnorte.com.mx',
    customerTaxId: 'GIN190822M12',
    customerAddress: 'Parque Tecnológico Apodaca Edif. 3, Monterrey',
    date: '2026-09-25',
    dueDate: '2026-10-10',
    items: [
      {
        productId: 'prod-2',
        productSku: 'INF-MON-002',
        productName: 'Monitor Curvo UltraWide 34" 165Hz',
        quantity: 1,
        unitPrice: 9199.0,
        subtotal: 9199.0,
      },
      {
        productId: 'prod-4',
        productSku: 'INF-ROU-004',
        productName: 'Router Empresarial Wi-Fi 6 Mesh Gigabit',
        quantity: 2,
        unitPrice: 1599.0,
        subtotal: 3198.0,
      }
    ],
    subtotal: 12397.0,
    taxRate: 0.16,
    taxAmount: 1983.52,
    discount: 0,
    total: 14380.52,
    status: 'emitida',
    paymentMethod: 'transferencia',
    notes: 'Factura con crédito a 15 días comerciales.',
    sentViaEmail: false,
  }
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-1',
    productName: 'Laptop Profesional Dell Inspiron 15',
    productSku: 'INF-LAP-001',
    userId: 'usr-1',
    userName: 'Carlos Mendoza',
    type: 'entrada',
    quantity: 16,
    previousStock: 0,
    newStock: 16,
    reason: 'Recepción de compra inicial de lote por inventario de apertura',
    notes: 'Pedido de importación #IMP-884',
    date: '2026-09-20',
    time: '10:15',
  },
  {
    id: 'mov-2',
    productId: 'prod-1',
    productName: 'Laptop Profesional Dell Inspiron 15',
    productSku: 'INF-LAP-001',
    userId: 'usr-2',
    userName: 'Valeria Soto',
    type: 'venta',
    quantity: 2,
    previousStock: 16,
    newStock: 14,
    reason: 'Venta por Factura FAC-2026-0001',
    notes: 'Cliente: Soluciones Digitales 2TB',
    date: '2026-09-24',
    time: '16:25',
  },
  {
    id: 'mov-3',
    productId: 'prod-5',
    productName: 'Impresora Multifuncional Térmica POS 80mm',
    productSku: 'INF-IMP-005',
    userId: 'usr-2',
    userName: 'Valeria Soto',
    type: 'salida',
    quantity: 3,
    previousStock: 3,
    newStock: 0,
    reason: 'Venta directa en mostrador - Stock agotado',
    notes: 'Generar orden urgente de reorden a proveedor',
    date: '2026-09-26',
    time: '11:40',
  }
];

export const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  smtpServer: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'infinity2tb.notificaciones@gmail.com',
  smtpPassword: '',
  useTls: true,
  fromEmail: 'infinity2tb.notificaciones@gmail.com',
  fromName: 'Infinity-2TB Sistema Empresarial',
  replyTo: 'contacto@infinity2tb.com',
  active: false,
};

// Storage Helpers
export const getStoredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
};

export const saveStoredUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_USERS[0]; // Admin by default
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getStoredMovements = (): InventoryMovement[] => {
  try {
    const raw = localStorage.getItem(MOVEMENTS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_MOVEMENTS;
  } catch {
    return INITIAL_MOVEMENTS;
  }
};

export const saveStoredMovements = (movements: InventoryMovement[]): void => {
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
};

export const getStoredCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
};

export const saveStoredCustomers = (customers: Customer[]): void => {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const getStoredInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_INVOICES;
  } catch {
    return INITIAL_INVOICES;
  }
};

export const saveStoredInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
};

export const getStoredSmtpConfig = (): SmtpConfig => {
  try {
    const raw = localStorage.getItem(SMTP_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SMTP_CONFIG;
  } catch {
    return DEFAULT_SMTP_CONFIG;
  }
};

export const saveStoredSmtpConfig = (config: SmtpConfig): void => {
  localStorage.setItem(SMTP_KEY, JSON.stringify(config));
};

export const getStoredEmailLogs = (): EmailLog[] => {
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addStoredEmailLog = (log: EmailLog): void => {
  try {
    const current = getStoredEmailLogs();
    const updated = [log, ...current].slice(0, 50);
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));
  } catch {}
};
