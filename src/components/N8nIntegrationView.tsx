import React, { useState, useEffect } from 'react';
import {
  N8nConfig,
  N8nEventLog,
  N8nChannel
} from '../types/n8n';
import {
  getN8nConfig,
  saveN8nConfig,
  getN8nLogs,
  clearN8nLogs,
  sendToN8n,
  DEFAULT_N8N_CONFIG
} from '../services/n8nService';
import {
  Workflow,
  Send,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ExternalLink,
  Code,
  Sliders,
  Bell,
  Eye,
  X
} from 'lucide-react';

export const N8nIntegrationView: React.FC = () => {
  const [config, setConfig] = useState<N8nConfig>(getN8nConfig());
  const [logs, setLogs] = useState<N8nEventLog[]>(getN8nLogs());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [viewingPayload, setViewingPayload] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    setLogs(getN8nLogs());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    saveN8nConfig(config);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 400);
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);

    const result = await sendToN8n('TEST_PING', {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Ping de prueba desde InfinityShop-2TB',
    });

    setTestResult({
      success: result.success,
      message: result.message,
    });
    setLogs(getN8nLogs());
    setIsTesting(false);
  };

  const handleClearLogs = () => {
    if (window.confirm('¿Deseas vaciar el historial de eventos enviados a n8n?')) {
      clearN8nLogs();
      setLogs([]);
    }
  };

  // Sample production-ready n8n workflow JSON
  const n8nWorkflowJson = JSON.stringify(
    {
      name: "InfinityShop Facturas y Notificaciones (Email y Telegram)",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "infinityshop-facturas",
            responseMode: "onReceived",
            responseData: "allEntries",
            options: {}
          },
          name: "Webhook InfinityShop",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [240, 300]
        },
        {
          parameters: {
            dataType: "string",
            value1: "={{ $json.body.targetChannel }}",
            rules: {
              rules: [
                { value2: "telegram" },
                { value2: "email" },
                { value2: "both" }
              ]
            }
          },
          name: "Switch Canal",
          type: "n8n-nodes-base.switch",
          typeVersion: 1,
          position: [460, 300]
        },
        {
          parameters: {
            chatId: "={{ $json.body.recipient.telegramChatId }}",
            text: "={{ $json.body.message.telegramText }}",
            additionalFields: { parse_mode: "Markdown" }
          },
          name: "Enviar Telegram",
          type: "n8n-nodes-base.telegram",
          typeVersion: 1,
          position: [700, 200]
        },
        {
          parameters: {
            toEmail: "={{ $json.body.recipient.email }}",
            subject: "={{ $json.body.message.subject }}",
            emailFormat: "html",
            html: "=<h2>Notificación InfinityShop</h2><pre>{{ JSON.stringify($json.body.data, null, 2) }}</pre>"
          },
          name: "Enviar Email",
          type: "n8n-nodes-base.emailSend",
          typeVersion: 2,
          position: [700, 420]
        }
      ],
      connections: {
        "Webhook InfinityShop": {
          main: [[{ node: "Switch Canal", type: "main", index: 0 }]]
        },
        "Switch Canal": {
          main: [
            [{ node: "Enviar Telegram", type: "main", index: 0 }],
            [{ node: "Enviar Email", type: "main", index: 0 }],
            [
              { node: "Enviar Telegram", type: "main", index: 0 },
              { node: "Enviar Email", type: "main", index: 0 }
            ]
          ]
        }
      }
    },
    null,
    2
  );

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(n8nWorkflowJson);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-rose-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wide uppercase mb-3 backdrop-blur-xs">
            <Workflow className="w-3.5 h-3.5" />
            Automatización de Procesos con n8n
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Integración de Facturación con n8n, Email y Telegram
          </h1>
          <p className="mt-2 text-rose-100 text-sm sm:text-base leading-relaxed max-w-3xl">
            Conecta tus facturas de compra y comprobantes de venta directamente con flujos de trabajo en n8n
            para enviarlas automáticamente por correo electrónico o por bots de Telegram a clientes, contadores o administradores.
          </p>
        </div>
      </div>

      {/* Grid: Settings & Test Connection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Configuración del Webhook de n8n
                </h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                Webhook Activo
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Webhook URL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  URL del Webhook en n8n:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={config.webhookUrl}
                    onChange={e => setConfig({ ...config, webhookUrl: e.target.value })}
                    placeholder="https://tu-n8n.dominio.com/webhook/infinityshop-facturas"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pega aquí la URL "Production Webhook" o "Test Webhook" de tu nodo Webhook en n8n.
                </p>
              </div>

              {/* Preferred Channel */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Canal de Notificación Predeterminado:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'both', label: 'Ambos (Email + Telegram)', icon: Bell },
                    { id: 'email', label: 'Solo Correo Electrónico', icon: Mail },
                    { id: 'telegram', label: 'Solo Telegram Bot', icon: MessageSquare },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setConfig({ ...config, preferredChannel: item.id as N8nChannel })}
                        className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition ${
                          config.preferredChannel === item.id
                            ? 'bg-orange-50 border-orange-500 text-orange-950 font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-orange-600" />
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email and Telegram targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Correo Destinatario (Email):
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={config.emailRecipient}
                      onChange={e => setConfig({ ...config, emailRecipient: e.target.value })}
                      placeholder="facturas@empresa.com"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chat ID / Canal de Telegram:
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={config.telegramChatId}
                      onChange={e => setConfig({ ...config, telegramChatId: e.target.value })}
                      placeholder="@CanalNotificaciones o 123456789"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Event Triggers switches */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <span className="font-bold text-slate-700 block">
                  Disparadores Automáticos (Eventos):
                </span>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={config.sendPurchases}
                    onChange={e => setConfig({ ...config, sendPurchases: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span>Enviar factura a n8n al recibir o emitir una <strong>Orden de Compra</strong></span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={config.sendSales}
                    onChange={e => setConfig({ ...config, sendSales: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span>Enviar comprobante a n8n al registrar una <strong>Venta / Ticket</strong></span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={config.sendLowStockAlerts}
                    onChange={e => setConfig({ ...config, sendLowStockAlerts: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span>Enviar alerta a Telegram/Email cuando el inventario caiga al <strong>Punto de Reorden</strong></span>
                </label>
              </div>

              {/* Save & Feedback */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Configuración guardada correctamente
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfig(DEFAULT_N8N_CONFIG);
                      saveN8nConfig(DEFAULT_N8N_CONFIG);
                    }}
                    className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                  >
                    Restablecer
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-xs"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Live Test & Architecture Card */}
        <div className="space-y-6">
          {/* Test Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-600" />
              Probar Conexión en Vivo
            </h3>
            <p className="text-xs text-slate-500">
              Envía una petición POST de prueba a tu webhook con datos simulados para verificar que tu n8n lo recibe.
            </p>

            <button
              onClick={handleTestPing}
              disabled={isTesting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Enviando petición a n8n...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-orange-400" />
                  <span>Enviar Ping de Prueba</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-0.5">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  <span>{testResult.success ? 'Resultado Exitoso' : 'Aviso / Error'}</span>
                </div>
                <div className="text-[11px] mt-0.5">{testResult.message}</div>
              </div>
            )}
          </div>

          {/* Architecture Box */}
          <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Workflow className="w-4 h-4" />
              Diagrama del Flujo en n8n
            </h3>
            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="p-2 bg-slate-800/80 rounded border border-slate-700">
                1. Webhook (POST): Recibe JSON de Factura
              </div>
              <div className="text-center text-slate-500">↓</div>
              <div className="p-2 bg-slate-800/80 rounded border border-slate-700">
                2. Switch: Filtra por Email o Telegram
              </div>
              <div className="text-center text-slate-500">↓</div>
              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="p-1.5 bg-blue-950/80 text-blue-300 rounded border border-blue-800">
                  Telegram Bot (Mensaje Markdown)
                </div>
                <div className="p-1.5 bg-amber-950/80 text-amber-300 rounded border border-amber-800">
                  Gmail / SMTP (Factura HTML)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copy n8n Workflow JSON Section */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" />
              Plantilla de Flujo n8n (Importable con 1 Clic)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Copia este código JSON y pégalo (<kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-700">Ctrl + V</kbd>)
              directamente en el lienzo de tu n8n para tener el flujo de Telegram y Email listo.
            </p>
          </div>

          <button
            onClick={handleCopyWorkflow}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition shadow-xs ${
              copiedWorkflow
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {copiedWorkflow ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Workflow JSON</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-56 leading-relaxed">
          {n8nWorkflowJson}
        </pre>
      </section>

      {/* History Log Table */}
      <section className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Historial de Facturas y Eventos Enviados a n8n
            </h2>
            <p className="text-xs text-slate-400">
              Registro local de las últimas {logs.length} peticiones enviadas al webhook
            </p>
          </div>

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Historial</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-4">Fecha y Hora</th>
                <th className="py-2.5 px-3">Tipo de Evento</th>
                <th className="py-2.5 px-3">Resumen / Folio</th>
                <th className="py-2.5 px-3">Canal</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No se han registrado envíos a n8n aún. Realiza una prueba o envía una factura desde el módulo de compras o ventas.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold font-mono text-[10px] text-slate-800 px-1.5 py-0.5 rounded bg-slate-100">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[260px] truncate">
                      {log.summary}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                      {log.targetChannel === 'both' ? 'Email & Telegram' : log.targetChannel.toUpperCase()}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'simulated'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status === 'success'
                          ? 'Enviado HTTP'
                          : log.status === 'simulated'
                          ? 'Simulado'
                          : 'Falló'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setViewingPayload(log.payload)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                        title="Inspeccionar JSON del payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* JSON Payload Inspector Modal */}
      {viewingPayload && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" />
                Payload JSON Enviado a n8n
              </h3>
              <button
                onClick={() => setViewingPayload(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="flex-1 p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-y-auto leading-relaxed">
              {JSON.stringify(viewingPayload, null, 2)}
            </pre>

            <div className="pt-3 border-t border-slate-100 mt-3 flex justify-end">
              <button
                onClick={() => setViewingPayload(null)}
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
