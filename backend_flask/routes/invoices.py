from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from datetime import datetime, timedelta
from ..models import db, Invoice, InvoiceItem, Customer, Product, InventoryMovement
from ..services.mail_service import MailService
import requests  # Librería necesaria para conectarse con n8n

invoices_bp = Blueprint('invoices', __name__, url_prefix='/invoices')

# ==========================================
# FUNCIÓN DE INTEGRACIÓN MANUAL CON N8N
# ==========================================
def enviar_factura_a_n8n(invoice, customer):
    """
    Empaqueta los datos puros de la factura y del cliente desde la base 
    de datos y los envía automáticamente mediante HTTP POST a n8n.
    """
    url_n8n = "https://n8n.cloud"
    
    # Estructuramos el JSON con los datos exactos de tus modelos
    datos_factura = {
        "numero_factura": invoice.invoice_number,
        "fecha_creacion": invoice.created_at.strftime('%Y-%m-%d %H:%M:%S') if hasattr(invoice, 'created_at') and invoice.created_at else datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "cliente": {
            "nombre": customer.name,
            "email": customer.email,
            "telefono": getattr(customer, 'phone', 'No registrado')
        },
        "total_factura": float(invoice.total_amount) if hasattr(invoice, 'total_amount') else 0.0,
        "productos": []
    }
    
    # Si la factura tiene artículos asociados en el modelo InvoiceItem, los añadimos a la lista
    if hasattr(invoice, 'items') and invoice.items:
        for item in invoice.items:
            datos_factura["productos"].append({
                "nombre": item.product.name if hasattr(item, 'product') else "Producto",
                "cantidad": item.quantity,
                "precio_unitario": float(item.price)
            })

    try:
        # Hacemos el disparo HTTP POST hacia tu webhook manual de n8n
        respuesta = requests.post(url_n8n, json=datos_factura, timeout=10)
        if respuesta.status_code == 200:
            print(f"--> [n8n] Factura {invoice.invoice_number} procesada con éxito por el Webhook.")
        else:
            print(f"--> [n8n] Error en el servidor de automatización. Código: {respuesta.status_code}")
    except Exception as e:
        print(f"--> [n8n] No se pudo establecer conexión con n8n. Detalles: {e}")


# ==========================================
# RUTAS DEL SISTEMA DE FACTURACIÓN
# ==========================================

@invoices_bp.route('/')
@login_required
def list_invoices():
    invoices = Invoice.query.order_by(Invoice.id.desc()).all()
    return render_template('invoices/list.html', invoices=invoices)

@invoices_bp.route('/<int:id>')
@login_required
def view_invoice(id):
    invoice = Invoice.query.get_or_404(id)
    return render_template('invoices/view.html', invoice=invoice)

@invoices_bp.route('/<int:id>/send-email', methods=['POST'])
@login_required
def send_email(id):
    invoice = Invoice.query.get_or_404(id)
    customer = invoice.customer
    
    # Procesar el envío normal por el servicio local de correo de Flask
    success = MailService.send_invoice_email(invoice, customer)
    
    if success:
        invoice.sent_via_email = True
        db.session.commit()
        
        # ⚡ ACTIVACIÓN MANUAL EN TIEMPO REAL PARA N8N ⚡
        # Se ejecuta justo aquí de manera limpia usando los datos reales de tu base de datos
        enviar_factura_a_n8n(invoice, customer)
        
        flash(f'Factura {invoice.invoice_number} enviada a {customer.email} por Gmail SMTP y sincronizada en n8n.', 'success')
    else:
        flash('No se pudo enviar el correo. Revisa la configuración SMTP en .env', 'danger')
        
    return redirect(url_for('invoices.view_invoice', id=invoice.id))