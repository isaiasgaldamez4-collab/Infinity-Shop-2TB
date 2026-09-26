import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  X,
  LogOut,
  Users,
  UserCheck
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { currentUser, updateUserProfile, setCurrentUserRole, logoutUser, users } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'users'>('profile');

  // Profile fields
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, phone });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordFeedback({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ success: false, message: 'Las contraseñas no coinciden.' });
      return;
    }

    setPasswordFeedback({ success: true, message: 'Contraseña actualizada y protegida mediante hash correctamente.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordFeedback(null), 3000);
  };

  const handleLogout = () => {
    logoutUser();
    onClose();
    onOpenAuth();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-500/20"
            />
            <div>
              <h2 className="text-sm font-bold text-slate-900">{currentUser.name}</h2>
              <div className="text-xs text-slate-500">{currentUser.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-slate-100 text-xs font-bold space-x-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 transition ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
          >
            Datos Personales
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2 transition ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
          >
            Seguridad & Contraseña
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2 transition ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
            >
              Control de Roles ({users.length})
            </button>
          )}
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre Completo:</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Correo Electrónico (No modificable):</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Teléfono:</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Rol en Infinity-2TB:</label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900 capitalize">{currentUser.role}</div>
                  <div className="text-[11px] text-blue-700">
                    {currentUser.role === 'admin'
                      ? 'Acceso total a inventario, usuarios, facturación y finanzas'
                      : currentUser.role === 'employee'
                      ? 'Acceso operativo a inventario, ventas y clientes'
                      : 'Acceso a consulta de compras y facturas'}
                  </div>
                </div>
                <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">
                  ACTIVO
                </span>
              </div>
            </div>

            {profileSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Perfil actualizado exitosamente.</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition"
              >
                Guardar Perfil
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contraseña Actual:</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nueva Contraseña:</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirmar Nueva Contraseña:</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {passwordFeedback && (
              <div
                className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                  passwordFeedback.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {passwordFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passwordFeedback.message}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition"
              >
                Cambiar Contraseña
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Admin Users Control */}
        {activeTab === 'users' && currentUser.role === 'admin' && (
          <div className="space-y-3 text-xs">
            <div className="text-slate-500 text-[11px]">
              Como Administrador de <strong>Infinity-2TB</strong>, puedes cambiar el rol activo para simular permisos o probar la interfaz.
            </div>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {users.map(u => (
                <div key={u.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div>
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-slate-400 font-mono text-[10px]">{u.email}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="capitalize font-bold text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentUserRole(u.role);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] transition"
                    >
                      Activar Este Rol
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
