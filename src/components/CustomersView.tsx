import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, Invoice } from '../types';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  CreditCard
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, invoices, addCustomer, updateCustomer, deleteCustomer, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [taxId, setTaxId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('México');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const openNewCustomerModal = () => {
    setEditingCustomer(null);
    setName('');
    setCompany('');
    setTaxId('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setCountry('México');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditCustomerModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setCompany(customer.company || '');
    setTaxId(customer.taxId);
    setEmail(customer.email);
    setPhone(customer.phone);
    setAddress(customer.address);
    setCity(customer.city);
    setCountry(customer.country);
    setStatus(customer.status);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name,
        company,
        taxId,
        email,
        phone,
        address,
        city,
        country,
        status,
      });
    } else {
      addCustomer({
        name,
        company,
        taxId,
        email,
        phone,
        address,
        city,
        country,
        status,
      });
    }
    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.taxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const canManage = currentUser.role !== 'client';

  // Invoices for viewing customer
  const customerInvoices = viewingCustomer
    ? invoices.filter(inv => inv.customerId === viewingCustomer.id)
    : [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-600" />
            Directorio & Gestión de Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de personas y empresas, identificación fiscal, historial de compras y facturación asociada.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openNewCustomerModal}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Cliente</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, empresa, RFC/Tax ID o correo..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total: <strong>{filteredCustomers.length}</strong> clientes
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map(customer => {
          const clientInvoices = invoices.filter(i => i.customerId === customer.id);
          const totalSpent = clientInvoices.reduce((s, i) => s + i.total, 0);

          return (
            <div
              key={customer.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-violet-300 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{customer.name}</h3>
                    {customer.company && (
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{customer.company}</span>
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    customer.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {customer.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                      {customer.taxId}
                    </span>
                    <span className="text-[10px] text-slate-400">ID Fiscal</span>
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${customer.email}`} className="hover:underline truncate text-blue-600">
                      {customer.email}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{customer.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{customer.address}, {customer.city}</span>
                  </div>
                </div>
              </div>

              {/* Purchase summary banner */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Comprado</span>
                  <span className="font-black text-slate-900 font-mono text-sm">
                    ${totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingCustomer(customer)}
                    className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-slate-50 rounded transition"
                    title="Ver historial de facturas"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {canManage && (
                    <>
                      <button
                        onClick={() => openEditCustomerModal(customer)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded transition"
                        title="Editar datos de cliente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar cliente ${customer.name}?`)) {
                              deleteCustomer(customer.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded transition"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-600" />
                {editingCustomer ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo del Contacto / Representante:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Morales Sánchez"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Razón Social / Empresa (Opcional):</label>
                <input
                  type="text"
                  placeholder="Ej. Soluciones Tecnológicas del Centro S.A."
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Identificación Fiscal (RFC/Tax ID):</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. STC240115K89"
                    value={taxId}
                    onChange={e => setTaxId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono:</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. +52 55 1234 5678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Electrónico (para facturas):</label>
                <input
                  type="email"
                  required
                  placeholder="contacto@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dirección Completa:</label>
                <input
                  type="text"
                  required
                  placeholder="Calle, Número, Colonia, C.P."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ciudad / Estado:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ciudad de México"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">País:</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-lg transition"
                >
                  {editingCustomer ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CUSTOMER & INVOICES MODAL */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">{viewingCustomer.name}</h3>
                <div className="text-xs text-slate-500">{viewingCustomer.company || 'Cliente Particular'} • {viewingCustomer.taxId}</div>
              </div>
              <button onClick={() => setViewingCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-xs text-slate-700">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Correo</span>
                <span className="font-medium text-slate-900 truncate block">{viewingCustomer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Teléfono</span>
                <span className="font-medium text-slate-900">{viewingCustomer.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Ciudad / País</span>
                <span className="font-medium text-slate-900">{viewingCustomer.city}, {viewingCustomer.country}</span>
              </div>
            </div>

            {/* Invoices Table for this customer */}
            <div className="space-y-2 flex-1">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Historial de Facturas Emitidas ({customerInvoices.length})
              </h4>

              {customerInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No hay facturas registradas para este cliente aún.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                        <th className="py-2.5 px-3">Folio</th>
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Artículos</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono">{inv.date}</td>
                          <td className="py-2.5 px-3 text-slate-600">{inv.items.length} producto(s)</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">${inv.total.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-blue-100 text-blue-800">
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
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
