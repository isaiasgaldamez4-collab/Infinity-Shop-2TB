from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from ..models import db, Product, InventoryMovement

inventory_bp = Blueprint('inventory', __name__, url_prefix='/inventory')

@inventory_bp.route('/')
@login_required
def list_products():
    search = request.args.get('q', '').strip()
    category = request.args.get('category', '')
    stock_filter = request.args.get('stock', '')

    query = Product.query
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%') | Product.sku.ilike(f'%{search}%'))
    if category:
        query = query.filter_by(category=category)
    if stock_filter == 'low':
        query = query.filter(Product.stock > 0, Product.stock <= Product.min_stock)
    elif stock_filter == 'out':
        query = query.filter(Product.stock == 0)

    products = query.order_by(Product.name.asc()).all()
    categories = [c[0] for c in db.session.query(Product.category).distinct()]

    return render_template('inventory/list.html', products=products, categories=categories)

@inventory_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    if request.method == 'POST':
        product = Product(
            sku=request.form['sku'].upper(),
            name=request.form['name'],
            description=request.form.get('description', ''),
            category=request.form.get('category', 'General'),
            brand=request.form.get('brand', 'Genérica'),
            purchase_price=float(request.form.get('purchase_price', 0)),
            sale_price=float(request.form.get('sale_price', 0)),
            stock=int(request.form.get('stock', 0)),
            min_stock=int(request.form.get('min_stock', 5)),
            unit=request.form.get('unit', 'Pieza')
        )
        db.session.add(product)
        db.session.commit()

        # Registrar movimiento inicial
        if product.stock > 0:
            mov = InventoryMovement(
                product_id=product.id,
                user_id=current_user.id,
                type='entrada',
                quantity=product.stock,
                previous_stock=0,
                new_stock=product.stock,
                reason='Alta de producto e inventario inicial'
            )
            db.session.add(mov)
            db.session.commit()

        flash(f'Producto {product.sku} registrado exitosamente.', 'success')
        return redirect(url_for('inventory.list_products'))

    return render_template('inventory/form.html', product=None)
