# InfinityShop-2TB — Sistema de Compras, Inventario y Kardex

> **"Un sistema de compras y inventario para ver cómo funciona todo el sistema"**  
> Diseñado para práctica contable, operativa y administrativa en entornos técnicos y comerciales (2TB).

---

## 🌟 Características Principales

1. **Dashboard y Métricas en Tiempo Real**:
   - Valuación total del inventario en almacén monetario.
   - Detección inmediata de existencias por debajo del stock mínimo y punto de reorden.
   - Flujo visual interactivo de los 5 pasos del ciclo comercial.
2. **Catálogo y Control Físico de Almacén**:
   - Gestión por SKU, código de barras, categorías y ubicaciones físicas.
   - Barra visual de nivel de stock (mínimo, reorden y capacidad máxima).
   - Exportación completa del catálogo a formato `.csv`.
3. **Módulo de Compras y Directorio de Proveedores**:
   - Emisión de Órdenes de Compra (OC) con cálculo de IVA (16%) y descuentos.
   - Botón de recepción directa en almacén que actualiza el inventario físico al instante.
   - Enlace directo con **n8n** para despachar facturas por correo o Telegram.
4. **Tarjeta Kardex Contable de Almacén**:
   - Valuación por **Costo Promedio Ponderado** y **PEPS / FIFO**.
   - Registro de entradas, salidas, saldos acumulados e historial de auditoría contable.
   - Exportación de la tarjeta Kardex a archivo `.csv`.
5. **Simulador de Ventas y Punto de Venta (POS)**:
   - Registro de tickets de venta con deducción en tiempo real del stock.
   - Determinación del Costo de Ventas (COGS) y Utilidad Bruta generada.
   - Impresión de tickets de venta y envío a n8n.
6. **Centro de Aprendizaje 2TB**:
   - Simulador comparativo de métodos de valuación (Promedio vs PEPS).
   - Calculadora de Punto de Reorden (ROP) y Stock de Seguridad.
7. **Integración con n8n (Facturas por Email y Telegram)**:
   - Envío automático de facturas de compra y tickets de venta vía Webhook de n8n.
   - Enrutamiento inteligente a **Telegram Bot** o **Email (Gmail/SMTP)**.
   - Historial de eventos enviados e inspector de JSON.

---

## 🚀 Despliegue en Vercel con Dominio Propio

El proyecto cuenta con el archivo de configuración `vercel.json` optimizado para aplicaciones SPA en Vite.

### Paso 1: Subir tus cambios a tu repositorio de GitHub

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar repositorio git (si no está iniciado)
git init

# Agregar todos los archivos
git add .

# Crear el commit
git commit -m "feat: InfinityShop-2TB con integración Vercel y n8n"

# Conectar con tu repositorio de GitHub (reemplaza con tu URL)
git branch -M main
git remote add origin https://github.com/isaiasgaldamez4-collab/InfinityShop-2TB.git

# Subir los cambios a GitHub
git push -u origin main --force
```

### Paso 2: Importar el proyecto en Vercel

1. Inicia sesión en [vercel.com](https://vercel.com) con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Selecciona tu repositorio: `InfinityShop-2TB`.
4. Vercel detectará automáticamente:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Haz clic en **"Deploy"**. Tu aplicación estará en línea en segundos.

### Paso 3: Configurar tu Dominio Propio en Vercel

1. Dentro del panel de tu proyecto en Vercel, ve a **Settings** > **Domains**.
2. Escribe tu nombre de dominio (ejemplo: `tudominio.com` o `shop.tudominio.com`) y haz clic en **Add**.
3. Vercel te mostrará los registros DNS que debes configurar en tu proveedor de dominio (GoDaddy, Namecheap, Cloudflare, etc.):
   - **Para dominio principal (`tudominio.com`)**:
     - Tipo: `A` | Nombre: `@` | Valor: `76.76.21.21`
   - **Para subdominio (`www.tudominio.com` o `app.tudominio.com`)**:
     - Tipo: `CNAME` | Nombre: `www` o `app` | Valor: `cname.vercel-dns.com`
4. Una vez agregados los registros, Vercel verificará la propagación y emitirá un certificado SSL HTTPS gratuito automáticamente.

---

## ⚡ Automatización con n8n (Facturas por Email y Telegram)

La aplicación envía un paquete JSON estructurado al webhook de tu instancia de n8n cada vez que:
- Emites o recibes una **Factura / Orden de Compra**.
- Realizas una **Venta en el Simulador POS**.
- Las existencias caen a niveles de **Stock Bajo / Reorden**.

### 1. Configurar tu Webhook en la App
Ve a la pestaña **"Automatización n8n"** dentro de la barra de navegación de InfinityShop y escribe:
- **URL del Webhook de n8n**: `https://tu-n8n.com/webhook/infinityshop-facturas`
- **Canal preferido**: `Ambos (Email + Telegram)`, `Solo Email` o `Solo Telegram`.
- **Correo Destinatario**: Tu correo donde quieres recibir las facturas.
- **Chat ID de Telegram**: Tu Chat ID o canal.

### 2. Cómo obtener tu Chat ID de Telegram:
1. Crea un bot con [@BotFather](https://t.me/BotFather) en Telegram usando `/newbot` y guarda el token.
2. Inicia un chat con tu bot o agrégalo a un grupo o canal.
3. Para saber tu Chat ID numérico, escribe un mensaje a [@userinfobot](https://t.me/userinfobot) o consulta `https://api.telegram.org/bot<TU_TOKEN>/getUpdates`.

### 3. Plantilla de Workflow para n8n:
Copia el JSON disponible en la pestaña **"Automatización n8n"** del sistema y pégalo directamente en tu lienzo de n8n (<kbd>Ctrl + V</kbd>).

El flujo se compone de:
1. **Webhook Node (POST)**: Recibe el payload JSON.
2. **Switch Node**: Enruta según el canal (`telegram`, `email`, o `both`).
3. **Telegram Node**: Envía el mensaje con Markdown elegante y lista de artículos.
4. **Email Node (Gmail/SMTP)**: Envía la factura con asunto formateado.

---

## 💻 Ejecución en Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en puerto 3000
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación
npm run preview
```

---

## 📄 Licencia

Desarrollado para fines educativos y empresariales — Bachillerato Técnico 2TB.
