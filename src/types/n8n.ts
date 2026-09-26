export type N8nChannel = 'both' | 'email' | 'telegram';

export interface N8nConfig {
  webhookUrl: string;
  enabled: boolean;
  sendPurchases: boolean;
  sendSales: boolean;
  sendLowStockAlerts: boolean;
  preferredChannel: N8nChannel;
  emailRecipient: string;
  telegramChatId: string;
}

export type N8nEventType =
  | 'INVOICE_PURCHASE'
  | 'INVOICE_SALE'
  | 'STOCK_ALERT'
  | 'TEST_PING';

export interface N8nEventLog {
  id: string;
  timestamp: string;
  eventType: N8nEventType;
  targetChannel: N8nChannel;
  destination: string;
  status: 'success' | 'failed' | 'simulated';
  summary: string;
  payload: Record<string, any>;
  responseMessage?: string;
}
