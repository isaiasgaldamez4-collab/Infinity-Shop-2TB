# Infinity-2TB — Backend Python / Flask / SQLAlchemy

Sistema modular empresarial de gestión de inventario, kardex, clientes y facturación con soporte para correo real Gmail SMTP.

## 📁 Arquitectura del Proyecto

```text
backend_flask/
├── app.py                  # Factory de aplicación Flask y registro de Blueprints
├── config.py               # Configuración basada en clases (.env)
├── requirements.txt        # Dependencias de producción
├── .env.example            # Plantilla de variables de entorno
├── models/                 # Modelos de Base de Datos SQLAlchemy
│   ├── __init__.py
│   ├── user.py             # Autenticación, roles y contraseñas hasheadas
│   ├── product.py          # Productos, precios, stock mínimo y categorías
│   ├── movement.py         # Kardex de auditoría (entradas, salidas, ajustes)
│   ├── customer.py         # Clientes y datos fiscales
│   └── invoice.py          # Facturas electrónicas e ítems
├── routes/                 # Blueprints de rutas modulares
│   ├── auth.py             # Login, logout y registro
│   ├── dashboard.py        # Métricas empresariales y KPIs
│   ├── inventory.py        # CRUD y control de existencias
│   ├── customers.py        # Gestión de cartera de clientes
│   └── invoices.py         # Facturación y despacho de correos
└── services/
    └── mail_service.py     # Despacho de correos SMTP con Gmail TLS
```

## 🚀 Instalación y Puesta en Marcha

1. **Crear entorno virtual**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

2. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales de Gmail SMTP
   ```

4. **Ejecutar servidor**:
   ```bash
   python -m backend_flask.app
   ```
   Accede a `http://localhost:5000` con:
   - **Usuario**: `admin@infinity2tb.com`
   - **Contraseña**: `admin123`
