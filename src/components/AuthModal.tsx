import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Boxes,
  Lock,
  Mail,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginUser, registerUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'login') {
      const ok = loginUser(email);
      if (ok) {
        onClose();
      } else {
        setErrorMsg('Credenciales inválidas.');
      }
    } else {
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener mínimo 6 caracteres.');
        return;
      }
      registerUser(name, email, role);
      loginUser(email, role);
      onClose();
    }
  };

  const handleQuickLogin = (demoEmail: string, demoRole: UserRole) => {
    loginUser(demoEmail, demoRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-2">
            <Boxes className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Infinity<span className="text-blue-600">-2TB</span>
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login' ? 'Inicia sesión con tu cuenta corporativa' : 'Crear nueva cuenta en el sistema'}
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-400">
            Acceso Rápido por Rol (Demostración):
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@infinity2tb.com', 'admin')}
              className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[10px] transition border border-rose-200 text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('empleado@infinity2tb.com', 'employee')}
              className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[10px] transition border border-blue-200 text-center"
            >
              Empleado
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('cliente@infinity2tb.com', 'client')}
              className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] transition border border-emerald-200 text-center"
            >
              Cliente
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre Completo:</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Carlos Mendoza"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Correo Electrónico:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@infinity2tb.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contraseña:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Rol a Asignar:</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              >
                <option value="employee">Empleado / Operativo</option>
                <option value="admin">Administrador</option>
                <option value="client">Cliente</option>
              </select>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <span>{mode === 'login' ? 'Iniciar Sesión' : 'Registrar Cuenta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <span>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-blue-600 font-bold hover:underline"
              >
                Regístrate aquí
              </button>
            </span>
          ) : (
            <span>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 font-bold hover:underline"
              >
                Inicia sesión
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
