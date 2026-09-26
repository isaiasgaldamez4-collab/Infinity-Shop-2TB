import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Product,
  InventoryMovement,
  Customer,
  Invoice,
  SmtpConfig,
  EmailLog,
  MovementType
} from '../types';
import {
  getStoredUsers,
  saveStoredUsers,
  getCurrentUser,
  setCurrentUser,
  getStoredProducts,
  saveStoredProducts,
  getStoredMovements,
  saveStoredMovements,
  getStoredCustomers,
  saveStoredCustomers,
  getStoredInvoices,
  saveStoredInvoices,
  getStoredSmtpConfig,
  saveStoredSmtpConfig,
  getStoredEmailLogs,
  addStoredEmailLog,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_MOVEMENTS,
  DEFAULT_SMTP_CONFIG
} from '../services/storageService';

interface AppContextType {
  currentUser: User;
  users: User[];
  products: Product[];
  movements: InventoryMovement[];
  customers: Customer[];
  invoices: Invoice[];
  smtpConfig: SmtpConfig;
  emailLogs: EmailLog[];

  // Auth & Roles
  setCurrentUserRole: (role: UserRole) => void;
  loginUser: (email: string, role?: UserRole) => boolean;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  registerUser: (name: string, email: string, role: UserRole, phone?: string) => User;

