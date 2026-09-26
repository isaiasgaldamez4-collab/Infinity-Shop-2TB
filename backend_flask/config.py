import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

class Config:
    """Configuración base para el sistema Infinity-2TB."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'infinity-2tb-default-key-change-in-prod')
    
    # Base de datos SQLite por defecto en la raíz de la app
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
    DEBUG = False
