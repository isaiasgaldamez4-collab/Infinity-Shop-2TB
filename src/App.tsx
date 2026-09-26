import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { MovementsView } from './components/MovementsView';
import { CustomersView } from './components/CustomersView';
import { InvoicingView } from './components/InvoicingView';
import { EmailSettingsView } from './components/EmailSettingsView';
import { PythonCodeView } from './components/PythonCodeView';
import { ProductModal } from './components/ProductModal';
import { NewInvoiceModal } from './components/NewInvoiceModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { Product } from './types';
import { Boxes, Shield, Terminal, Mail, Server } from 'lucide-react';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenNewProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigate={tab => setCurrentTab(tab)}
            onOpenNewProduct={handleOpenNewProduct}
            onOpenNewInvoice={() => setIsInvoiceModalOpen(true)}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView
            onOpenNewProduct={handleOpenNewProduct}
            onEditProduct={handleEditProduct}
          />
        )}

        {currentTab === 'movements' && <MovementsView />}

        {currentTab === 'customers' && <CustomersView />}

        {currentTab === 'invoicing' && (
          <InvoicingView
            onOpenNewInvoiceModal={() => setIsInvoiceModalOpen(true)}
          />
        )}

        {currentTab === 'email_smtp' && <EmailSettingsView />}

        {currentTab === 'python_flask' && <PythonCodeView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Infinity-2TB</span>
            <span>•</span>
            <span>Sistema Profesional de Gestión de Inventario & Facturación Digital</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Python Flask + SQLAlchemy + Vite</span>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('python_flask')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Arquitectura Python
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('email_smtp')}
              className="text-rose-600 hover:underline font-semibold"
            >
              Gmail SMTP
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      <NewInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
