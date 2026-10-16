# Gestor de Gastos - Aplicación Web Progresiva (PWA)

Una Progressive Web App (PWA) moderna, rápida y completamente funcional tanto en línea como fuera de línea (offline) para la gestión de finanzas y control de gastos personales.

🚀 **Demo en Vivo (GitHub Pages):** [https://ddarturo.github.io/AplicacionWebProgresiva/](https://ddarturo.github.io/AplicacionWebProgresiva/)

---

## ✨ Características Principales

- **📱 Experiencia PWA Instalable:** Cumple con el estándar de PWA mediante `manifest.json` y `sw.js`, permitiendo su instalación como aplicación nativa en dispositivos móviles (Android/iOS) y de escritorio.
- **⚡ Funcionamiento Offline Total:**
  - **Service Worker (`sw.js`):** Implementa estrategia *Network First* con soporte de respaldo en caché para cargar todos los recursos estáticos sin conexión a internet.
  - **IndexedDB:** Base de datos relacional/NoSQL en el navegador (`ExpensesDB`) para almacenar y persistir los gastos de forma local y segura.
  - **LocalStorage:** Persistencia instantánea del saldo inicial del usuario.
- **🎨 Diseño Moderno y Responsive:**
  - Estética *Glassmorphism* (efectos de desenfoque y translucidez).
  - Interfaz adaptativa optimizada para smartphones, tablets y pantallas de escritorio.
  - Accesibilidad (`ARIA roles`, contrastes y soporte para lectores de pantalla).
- **📶 Indicador de Conectividad en Tiempo Real:** Detección automática del estado de red (`En línea` / `Sin conexión`) con avisos interactivos (toasts).
- **📊 Gestión de Saldo y Operaciones:**
  - Registro de gastos con descripción y monto.
  - Cálculo dinámico de saldo restante en tiempo real.
  - Eliminación individual de gastos con actualización automática de saldo.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Semántica, soporte accesible y configuración de viewport.
- **CSS3:** Variables CSS (`:root`), Flexbox, CSS Grid, media queries y efectos de desenfoque (`backdrop-filter`).
- **JavaScript (ES6+):** Programación asíncrona, manipulación del DOM y eventos de conectividad (`online`/`offline`).
- **Service Workers & Cache API:** Interceptación de peticiones de red y almacenamiento en caché local.
- **IndexedDB API:** Persistencia local y consultas sobre base de datos cliente.

---

## 📂 Estructura del Proyecto

```text
AplicacionWebProgresiva/
├── index.html       # Estructura principal de la aplicación y maquetado
├── style.css        # Estilos, temas, variables y diseño responsive
├── script.js       # Lógica de la aplicación, IndexedDB y eventos
├── sw.js           # Service Worker para capacidades offline y gestión de caché
├── manifest.json   # Configuración de metadatos de la PWA (nombre, tema, iconos)
├── .gitignore      # Archivos ignorados por Git
└── README.md       # Documentación del proyecto
```

---

## 💻 Ejecución Local

Para probar la aplicación en tu entorno local con soporte completo para Service Workers (que requieren un servidor HTTP/HTTPS):

```bash
# Opción con npx (Node.js)
npx serve .

# Opción con Python 3
python3 -m http.server 8080
```

Luego abre en tu navegador: `http://localhost:8080` (o el puerto indicado).
