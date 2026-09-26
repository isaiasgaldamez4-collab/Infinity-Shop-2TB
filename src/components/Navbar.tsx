import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Boxes,
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  FileText,
  Mail,
  Code,
  Shield,
  UserCheck,
  LogOut,
  Bell,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenProfile,
  onOpenAuth,
}) => {
  const { currentUser, products, setCurrentUserRole, logoutUser, resetAllData } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Calculate alerts
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalAlerts = lowStockCount + outOfStockCount;

  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    admin: { label: 'Administrador', bg: 'bg-rose-100', text: 'text-rose-800' },
    employee: { label: 'Empleado / Operativo', bg: 'bg-blue-100', text: 'text-blue-800' },
    client: { label: 'Cliente', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Boxes, badge: totalAlerts > 0 ? totalAlerts : undefined },
    { id: 'movements', label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'invoicing', label: 'Facturación', icon: FileText },
    { id: 'email_smtp', label: 'Correo Gmail SMTP', icon: Mail },
    { id: 'python_flask', label: 'Código Python Flask', icon: Code, highlight: true },
  ];

  // Filter tabs for client role
  const visibleNavItems = currentUser.role === 'client'
    ? navItems.filter(item => ['dashboard', 'customers', 'invoicing'].includes(item.id))
    : navItems;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-sans">
                  Infinity<span className="text-blue-600">-2TB</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                  Enterprise
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
                Gestión Integral de Inventario & Facturación
              </p>
            </div>
          </div>

          {/* Quick Actions & User Bar */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Stock Alert Badge */}
            {totalAlerts > 0 && (
              <button
                onClick={() => setCurrentTab('inventory')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition"
                title={`${lowStockCount} con stock bajo, ${outOfStockCount} agotados`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                <span>{totalAlerts} Alertas de Stock</span>
              </button>
            )}

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${roleLabels[currentUser.role]?.bg} ${roleLabels[currentUser.role]?.text}`}>
                  {roleLabels[currentUser.role]?.label}
                </span>
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Cambiar Rol Activo:
                  </div>
                  {(['admin', 'employee', 'client'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        setCurrentUserRole(role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition ${
                        currentUser.role === role ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{roleLabels[role].label}</span>
                      {currentUser.role === role && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Avatar / Trigger */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 transition text-left"
              title="Ver Perfil de Usuario"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-600/20"
              />
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role}
                </div>
              </div>
            </button>

            {/* Reset Data button */}
            <button
              onClick={() => {
                if (window.confirm('¿Deseas reiniciar los datos de prueba de Infinity-2TB a su estado inicial?')) {
                  resetAllData();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
              title="Reiniciar datos de muestra"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm font-semibold">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : item.highlight
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-blue-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="px-1.5 py-0.2 bg-indigo-200 text-indigo-900 text-[9px] rounded font-mono uppercase">
                    Flask
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
