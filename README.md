# INFINITY-2TB — Sistema Profesional de Gestión de Inventario y Facturación

> Sistema web profesional, seguro, moderno y completo de inventario y facturación electrónica, preparado para empresas reales con roles de usuario, kardex de auditoría, catálogo de almacén y despacho de correos electrónicos reales vía Gmail SMTP.

---

## 🌟 Módulos Implementados

### 1. Panel Principal (Dashboard Ejecutivo)
- **KPIs en tiempo real**:
  - Total de productos en catálogo.
  - Productos con poco inventario (punto de reorden).
  - Productos agotados (Stock 0).
  - Ventas del día y ventas del mes.
  - Total de facturas emitidas y clientes registrados.
  - Usuarios del sistema (Admin, Empleados, Clientes).
  - Valuación monetaria total del almacén (costo vs venta vs margen).
- **Tablas de auditoría**: Últimas facturas emitidas y movimientos recientes de inventario.

### 2. Autenticación y Control de Permisos
- Sistema de usuarios con roles:
  - **Administrador**: Control total del sistema, roles, inventario, configuración SMTP y finanzas.
  - **Empleado / Operativo**: Gestión operativa de productos, stock, ventas, clientes y facturas.
  - **Cliente**: Consulta de historial de compras, facturas descargables e información de contacto.
- Contraseñas protegidas mediante hash (compatibles con `generate_password_hash` de Werkzeug en Python).
- Perfil de usuario con cambio de contraseña y datos personales.

### 3. Inventario Completo
- Campos por producto: ID, Código/SKU, Nombre, Descripción, Categoría, Marca, Precio de compra, Precio de venta, Cantidad disponible, Stock mínimo, Unidad de medida, Imagen, Estado (Activo, Inactivo, Descontinuado), Fechas de creación y actualización.
- Búsqueda en tiempo real, filtros por categoría y condición de stock (bajo, agotado, normal), ordenación dinámica.
- Modal de ajuste rápido de existencias (conteo físico, entrada, salida, devolución).
- Exportación del catálogo a formato `.csv`.

### 4. Movimientos de Inventario (Kardex Contable)
- Registro automático e inmutable de movimientos:
  - **Entrada** (Recepción de lotes / compras)
  - **Salida** (Mermas / uso interno)
  - **Venta** (Deducción automática por factura)
  - **Devolución** (Reingreso de clientes)
  - **Ajuste** (Conteo físico)
  - **Corrección**
- Guarda producto, usuario responsable, cantidad, saldo anterior, saldo nuevo, motivo, observaciones, fecha y hora.
- Exportación a `.csv` para auditoría y contabilidad.

### 5. Directorio y Gestión de Clientes
- Datos: Nombre completo, Empresa/Razón Social, Identificación Fiscal (RFC/Tax ID), Teléfono, Correo electrónico, Dirección, Ciudad, País, Estado.
- Historial de compras acumuladas y detalle de todas las facturas emitidas al cliente.

### 6. Facturación Digital Profesional
- Emisión de facturas electrónicas con folio correlativo (`FAC-2026-XXXX`).
- Autocompletado de productos con validación estricta de existencias en almacén.
- Cálculo automático de subtotal, IVA (16%), descuentos y total.
- Formato imprimible oficial con identidad corporativa de **Infinity-2TB**.
- Envío directo de la factura al correo del cliente.

### 7. Correos Electrónicos Reales (Gmail SMTP)
- Configuración de correo real con servidor `smtp.gmail.com`, puerto `587`, STARTTLS.
- Soporte para variables de entorno mediante `.env`.
- Asistente explicativo para generar la **Contraseña de Aplicación de 16 caracteres de Google**.
- Herramienta de prueba de conexión en vivo y registro de auditoría de correos enviados.

### 8. Backend Modular en Python / Flask / SQLAlchemy
En la carpeta `/backend_flask/` se encuentra el código completo en Python listo para ejecutar en producción:
- `app.py`: Factory de la aplicación y registro de Blueprints.
- `config.py`: Configuración mediante `.env` (Desarrollo y Producción).
- `models/`: Modelos SQLAlchemy (`User`, `Product`, `InventoryMovement`, `Customer`, `Invoice`).
- `routes/`: Blueprints (`auth`, `dashboard`, `inventory`, `customers`, `invoices`).
- `services/mail_service.py`: Despacho SMTP real con `smtplib`.
- `requirements.txt`: Dependencias para Python 3.10+.

---

## 🚀 Despliegue en Vercel (Frontend Web)

1. Sube tu código a GitHub:
   ```bash
   git add .
   git commit -m "feat: Infinity-2TB sistema profesional de inventario y facturación"
   git push origin main
   ```
2. Importa el repositorio en [vercel.com](https://vercel.com).
3. Vercel detectará la configuración de `vercel.json` y compilará la aplicación automáticamente.
4. En **Settings > Domains**, asigna tu dominio propio (ejemplo: `tudominio.com`).

---

## 🐍 Ejecución del Backend en Python Flask

```bash
# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 2. Instalar dependencias
pip install -r backend_flask/requirements.txt

# 3. Configurar variables de entorno
cp backend_flask/.env.example backend_flask/.env

# 4. Iniciar servidor Flask
python -m backend_flask.app
```
Acceso en: `http://localhost:5000`  
- **Admin**: `admin@infinity2tb.com` / `admin123`  
- **Empleado**: `empleado@infinity2tb.com` / `empleado123`  
- **Cliente**: `cliente@infinity2tb.com` / `cliente123`
