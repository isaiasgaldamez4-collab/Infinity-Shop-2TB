import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Supplier,
  PurchaseOrder,
  PurchaseOrderStatus,
  KardexMovement,
  SaleTransaction,
  MovementType,
  SaleItem
} from '../types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_KARDEX,
  INITIAL_SALES
} from '../data/mockData';

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  kardexMovements: KardexMovement[];
  sales: SaleTransaction[];
  valuationMethod: 'PROMEDIO_PONDERADO' | 'PEPS';
  setValuationMethod: (method: 'PROMEDIO_PONDERADO' | 'PEPS') => void;
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Supplier actions
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  // Purchase actions
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'orderNumber'>) => PurchaseOrder;
  updatePurchaseOrderStatus: (orderId: string, status: PurchaseOrderStatus) => void;
  receivePurchaseOrder: (orderId: string, invoiceFolio?: string) => void;
  cancelPurchaseOrder: (orderId: string) => void;
  // Movement & Kardex
  registerManualMovement: (
    productId: string,
    type: MovementType,
    quantity: number,
    concept: string,
    unitCost?: number
  ) => boolean;
  // Sales POS
  registerSale: (
    customerName: string,
    items: { productId: string; quantity: number }[],
    paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia'
  ) => { success: boolean; error?: string; sale?: SaleTransaction };
  // System reset
  resetToDefaults: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inf_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('inf_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('inf_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [kardexMovements, setKardexMovements] = useState<KardexMovement[]>(() => {
    const saved = localStorage.getItem('inf_kardex');
    return saved ? JSON.parse(saved) : INITIAL_KARDEX;
  });

  const [sales, setSales] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem('inf_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [valuationMethod, setValuationMethod] = useState<'PROMEDIO_PONDERADO' | 'PEPS'>('PROMEDIO_PONDERADO');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('inf_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inf_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('inf_purchases', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('inf_kardex', JSON.stringify(kardexMovements));
  }, [kardexMovements]);

  useEffect(() => {
    localStorage.setItem('inf_sales', JSON.stringify(sales));
  }, [sales]);

  // Reset helper
  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setKardexMovements(INITIAL_KARDEX);
    setSales(INITIAL_SALES);
    localStorage.clear();
  };

  // Add Product
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProducts(prev => [newProduct, ...prev]);

    // Initial Kardex balance if stock > 0
    if (newProduct.currentStock > 0) {
      const newKardex: KardexMovement = {
        id: `kdx-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: 'AJUSTE_POSITIVO',
        concept: 'Inventario Inicial de Apertura',
        referenceDoc: 'INVENTARIO-INICIAL',
        quantity: newProduct.currentStock,
        unitCost: newProduct.purchasePrice,
        totalCost: newProduct.currentStock * newProduct.purchasePrice,
        balanceQuantity: newProduct.currentStock,
        balanceUnitCost: newProduct.purchasePrice,
        balanceTotalCost: newProduct.currentStock * newProduct.purchasePrice,
      };
      setKardexMovements(prev => [newKardex, ...prev]);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Supplier
  const addSupplier = (supData: Omit<Supplier, 'id'>): Supplier => {
    const newSupplier: Supplier = {
      ...supData,
      id: `sup-${Date.now()}`,
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Purchase Orders
  const createPurchaseOrder = (
    poData: Omit<PurchaseOrder, 'id' | 'orderNumber'>
  ): PurchaseOrder => {
    const nextNum = purchaseOrders.length + 1;
    const orderNumber = `OC-2026-${String(nextNum).padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: `oc-${Date.now()}`,
      orderNumber,
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    return newPO;
  };

  const updatePurchaseOrderStatus = (orderId: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders(prev =>
      prev.map(po => (po.id === orderId ? { ...po, status } : po))
    );
  };

  const cancelPurchaseOrder = (orderId: string) => {
    setPurchaseOrders(prev =>
      prev.map(po => (po.id === orderId ? { ...po, status: 'Cancelada' } : po))
    );
  };

  // Receive Purchase Order into Warehouse & Update Inventory & Kardex
  const receivePurchaseOrder = (orderId: string, invoiceFolio?: string) => {
    const order = purchaseOrders.find(po => po.id === orderId);
    if (!order || order.status === 'Recibida') return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newKardexEntries: KardexMovement[] = [];

    // Clone products to update quantities & average costs
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];

      order.items.forEach(item => {
        const prodIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (prodIndex !== -1) {
          const prod = updatedProducts[prodIndex];
          const oldStock = prod.currentStock;
          const oldCost = prod.purchasePrice;
          const newQty = item.quantity;
          const newUnitCost = item.unitCost * (1 - (item.discountPercent || 0) / 100);

          // Weighted average cost formula: (oldStock * oldCost + newQty * newCost) / (oldStock + newQty)
          const totalUnits = oldStock + newQty;
          const newAverageCost = totalUnits > 0
            ? ((oldStock * oldCost) + (newQty * newUnitCost)) / totalUnits
            : newUnitCost;

          updatedProducts[prodIndex] = {
            ...prod,
            currentStock: totalUnits,
            purchasePrice: Number(newAverageCost.toFixed(2)),
            status: totalUnits > 0 ? 'Activo' : 'Agotado',
          };

          newKardexEntries.push({
            id: `kdx-${Date.now()}-${item.productId}`,
            date: now,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: 'ENTRADA',
            concept: `Recepción Orden de Compra ${order.orderNumber}${invoiceFolio ? ` Fac: ${invoiceFolio}` : ''}`,
            referenceDoc: order.orderNumber,
            quantity: newQty,
            unitCost: Number(newUnitCost.toFixed(2)),
            totalCost: Number((newQty * newUnitCost).toFixed(2)),
            balanceQuantity: totalUnits,
            balanceUnitCost: Number(newAverageCost.toFixed(2)),
            balanceTotalCost: Number((totalUnits * newAverageCost).toFixed(2)),
          });
        }
      });

      return updatedProducts;
    });

    // Mark PO received
    setPurchaseOrders(prev =>
      prev.map(po =>
        po.id === orderId
          ? {
              ...po,
              status: 'Recibida',
              receivedDate: now.substring(0, 10),
              invoiceFolio: invoiceFolio || po.invoiceFolio,
            }
          : po
      )
    );

    // Append Kardex entries
    setKardexMovements(prev => [...newKardexEntries, ...prev]);
  };

  // Manual Inventory Adjustment (Mermas, Daños, Conteos físicos)
  const registerManualMovement = (
    productId: string,
    type: MovementType,
    quantity: number,
    concept: string,
    unitCost?: number
  ): boolean => {
    const prod = products.find(p => p.id === productId);
    if (!prod || quantity <= 0) return false;

    const isInput = type === 'ENTRADA' || type === 'AJUSTE_POSITIVO';
    if (!isInput && prod.currentStock < quantity) {
      return false; // No hay suficiente stock para salida
    }

    const appliedCost = unitCost !== undefined ? unitCost : prod.purchasePrice;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newStock = isInput ? prod.currentStock + quantity : prod.currentStock - quantity;

    // Recalculate average cost if positive adjustment
    const newAverageCost = (isInput && newStock > 0)
      ? ((prod.currentStock * prod.purchasePrice) + (quantity * appliedCost)) / newStock
      : prod.purchasePrice;

    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? {
              ...p,
              currentStock: newStock,
              purchasePrice: Number(newAverageCost.toFixed(2)),
              status: newStock === 0 ? 'Agotado' : 'Activo',
            }
          : p
      )
    );

    const kdx: KardexMovement = {
      id: `kdx-${Date.now()}`,
      date: now,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      type,
      concept,
      referenceDoc: `AJUSTE-${Date.now().toString().slice(-4)}`,
      quantity,
      unitCost: appliedCost,
      totalCost: quantity * appliedCost,
      balanceQuantity: newStock,
      balanceUnitCost: Number(newAverageCost.toFixed(2)),
      balanceTotalCost: Number((newStock * newAverageCost).toFixed(2)),
    };

    setKardexMovements(prev => [kdx, ...prev]);
    return true;
  };

  // Sales / POS Simulator
  const registerSale = (
    customerName: string,
    itemsToSell: { productId: string; quantity: number }[],
    paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia'
  ) => {
    // Validate stock
    for (const item of itemsToSell) {
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return { success: false, error: `Producto no encontrado.` };
      if (p.currentStock < item.quantity) {
        return {
          success: false,
          error: `Stock insuficiente para "${p.name}". Disponible: ${p.currentStock} ${p.unit}, solicitado: ${item.quantity}.`,
        };
      }
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const nextTicketNum = `TK-${1000 + sales.length + 1}`;
    const saleItems: SaleItem[] = [];
    const kardexEntries: KardexMovement[] = [];

    let subtotal = 0;
    let totalCost = 0;

    // Deduct stock
    setProducts(prevProducts => {
      const updated = [...prevProducts];

      itemsToSell.forEach(item => {
        const idx = updated.findIndex(p => p.id === item.productId);
        if (idx !== -1) {
          const p = updated[idx];
          const newStock = p.currentStock - item.quantity;
          const itemSubtotal = item.quantity * p.salePrice;
          const itemCost = item.quantity * p.purchasePrice;

          subtotal += itemSubtotal;
          totalCost += itemCost;

          saleItems.push({
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            quantity: item.quantity,
            unitPrice: p.salePrice,
            unitCost: p.purchasePrice,
            subtotal: itemSubtotal,
          });

          kardexEntries.push({
            id: `kdx-${Date.now()}-${p.id}`,
            date: now,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: 'SALIDA',
            concept: `Venta Mostrador Ticket #${nextTicketNum}`,
            referenceDoc: nextTicketNum,
            quantity: item.quantity,
            unitCost: p.purchasePrice,
            totalCost: itemCost,
            balanceQuantity: newStock,
            balanceUnitCost: p.purchasePrice,
            balanceTotalCost: newStock * p.purchasePrice,
          });

          updated[idx] = {
            ...p,
            currentStock: newStock,
            status: newStock === 0 ? 'Agotado' : 'Activo',
          };
        }
      });

      return updated;
    });

    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + tax;
    const grossProfit = subtotal - totalCost;

    const newSale: SaleTransaction = {
      id: `sale-${Date.now()}`,
      ticketNumber: nextTicketNum,
      date: now,
      customerName: customerName || 'Público General',
      items: saleItems,
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      paymentMethod,
    };

    setSales(prev => [newSale, ...prev]);
    setKardexMovements(prev => [...kardexEntries, ...prev]);

    return { success: true, sale: newSale };
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        suppliers,
        purchaseOrders,
        kardexMovements,
        sales,
        valuationMethod,
        setValuationMethod,
        addProduct,
        updateProduct,
        deleteProduct,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        createPurchaseOrder,
        updatePurchaseOrderStatus,
        receivePurchaseOrder,
        cancelPurchaseOrder,
        registerManualMovement,
        registerSale,
        resetToDefaults,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory debe ser usado dentro de un InventoryProvider');
  }
  return context;
};
