import os
from flask import Flask
from flask_login import LoginManager
from .config import Config, DevelopmentConfig, ProductionConfig
from .models import db, User

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicializar Base de Datos SQLAlchemy
    db.init_app(app)

    # Inicializar Flask-Login
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Por favor inicia sesión para acceder a Infinity-2TB.'
    login_manager.login_message_category = 'warning'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Registrar Blueprints Modulares
    from .routes.auth import auth_bp
    from .routes.dashboard import dashboard_bp
    from .routes.inventory import inventory_bp
    from .routes.customers import customers_bp
    from .routes.invoices import invoices_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(customers_bp)
    app.register_blueprint(invoices_bp)

    # Crear tablas al iniciar la aplicación si no existen
    with app.app_context():
        db.create_all()
        # Sembrar usuario administrador por defecto si la base está vacía
        if not User.query.filter_by(email='admin@infinity2tb.com').first():
            admin = User(name='Administrador Infinity-2TB', email='admin@infinity2tb.com', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
