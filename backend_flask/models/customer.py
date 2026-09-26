from datetime import datetime
from . import db

class Customer(db.Model):
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    company = db.Column(db.String(150), nullable=True)
    tax_id = db.Column(db.String(50), nullable=False, index=True) # RFC, NIT, CIF
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(40), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    country = db.Column(db.String(60), nullable=False, default='México')
    status = db.Column(db.String(20), default='active', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    invoices = db.relationship('Invoice', backref='customer', lazy='dynamic')

    @property
    def total_purchased(self):
        return sum(inv.total for inv in self.invoices if inv.status != 'cancelada')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'company': self.company,
            'tax_id': self.tax_id,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d') if self.created_at else None,
            'total_purchased': self.total_purchased,
            'invoices_count': self.invoices.count()
        }
