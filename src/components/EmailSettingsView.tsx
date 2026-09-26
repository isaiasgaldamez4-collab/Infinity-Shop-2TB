import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SmtpConfig } from '../types';
import {
  Mail,
  Send,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Lock,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  FileText,
  Clock,
  Code
} from 'lucide-react';

export const EmailSettingsView: React.FC = () => {
  const { smtpConfig, updateSmtpConfig, testSmtp, emailLogs } = useApp();

  const [config, setConfig] = useState<SmtpConfig>(smtpConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test state
  const [testEmail, setTestEmail] = useState('miguelcanches32@gmail.com');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [copiedEnv, setCopiedEnv] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateSmtpConfig(config);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 300);
  };

  const handleTest = async () => {
    if (!testEmail) return;
    setIsTesting(true);
    setTestResult(null);

    const res = await testSmtp(testEmail);
    setIsTesting(false);
    setTestResult(res);
  };

  const envFileContent = `# =========================================================
# CONFIGURACIÓN REAL DE CORREO SMTP GMAIL — INFINITY-2TB
# =========================================================
MAIL_SERVER=${config.smtpServer}
MAIL_PORT=${config.smtpPort}
MAIL_USE_TLS=${config.useTls ? 'True' : 'False'}
MAIL_USE_SSL=False
MAIL_USERNAME=${config.smtpUser}
MAIL_PASSWORD=${config.smtpPassword ? '****************' : 'tu_contraseña_de_aplicacion_16_caracteres'}
MAIL_DEFAULT_SENDER="${config.fromName} <${config.fromEmail}>"
MAIL_REPLY_TO=${config.replyTo}
`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envFileContent);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wide uppercase mb-3 backdrop-blur-xs">
            <Mail className="w-3.5 h-3.5" />
            Servicio SMTP Real para Gmail
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Configuración de Correo Electrónico Real
          </h1>
          <p className="mt-2 text-rose-100 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Conecta tu cuenta de Gmail para despachar facturas digitales, comprobantes de pago y alertas de inventario
            directamente a las bandejas de entrada de tus clientes utilizando el protocolo SMTP estándar con encriptación TLS.
          </p>
        </div>
      </div>

      {/* Grid: Form and Tutorial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-rose-600" />
                Parámetros del Servidor SMTP
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Gmail Oficial
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Servidor SMTP (Host):
                  </label>
                  <input
                    type="text"
                    required
                    value={config.smtpServer}
                    onChange={e => setConfig({ ...config, smtpServer: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Puerto SMTP:
                  </label>
                  <input
                    type="number"
                    required
                    value={config.smtpPort}
                    onChange={e => setConfig({ ...config, smtpPort: Number(e.target.value) })}
                    placeholder="587"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Correo Electrónico Remitente (Cuenta Gmail):
                </label>
                <input
                  type="email"
                  required
                  value={config.smtpUser}
                  onChange={e => {
                    setConfig({
                      ...config,
                      smtpUser: e.target.value,
                      fromEmail: e.target.value,
                    });
                  }}
                  placeholder="tu_cuenta@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Contraseña de Aplicación de Google (16 caracteres):
                  </label>
                  <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> No es tu contraseña regular
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={config.smtpPassword}
                    onChange={e => setConfig({ ...config, smtpPassword: e.target.value })}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono tracking-wider focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Generada en: <em>Cuenta de Google &gt; Seguridad &gt; Verificación en 2 pasos &gt; Contraseñas de aplicaciones</em>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre del Remitente:
                  </label>
                  <input
                    type="text"
                    value={config.fromName}
                    onChange={e => setConfig({ ...config, fromName: e.target.value })}
                    placeholder="Infinity-2TB Notificaciones"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dirección de Respuesta (Reply-To):
                  </label>
                  <input
                    type="email"
                    value={config.replyTo}
                    onChange={e => setConfig({ ...config, replyTo: e.target.value })}
                    placeholder="contacto@infinity2tb.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tls-checkbox"
                  checked={config.useTls}
                  onChange={e => setConfig({ ...config, useTls: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="tls-checkbox" className="font-semibold text-slate-700 cursor-pointer">
                  Utilizar encriptación segura TLS (STARTTLS - Recomendado para puerto 587)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {saveSuccess && (
                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Configuración guardada en el sistema
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Configuración SMTP'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Live Test & Step Guide */}
        <div className="space-y-6">
          {/* Test Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-rose-600" />
              Probar Envío de Correo
            </h3>
            <p className="text-xs text-slate-500">
              Envía un correo de prueba para verificar que tu servidor SMTP y credenciales de Gmail responden correctamente.
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Correo Receptor de Prueba:
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="tu_correo@gmail.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              onClick={handleTest}
              disabled={isTesting || !testEmail}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Conectando con Gmail SMTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-rose-400" />
                  <span>Enviar Correo de Prueba</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-0.5">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>{testResult.success ? 'Conexión Exitosa' : 'Error de Conexión'}</span>
                </div>
                <div className="text-[11px]">{testResult.message}</div>
              </div>
            )}
          </div>

          {/* Guide Card */}
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              ¿Cómo obtener la Contraseña de Gmail?
            </h3>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Ingresa a tu cuenta de Google (<a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-sky-300 underline font-semibold">myaccount.google.com</a>).</li>
              <li>Ve a la pestaña <strong>Seguridad</strong> y asegúrate de tener activada la <strong>Verificación en 2 pasos</strong>.</li>
              <li>Busca la opción <strong>"Contraseñas de aplicaciones"</strong>.</li>
              <li>Escribe el nombre: <code>Infinity-2TB</code> y haz clic en <em>Crear</em>.</li>
              <li>Copia el código amarillo de <strong>16 letras</strong> y pégalo en el formulario.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* .env variables preview */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-600" />
              Variables de Entorno (.env) para Python Flask
            </h3>
            <p className="text-xs text-slate-500">
              Copia esta configuración directamente en tu archivo <code>.env</code> en el servidor Python.
            </p>
          </div>

          <button
            onClick={handleCopyEnv}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
          >
            {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEnv ? '¡Copiado!' : 'Copiar .env'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
          {envFileContent}
        </pre>
      </div>

      {/* History Log */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Historial de Correos Emitidos ({emailLogs.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                <th className="py-2.5 px-4">Fecha & Hora</th>
                <th className="py-2.5 px-3">Destinatario</th>
                <th className="py-2.5 px-3">Asunto</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emailLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No se han registrado envíos de correo aún. Realiza una prueba o envía una factura desde el módulo de facturación.
                  </td>
                </tr>
              ) : (
                emailLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.to}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[280px] truncate">{log.subject}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Entregado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
