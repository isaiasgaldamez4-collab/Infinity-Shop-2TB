from flask import Blueprint, render_template
from flask_login import login_required, current_user
from datetime import datetime
from ..models import Product, Customer, Invoice, InventoryMovement, User

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/')
@dashboard_bp.route('/dashboard')
@login_required
def index():
    # Métricas requeridas por el Prompt Maestro
    total_products = Product.query.count()
    low_stock_products = Product.query.filter(Product.stock > 0, Product.stock <= Product.min_stock).all()
    out_of_stock_products = Product.query.filter(Product.stock == 0).all()

    today = datetime.utcnow().date()
    today_invoices = Invoice.query.filter_by(date=today).filter(Invoice.status != 'cancelada').all()
    today_sales = sum(inv.total for inv in today_invoices)

    month_invoices = Invoice.query.filter(Invoice.status != 'cancelada').all()
    month_sales = sum(inv.total for inv in month_invoices)

    invoices_count = Invoice.query.count()
    customers_count = Customer.query.count()
    users_count = User.query.count()

    recent_invoices = Invoice.query.order_by(Invoice.id.desc()).limit(5).all()
    recent_movements = InventoryMovement.query.order_by(InventoryMovement.id.desc()).limit(6).all()

    return render_template(
        'dashboard/index.html',
        total_products=total_products,
        low_stock_count=len(low_stock_products),
        out_of_stock_count=len(out_of_stock_products),
        today_sales=today_sales,
        month_sales=month_sales,
        invoices_count=invoices_count,
        customers_count=customers_count,
        users_count=users_count,
        recent_invoices=recent_invoices,
        recent_movements=recent_movements
    )