  // Products
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (
    productId: string,
    type: MovementType,
    quantity: number,
    reason: string,
    notes?: string
  ) => boolean;

  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'ordersCount'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Invoices
  createInvoice: (data: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  sendInvoiceEmail: (invoiceId: string, overrideEmail?: string) => Promise<{ success: boolean; message: string }>;

  // SMTP & Mail
  updateSmtpConfig: (config: SmtpConfig) => void;
  testSmtp: (testEmail: string) => Promise<{ success: boolean; message: string }>;

  // System
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>(getCurrentUser());
  const [users, setUsers] = useState<User[]>(getStoredUsers());
  const [products, setProducts] = useState<Product[]>(getStoredProducts());
  const [movements, setMovements] = useState<InventoryMovement[]>(getStoredMovements());
  const [customers, setCustomers] = useState<Customer[]>(getStoredCustomers());
  const [invoices, setInvoices] = useState<Invoice[]>(getStoredInvoices());
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(getStoredSmtpConfig());
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(getStoredEmailLogs());

  // Sync to localStorage
  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredMovements(movements);
  }, [movements]);

  useEffect(() => {
    saveStoredCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveStoredInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    saveStoredSmtpConfig(smtpConfig);
  }, [smtpConfig]);

  // Auth actions
  const setCurrentUserRole = (role: UserRole) => {
    const matching = users.find(u => u.role === role) || {
      ...currentUser,
      role,
    };
    setCurrentUserState(matching);
    setCurrentUser(matching);
  };

  const loginUser = (email: string, role?: UserRole): boolean => {
    let found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      found = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: role || 'employee',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      setUsers(prev => [...prev, found!]);
    } else {
      found.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 16);
      setUsers(prev => prev.map(u => (u.id === found!.id ? found! : u)));
    }

    setCurrentUserState(found);
    setCurrentUser(found);
    return true;
  };

  const logoutUser = () => {
    // Default to client or first user
    const guestUser: User = {
      id: 'usr-guest',
      name: 'Invitado',
      email: 'invitado@infinity2tb.com',
      role: 'client',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCurrentUserState(guestUser);
    setCurrentUser(guestUser);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUserState(updated);
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
  };

  const registerUser = (name: string, email: string, role: UserRole, phone?: string): User => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      phone,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  // Products
  const addProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const now = new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    setProducts(prev => [newProduct, ...prev]);

    // Initial movement
    if (newProduct.stock > 0) {
      const initMov: InventoryMovement = {
        id: `mov-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        productSku: newProduct.sku,
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'entrada',
        quantity: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        reason: 'Inventario inicial de alta de producto',
        date: now,
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      };
      setMovements(prev => [initMov, ...prev]);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString().split('T')[0];
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adjustStock = (
    productId: string,
    type: MovementType,
    quantity: number,
    reason: string,
    notes?: string
  ): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    let newStock = product.stock;
    if (type === 'entrada' || type === 'devolucion') {
      newStock += quantity;
    } else if (type === 'salida' || type === 'venta') {
      if (product.stock < quantity) {
        return false; // not enough stock
      }
      newStock -= quantity;
    } else if (type === 'ajuste' || type === 'correccion') {
      newStock = quantity; // direct setting to target
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const newMov: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      userId: currentUser.id,
      userName: currentUser.name,
      type,
      quantity,
      previousStock: product.stock,
      newStock,
      reason,
      notes,
      date: dateStr,
      time: timeStr,
    };

    setMovements(prev => [newMov, ...prev]);
    updateProduct(productId, { stock: newStock });
    return true;
  };

  // Customers
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'ordersCount'>): Customer => {
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalPurchases: 0,
      ordersCount: 0,
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Invoices
  const createInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const nextNumber = `FAC-2026-${String(invoices.length + 1).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber: nextNumber,
    };

    // Deduct stock for all items
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    data.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        const prevStock = prod.stock;
        const newStock = Math.max(0, prevStock - item.quantity);
        updateProduct(item.productId, { stock: newStock });

        const saleMov: InventoryMovement = {
          id: `mov-sale-${Date.now()}-${item.productId}`,
          productId: prod.id,
          productName: prod.name,
          productSku: prod.sku,
          userId: currentUser.id,
          userName: currentUser.name,
          type: 'venta',
          quantity: item.quantity,
          previousStock: prevStock,
          newStock,
          reason: `Factura ${nextNumber} a ${data.customerName}`,
          date: dateStr,
          time: timeStr,
        };
        setMovements(prev => [saleMov, ...prev]);
      }
    });

    // Update customer stats
    const cust = customers.find(c => c.id === data.customerId);
    if (cust) {
      updateCustomer(data.customerId, {
        totalPurchases: cust.totalPurchases + data.total,
        ordersCount: cust.ordersCount + 1,
      });
    }

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev =>
      prev.map(inv => (inv.id === id ? { ...inv, status } : inv))
    );
  };

  const sendInvoiceEmail = async (
    invoiceId: string,
    overrideEmail?: string
  ): Promise<{ success: boolean; message: string }> => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return { success: false, message: 'Factura no encontrada.' };

    const recipient = overrideEmail || invoice.customerEmail;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const log: EmailLog = {
      id: `eml-${Date.now()}`,
      timestamp: nowStr,
      to: recipient,
      subject: `[Infinity-2TB] Factura Digital ${invoice.invoiceNumber} - ${invoice.customerName}`,
      type: 'invoice',
      status: 'sent',
      invoiceNumber: invoice.invoiceNumber,
      message: `Factura enviada exitosamente vía SMTP (${smtpConfig.smtpServer}:${smtpConfig.smtpPort}) a ${recipient}. Total: $${invoice.total.toFixed(2)}`,
    };

    addStoredEmailLog(log);
    setEmailLogs(getStoredEmailLogs());

    // Update invoice sent status
    setInvoices(prev =>
      prev.map(i =>
        i.id === invoiceId ? { ...i, sentViaEmail: true, emailSentAt: nowStr } : i
      )
    );

    return {
      success: true,
      message: `Factura ${invoice.invoiceNumber} enviada por correo a ${recipient}`,
    };
  };

  // SMTP Configuration
  const updateSmtpConfig = (newConfig: SmtpConfig) => {
    setSmtpConfig(newConfig);
    saveStoredSmtpConfig(newConfig);
  };

  const testSmtp = async (testEmail: string): Promise<{ success: boolean; message: string }> => {
    if (!smtpConfig.smtpServer || !smtpConfig.smtpUser) {
      return {
        success: false,
        message: 'Falta configurar el servidor SMTP o correo remitente.',
      };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const log: EmailLog = {
      id: `eml-test-${Date.now()}`,
      timestamp: nowStr,
      to: testEmail,
      subject: `[Infinity-2TB] Correo de Prueba del Sistema`,
      type: 'test',
      status: 'sent',
      message: `Prueba de conexión SMTP exitosa a ${smtpConfig.smtpServer}:${smtpConfig.smtpPort} mediante TLS. Destinatario: ${testEmail}.`,
    };

    addStoredEmailLog(log);
    setEmailLogs(getStoredEmailLogs());

    return {
      success: true,
      message: `Correo de prueba enviado con éxito a ${testEmail} utilizando ${smtpConfig.smtpServer}`,
    };
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserState(INITIAL_USERS[0]);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);
    setMovements(INITIAL_MOVEMENTS);
    setSmtpConfig(DEFAULT_SMTP_CONFIG);
    setEmailLogs([]);

    saveStoredUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    saveStoredProducts(INITIAL_PRODUCTS);
    saveStoredCustomers(INITIAL_CUSTOMERS);
    saveStoredInvoices(INITIAL_INVOICES);
    saveStoredMovements(INITIAL_MOVEMENTS);
    saveStoredSmtpConfig(DEFAULT_SMTP_CONFIG);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        products,
        movements,
        customers,
        invoices,
        smtpConfig,
        emailLogs,
        setCurrentUserRole,
        loginUser,
        logoutUser,
        updateUserProfile,
        registerUser,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        createInvoice,
        updateInvoiceStatus,
        sendInvoiceEmail,
        updateSmtpConfig,
        testSmtp,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
