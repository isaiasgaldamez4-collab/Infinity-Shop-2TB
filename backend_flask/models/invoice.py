from datetime import datetime
from . import db

class Invoice(db.Model):
    __tablename__ = 'invoices'

    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    due_date = db.Column(db.Date, nullable=False)
    subtotal = db.Column(db.Float, nullable=False, default=0.0)
    tax_rate = db.Column(db.Float, nullable=False, default=0.16)
    tax_amount = db.Column(db.Float, nullable=False, default=0.0)
    discount = db.Column(db.Float, nullable=False, default=0.0)
    total = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(30), default='emitida', nullable=False) # 'emitida', 'pagada', 'cancelada', 'pendiente'
    payment_method = db.Column(db.String(40), default='transferencia', nullable=False)
    notes = db.Column(db.Text, nullable=True)
    sent_via_email = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to invoice items
    items = db.relationship('InvoiceItem', backref='invoice', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'customer_id': self.customer_id,
            'customer_name': self.customer.name if self.customer else '',
            'customer_tax_id': self.customer.tax_id if self.customer else '',
            'date': self.date.strftime('%Y-%m-%d') if self.date else None,
            'due_date': self.due_date.strftime('%Y-%m-%d') if self.due_date else None,
            'subtotal': self.subtotal,
            'tax_amount': self.tax_amount,
            'discount': self.discount,
            'total': self.total,
            'status': self.status,
            'payment_method': self.payment_method,
            'sent_via_email': self.sent_via_email,
            'items': [item.to_dict() for item in self.items]
        }

class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'

    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    product_sku = db.Column(db.String(50), nullable=False)
    product_name = db.Column(db.String(150), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    unit_price = db.Column(db.Float, nullable=False, default=0.0)
    subtotal = db.Column(db.Float, nullable=False, default=0.0)

    product = db.relationship('Product')

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_sku': self.product_sku,
            'product_name': self.product_name,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'subtotal': self.subtotal
        }
