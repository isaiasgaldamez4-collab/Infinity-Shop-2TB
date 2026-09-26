from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .product import Product
from .movement import InventoryMovement
from .customer import Customer
from .invoice import Invoice, InvoiceItem
