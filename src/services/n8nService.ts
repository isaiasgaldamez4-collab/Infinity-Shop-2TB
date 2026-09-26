import { N8nConfig, N8nEventLog, N8nEventType, N8nChannel } from '../types/n8n';
import { PurchaseOrder, SaleTransaction, Product } from '../types/inventory';

const CONFIG_STORAGE_KEY = 'inf_n8n_config';
const LOGS_STORAGE_KEY = 'inf_n8n_logs';

export const DEFAULT_N8N_CONFIG: N8nConfig = {
  webhookUrl: 'https://n8n.example.com/webhook/infinityshop-facturas',
  enabled: true,
  sendPurchases: true,
  sendSales: true,
  sendLowStockAlerts: true,
  preferredChannel: 'both',
  emailRecipient: 'contabilidad@infinityshop.com',
  telegramChatId: '@InfinityShopNotificacionesBot',
};

export const getN8nConfig = (): N8nConfig => {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_N8N_CONFIG;
  } catch {
    return DEFAULT_N8N_CONFIG;
  }
};

export const saveN8nConfig = (config: N8nConfig): void => {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
};

export const getN8nLogs = (): N8nEventLog[] => {
  try {
    const saved = localStorage.getItem(LOGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const clearN8nLogs = (): void => {
  localStorage.removeItem(LOGS_STORAGE_KEY);
};

export const addN8nLog = (log: N8nEventLog): void => {
  try {
    const current = getN8nLogs();
    const updated = [log, ...current].slice(0, 50); // Keep last 50 logs
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving n8n log:', e);
  }
};

/**
 * Sends structured JSON payload to the user-configured n8n Webhook URL.
 * Also formats ready-to-use Telegram text and Email HTML for the n8n nodes.
 */
export const sendToN8n = async (
  eventType: N8nEventType,
  rawPayload: Record<string, any>,
  overrideChannel?: N8nChannel
): Promise<{ success: boolean; message: string; log: N8nEventLog }> => {
  const config = getN8nConfig();
  const channel = overrideChannel || config.preferredChannel;
  const now = new Date().toISOString();

  // Create human-friendly summaries & formatted payloads for Telegram and Email
  let summary = '';
  let telegramFormattedText = '';
  let emailSubject = '';

  if (eventType === 'INVOICE_PURCHASE') {
    const po = rawPayload as PurchaseOrder;
    summary = `Factura de Compra ${po.orderNumber} - ${po.supplierName} ($${po.total.toFixed(2)})`;
    emailSubject = `[InfinityShop] Factura de Compra ${po.orderNumber} - ${po.supplierName}`;
    telegramFormattedText = `🧾 *NUEVA FACTURA DE COMPRA - INFINITYSHOP*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *Folio:* \`${po.orderNumber}\`\n` +
      `🏢 *Proveedor:* ${po.supplierName} (${po.supplierTaxId})\n` +
      `📅 *Fecha:* ${po.date} | *Entrega:* ${po.expectedDate}\n` +
      `💰 *Subtotal:* $${po.subtotal.toFixed(2)}\n` +
      `🏷️ *IVA (16%):* $${po.tax.toFixed(2)}\n` +
      `💵 *TOTAL:* *$${po.total.toFixed(2)}*\n` +
      `📌 *Estado:* ${po.status} | *Pago:* ${po.paymentStatus}\n` +
      (po.invoiceFolio ? `📄 *Factura Externa:* ${po.invoiceFolio}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛒 *Artículos (${po.items.length}):*\n` +
      po.items.map(i => `• ${i.quantity}x ${i.productName} ($${i.unitCost.toFixed(2)} c/u) = $${i.subtotal.toFixed(2)}`).join('\n');
  } else if (eventType === 'INVOICE_SALE') {
    const sale = rawPayload as SaleTransaction;
    summary = `Factura / Ticket de Venta ${sale.ticketNumber} - ${sale.customerName} ($${sale.total.toFixed(2)})`;
    emailSubject = `[InfinityShop] Comprobante de Venta ${sale.ticketNumber} - ${sale.customerName}`;
    telegramFormattedText = `🛍️ *NUEVA VENTA / FACTURA EMITIDA - INFINITYSHOP*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎟️ *Ticket:* \`${sale.ticketNumber}\`\n` +
      `👤 *Cliente:* ${sale.customerName}\n` +
      `💳 *Forma de Pago:* ${sale.paymentMethod}\n` +
      `📅 *Fecha:* ${sale.date}\n` +
      `💰 *Subtotal:* $${sale.subtotal.toFixed(2)}\n` +
      `🏷️ *IVA (16%):* $${sale.tax.toFixed(2)}\n` +
      `💵 *TOTAL COBRADO:* *$${sale.total.toFixed(2)}*\n` +
      `📈 *Utilidad Bruta:* +$${sale.grossProfit.toFixed(2)}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *Detalle de Artículos:*\n` +
      sale.items.map(i => `• ${i.quantity}x ${i.productName} a $${i.unitPrice.toFixed(2)} = $${i.subtotal.toFixed(2)}`).join('\n');
  } else if (eventType === 'STOCK_ALERT') {
    const products = rawPayload.products as Product[];
    summary = `Alerta: ${products.length} productos con stock crítico/bajo`;
    emailSubject = `⚠️ [ALERTA] Productos con stock bajo en Almacén InfinityShop`;
    telegramFormattedText = `⚠️ *ALERTA DE INVENTARIO CRÍTICO - INFINITYSHOP*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Hay *${products.length} productos* en o por debajo del stock mínimo de seguridad:\n\n` +
      products.map(p => `🔴 *${p.name}* (SKU: \`${p.sku}\`)\n   Existencia: *${p.currentStock} ${p.unit}s* | Mínimo: ${p.minStock} | Reorden: ${p.reorderPoint}`).join('\n\n') +
      `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔔 *Acción requerida:* Generar orden de compra a proveedores.`;
  } else {
    summary = 'Prueba de Conexión Webhook n8n (Test Ping)';
    emailSubject = `[InfinityShop] Test de Conexión n8n Webhook exitoso`;
    telegramFormattedText = `🤖 *TEST DE CONEXIÓN CON N8N EXITOSO*\n` +
      `El sistema InfinityShop-2TB se ha conectado correctamente al webhook de n8n.\n` +
      `Fecha de prueba: ${new Date().toLocaleString('es-MX')}`;
  }

  const n8nEnvelope = {
    source: 'InfinityShop-2TB',
    eventType,
    timestamp: now,
    targetChannel: channel,
    recipient: {
      email: config.emailRecipient,
      telegramChatId: config.telegramChatId,
    },
    message: {
      subject: emailSubject,
      telegramText: telegramFormattedText,
      summary,
    },
    data: rawPayload,
  };

  const destination = channel === 'both'
    ? `Email: ${config.emailRecipient} & Telegram: ${config.telegramChatId}`
    : channel === 'email'
    ? `Email: ${config.emailRecipient}`
    : `Telegram: ${config.telegramChatId}`;

  // Check if webhook is a placeholder or invalid
  const isMockUrl = !config.webhookUrl || config.webhookUrl.includes('example.com') || !config.webhookUrl.startsWith('http');

  if (isMockUrl) {
    const simulatedLog: N8nEventLog = {
      id: `n8n-${Date.now()}`,
      timestamp: now.replace('T', ' ').substring(0, 19),
      eventType,
      targetChannel: channel,
      destination,
      status: 'simulated',
      summary,
      payload: n8nEnvelope,
      responseMessage: 'Simulación exitosa: Configura tu URL real de n8n en el panel de integración para enviar peticiones HTTP reales.',
    };
    addN8nLog(simulatedLog);
    return {
      success: true,
      message: `Evento simulado y registrado en el historial de n8n (${channel.toUpperCase()}).`,
      log: simulatedLog,
    };
  }

  // Real HTTP dispatch to n8n webhook
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-InfinityShop-Source': 'InfinityShop-2TB-App',
      },
      body: JSON.stringify(n8nEnvelope),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const statusText = res.ok ? 'success' : 'failed';
    const respMsg = `HTTP ${res.status}: ${res.statusText}`;

    const realLog: N8nEventLog = {
      id: `n8n-${Date.now()}`,
      timestamp: now.replace('T', ' ').substring(0, 19),
      eventType,
      targetChannel: channel,
      destination,
      status: statusText,
      summary,
      payload: n8nEnvelope,
      responseMessage: respMsg,
    };

    addN8nLog(realLog);

    return {
      success: res.ok,
      message: res.ok
        ? `Factura/Notificación enviada con éxito a n8n (${respMsg}).`
        : `Error al enviar a n8n: ${respMsg}`,
      log: realLog,
    };
  } catch (err: any) {
    const errorLog: N8nEventLog = {
      id: `n8n-${Date.now()}`,
      timestamp: now.replace('T', ' ').substring(0, 19),
      eventType,
      targetChannel: channel,
      destination,
      status: 'failed',
      summary,
      payload: n8nEnvelope,
      responseMessage: err?.message || 'Error de conexión de red',
    };

    addN8nLog(errorLog);

    return {
      success: false,
      message: `Error al conectar con n8n: ${err?.message || 'Error de red'}. El evento quedó guardado en el log local.`,
      log: errorLog,
    };
  }
};
