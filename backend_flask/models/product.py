from datetime import datetime
from . import db

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(80), nullable=False, default='General')
    brand = db.Column(db.String(80), nullable=False, default='Genérica')
    purchase_price = db.Column(db.Float, nullable=False, default=0.0)
    sale_price = db.Column(db.Float, nullable=False, default=0.0)
    stock = db.Column(db.Integer, nullable=False, default=0)
    min_stock = db.Column(db.Integer, nullable=False, default=5)
    unit = db.Column(db.String(30), nullable=False, default='Pieza')
    image_url = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), default='active', nullable=False) # 'active', 'inactive', 'discontinued'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    movements = db.relationship('InventoryMovement', backref='product', lazy='dynamic', cascade='all, delete-orphan')

    @property
    def is_low_stock(self):
        return 0 < self.stock <= self.min_stock

    @property
    def is_out_of_stock(self):
        return self.stock == 0

    @property
    def margin_percentage(self):
        if self.purchase_price > 0:
            return round(((self.sale_price - self.purchase_price) / self.purchase_price) * 100, 2)
        return 0.0

    def to_dict(self):
        return {
            'id': self.id,
            'sku': self.sku,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'brand': self.brand,
            'purchase_price': self.purchase_price,
            'sale_price': self.sale_price,
            'stock': self.stock,
            'min_stock': self.min_stock,
            'unit': self.unit,
            'image_url': self.image_url,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d') if self.updated_at else None
        }
