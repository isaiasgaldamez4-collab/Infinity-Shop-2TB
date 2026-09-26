from datetime import datetime
from . import db

class InventoryMovement(db.Model):
    __tablename__ = 'inventory_movements'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # 'entrada', 'salida', 'venta', 'devolucion', 'ajuste', 'correccion'
    type = db.Column(db.String(30), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    previous_stock = db.Column(db.Integer, nullable=False)
    new_stock = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='movements')

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else '',
            'product_sku': self.product.sku if self.product else '',
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else '',
            'type': self.type,
            'quantity': self.quantity,
            'previous_stock': self.previous_stock,
            'new_stock': self.new_stock,
            'reason': self.reason,
            'notes': self.notes,
            'date': self.created_at.strftime('%Y-%m-%d') if self.created_at else None,
            'time': self.created_at.strftime('%H:%M') if self.created_at else None
        }
