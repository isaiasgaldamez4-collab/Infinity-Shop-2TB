import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { InventoryView } from './components/InventoryView';
import { PurchasesView } from './components/PurchasesView';
import { KardexView } from './components/KardexView';
import { SalesSimulator } from './components/SalesSimulator';
import { LearningCenter } from './components/LearningCenter';
import { N8nIntegrationView } from './components/N8nIntegrationView';
import { NewProductModal } from './components/NewProductModal';
import { NewPurchaseModal } from './components/NewPurchaseModal';
import { NewSupplierModal } from './components/NewSupplierModal';
import { ManualMovementModal } from './components/ManualMovementModal';
import { PurchaseDetailModal } from './components/PurchaseDetailModal';
import { Product, PurchaseOrder } from './types/inventory';

const AppContent: React.FC = () => {
  const { receivePurchaseOrder, resetToDefaults } = useInventory();

  // Navigation
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'inventory' | 'purchases' | 'kardex' | 'sales' | 'learning' | 'n8n'>('dashboard');

  // Modals state
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [manualMovementProduct, setManualMovementProduct] = useState<Product | null>(null);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);
  const [kardexSelectedProduct, setKardexSelectedProduct] = useState<string | undefined>(undefined);

  // Cross-module handlers
  const handleViewProductKardex = (productId: string) => {
    setKardexSelectedProduct(productId);
    setCurrentTab('kardex');
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsNewProductOpen(true);
  };

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsNewProductOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewProduct={handleOpenNewProduct}
        onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
        onResetData={resetToDefaults}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            onNavigateTab={setCurrentTab}
            onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
            onOpenNewProduct={handleOpenNewProduct}
            onSelectKardexProduct={handleViewProductKardex}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView
            onOpenNewProduct={handleOpenNewProduct}
            onEditProduct={handleOpenEditProduct}
            onOpenAdjustment={prod => setManualMovementProduct(prod)}
            onViewProductKardex={handleViewProductKardex}
          />
        )}

        {currentTab === 'purchases' && (
          <PurchasesView
            onOpenNewPurchase={() => setIsNewPurchaseOpen(true)}
            onOpenNewSupplier={() => setIsNewSupplierOpen(true)}
            onViewOrderDetails={order => setViewingOrder(order)}
          />
        )}

        {currentTab === 'kardex' && (
          <KardexView
            initialProductId={kardexSelectedProduct}
            onOpenManualMovement={prod => setManualMovementProduct(prod)}
          />
        )}

        {currentTab === 'sales' && <SalesSimulator />}

        {currentTab === 'learning' && <LearningCenter />}

        {currentTab === 'n8n' && <N8nIntegrationView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">InfinityShop-2TB</span>
            <span>•</span>
            <span>Sistema Integral de Compras, Inventario y Valuación Contable</span>
          </div>
          <div className="text-slate-400">
            Diseñado para práctica administrativa y bachillerato técnico
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => {
          setIsNewProductOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />

      <NewPurchaseModal
        isOpen={isNewPurchaseOpen}
        onClose={() => setIsNewPurchaseOpen(false)}
      />

      <NewSupplierModal
        isOpen={isNewSupplierOpen}
        onClose={() => setIsNewSupplierOpen(false)}
      />

      <ManualMovementModal
        isOpen={!!manualMovementProduct}
        onClose={() => setManualMovementProduct(null)}
        product={manualMovementProduct}
      />

      <PurchaseDetailModal
        order={viewingOrder}
        onClose={() => setViewingOrder(null)}
        onReceiveOrder={receivePurchaseOrder}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
};

export default App;
