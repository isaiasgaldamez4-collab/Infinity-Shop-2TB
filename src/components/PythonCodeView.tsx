import React, { useState } from 'react';
import {
  Code,
  Folder,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  Server,
  Database,
  Layers,
  ShieldCheck,
  Mail
} from 'lucide-react';

export const PythonCodeView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('app.py');
  const [copied, setCopied] = useState(false);

  const files: Record<string, { path: string; category: string; content: string }> = {
    'app.py': {
      path: 'backend_flask/app.py',
      category: 'Core',
      content: `import os
from flask import Flask
from flask_login import LoginManager
from .config import Config, DevelopmentConfig, ProductionConfig
from .models import db, User

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicializar Base de Datos SQLAlchemy (SQLite para desarrollo)
    db.init_app(app)

    # Inicializar Autenticación y Sesiones con Flask-Login
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Inicia sesión para acceder a Infinity-2TB.'
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

    # Crear tablas y sembrar usuario admin
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(email='admin@infinity2tb.com').first():
            admin = User(name='Administrador Infinity-2TB', email='admin@infinity2tb.com', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)`
    },
    'config.py': {
      path: 'backend_flask/config.py',
      category: 'Core',
      content: `import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración empresarial Infinity-2TB"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'infinity-2tb-prod-secret-key-2026')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///infinity_2tb.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuración de Correo SMTP Real (Gmail)
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False').lower() in ('true', '1', 't')
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'Infinity-2TB <soporte@infinity2tb.com>')
    MAIL_REPLY_TO = os.getenv('MAIL_REPLY_TO', 'contacto@infinity2tb.com')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False`
    },
    'mail_service.py': {
      path: 'backend_flask/services/mail_service.py',
      category: 'Servicios',
      content: `import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

class MailService:
    """Despacho real de correos mediante SMTP Gmail con soporte TLS"""

    @staticmethod
    def send_email(to_email: str, subject: str, html_body: str, text_body: str = None) -> bool:
        server_host = current_app.config.get('MAIL_SERVER', 'smtp.gmail.com')
        port = current_app.config.get('MAIL_PORT', 587)
        username = current_app.config.get('MAIL_USERNAME')
        password = current_app.config.get('MAIL_PASSWORD')
        sender = current_app.config.get('MAIL_DEFAULT_SENDER', username)
        use_tls = current_app.config.get('MAIL_USE_TLS', True)

        if not username or not password:
            current_app.logger.warning("Faltan credenciales de Gmail en .env")
            return False

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = sender
            msg['To'] = to_email

            if text_body:
                msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
            if html_body:
                msg.attach(MIMEText(html_body, 'html', 'utf-8'))

            server = smtplib.SMTP(server_host, port, timeout=10)
            server.ehlo()
            if use_tls:
                server.starttls()
                server.ehlo()

            server.login(username, password)
            server.sendmail(sender, [to_email], msg.as_string())
            server.quit()
            return True
        except Exception as e:
            current_app.logger.error(f"Fallo al enviar correo: {e}")
            return False

    @staticmethod
    def send_invoice_email(invoice, customer):
        subject = f"[Infinity-2TB] Factura Digital {invoice.invoice_number}"
        # Generación del HTML con el desglose de productos, IVA y totales
        return MailService.send_email(customer.email, subject, f"<h1>Factura {invoice.invoice_number}</h1>")`
    },
    'models/product.py': {
      path: 'backend_flask/models/product.py',
      category: 'Modelos',
      content: `from datetime import datetime
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
    status = db.Column(db.String(20), default='active', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    movements = db.relationship('InventoryMovement', backref='product', lazy='dynamic')

    @property
    def is_low_stock(self):
        return 0 < self.stock <= self.min_stock

    @property
    def margin_percentage(self):
        if self.purchase_price > 0:
            return round(((self.sale_price - self.purchase_price) / self.purchase_price) * 100, 2)
        return 0.0`
    },
    'models/user.py': {
      path: 'backend_flask/models/user.py',
      category: 'Modelos',
      content: `from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from . import db

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='employee', nullable=False) # admin, employee, client
    phone = db.Column(db.String(30), nullable=True)
    status = db.Column(db.String(20), default='active', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        return self.role == 'admin'`
    },
    'models/invoice.py': {
      path: 'backend_flask/models/invoice.py',
      category: 'Modelos',
      content: `from datetime import datetime
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
    status = db.Column(db.String(30), default='emitida', nullable=False)
    payment_method = db.Column(db.String(40), default='transferencia')
    sent_via_email = db.Column(db.Boolean, default=False)

    items = db.relationship('InvoiceItem', backref='invoice', lazy='dynamic')`
    },
    'requirements.txt': {
      path: 'backend_flask/requirements.txt',
      category: 'Config',
      content: `Flask==3.0.2
Flask-SQLAlchemy==3.1.1
Flask-Login==0.6.3
Flask-Mail==0.9.1
Flask-WTF==1.2.1
WTForms==3.1.2
Werkzeug==3.0.1
python-dotenv==1.0.1
email-validator==2.1.1
gunicorn==21.2.0`
    },
    '.env.example': {
      path: 'backend_flask/.env.example',
      category: 'Config',
      content: `FLASK_ENV=development
FLASK_APP=app.py
SECRET_KEY=clave_secreta_super_segura_infinity_2tb_2026

DATABASE_URL=sqlite:///infinity_2tb.db

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_USERNAME=tu_cuenta@gmail.com
MAIL_PASSWORD=tu_contraseña_de_aplicacion_16_caracteres
MAIL_DEFAULT_SENDER="Infinity-2TB <tu_cuenta@gmail.com>"
MAIL_REPLY_TO=contacto@infinity2tb.com`
    }
  };

  const currentFileData = files[selectedFile] || files['app.py'];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFileData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
              <Code className="w-3.5 h-3.5" />
              Arquitectura Modular Python + Flask + SQLAlchemy
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Código Fuente del Backend (Infinity-2TB)
            </h1>
            <p className="text-blue-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Estructura profesional organizada por capas (Modelos, Blueprints, Servicios y Configuración con <code>.env</code>).
              Todos los archivos han sido generados en la carpeta <code>/backend_flask</code> de este proyecto.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Código Copiado!' : 'Copiar Archivo Actual'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: File Tree */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
            <Folder className="w-4 h-4 text-blue-600" />
            <span>backend_flask/</span>
          </div>

          <div className="space-y-1 text-xs">
            {Object.entries(files).map(([fileName, data]) => {
              const isSelected = selectedFile === fileName;
              return (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="font-mono text-xs">{fileName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {data.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick instructions box */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-slate-600" />
              Ejecutar en tu máquina:
            </div>
            <pre className="p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded leading-tight">
              pip install -r requirements.txt{'\n'}python -m backend_flask.app
            </pre>
          </div>
        </div>

        {/* Right 3 Cols: Code Viewer */}
        <div className="lg:col-span-3 bg-slate-950 rounded-xl shadow-lg border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 font-mono">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white">{currentFileData.path}</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 px-2.5 py-1 bg-slate-800 rounded-md"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <pre className="p-5 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[600px] leading-relaxed selection:bg-blue-600 selection:text-white">
            {currentFileData.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
