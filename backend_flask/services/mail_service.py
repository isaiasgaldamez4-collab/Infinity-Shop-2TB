import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

class MailService:
    """
    Servicio de despacho de correo electrónico real utilizando SMTP (Gmail).
    Soporta autenticación segura TLS y envío de facturas en HTML corporativo.
    """

    @staticmethod
    def send_email(to_email: str, subject: str, html_body: str, text_body: str = None) -> bool:
        server_host = current_app.config.get('MAIL_SERVER', 'smtp.gmail.com')
        port = current_app.config.get('MAIL_PORT', 587)
        username = current_app.config.get('MAIL_USERNAME')
        password = current_app.config.get('MAIL_PASSWORD')
        sender = current_app.config.get('MAIL_DEFAULT_SENDER', username)
        use_tls = current_app.config.get('MAIL_USE_TLS', True)

        if not username or not password:
            current_app.logger.warning("No se han configurado MAIL_USERNAME o MAIL_PASSWORD en el archivo .env")
            return False

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = sender
            msg['To'] = to_email

            if text_body:
                msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
            if html_body:
                msg.attach(MIMEText(html_body, 'html', 'utf-8'))

            # Conectar al servidor SMTP
            server = smtplib.SMTP(server_host, port, timeout=10)
            server.ehlo()
            if use_tls:
                server.starttls()
                server.ehlo()

            server.login(username, password)
            server.sendmail(sender, [to_email], msg.as_string())
            server.quit()
            current_app.logger.info(f"Correo enviado exitosamente a {to_email}")
            return True
        except Exception as e:
            current_app.logger.error(f"Error al enviar correo SMTP a {to_email}: {str(e)}")
            return False

    @staticmethod
    def send_invoice_email(invoice, customer):
        subject = f"[Infinity-2TB] Factura Digital {invoice.invoice_number}"
        
        items_html = "".join([
            f"<tr>"
            f"<td style='padding: 8px; border-bottom: 1px solid #e2e8f0;'>{item.product_name}</td>"
            f"<td style='padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;'>{item.quantity}</td>"
            f"<td style='padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;'>${item.unit_price:,.2f}</td>"
            f"<td style='padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;'>${item.subtotal:,.2f}</td>"
            f"</tr>"
            for item in invoice.items
        ])

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 24px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px;">Infinity-2TB</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #bfdbfe;">Comprobante Digital de Facturación</p>
            </div>
            
            <div style="padding: 24px;">
              <p>Estimado(a) <strong>{customer.name}</strong>,</p>
              <p>Adjuntamos el detalle de su factura digital <strong>{invoice.invoice_number}</strong> emitida con fecha <strong>{invoice.date}</strong>.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px;">
                <thead>
                  <tr style="background: #f1f5f9; text-align: left;">
                    <th style="padding: 8px;">Concepto</th>
                    <th style="padding: 8px; text-align: center;">Cant.</th>
                    <th style="padding: 8px; text-align: right;">Unitario</th>
                    <th style="padding: 8px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items_html}
                </tbody>
              </table>
              
              <div style="margin-top: 16px; text-align: right; font-size: 14px;">
                <p style="margin: 4px 0;">Subtotal: <strong>${invoice.subtotal:,.2f}</strong></p>
                <p style="margin: 4px 0;">IVA (16%): <strong>${invoice.tax_amount:,.2f}</strong></p>
                <h3 style="margin: 8px 0 0 0; color: #1e3a8a; font-size: 18px;">TOTAL: ${invoice.total:,.2f} MXN</h3>
              </div>
            </div>
            
            <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b;">
              Infinity-2TB — Sistema Empresarial de Inventario & Facturación.<br>
              Este es un correo automático. Para dudas comunícate con nosotros.
            </div>
          </div>
        </body>
        </html>
        """

        return MailService.send_email(customer.email, subject, html_body)
