from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from ..models import db, Customer

customers_bp = Blueprint('customers', __name__, url_prefix='/customers')

@customers_bp.route('/')
@login_required
def list_customers():
    search = request.args.get('q', '').strip()
    query = Customer.query
    if search:
        query = query.filter(Customer.name.ilike(f'%{search}%') | Customer.tax_id.ilike(f'%{search}%'))
    customers = query.order_by(Customer.name.asc()).all()
    return render_template('customers/list.html', customers=customers)

@customers_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    if request.method == 'POST':
        customer = Customer(
            name=request.form['name'],
            company=request.form.get('company'),
            tax_id=request.form['tax_id'].upper(),
            email=request.form['email'],
            phone=request.form['phone'],
            address=request.form['address'],
            city=request.form['city'],
            country=request.form.get('country', 'México')
        )
        db.session.add(customer)
        db.session.commit()
        flash('Cliente registrado exitosamente.', 'success')
        return redirect(url_for('customers.list_customers'))

    return render_template('customers/form.html', customer=None)
