# ElectroTransfer

**Generador de Layouts Bancarios para BBVA**

ElectroTransfer es una aplicación de escritorio diseñada para facilitar la creación de archivos de pagos masivos (Layouts) para la banca en línea de BBVA. Esta herramienta permite capturar, validar y exportar transferencias de manera segura y sin errores manuales.

---

## 🚀 Funcionalidades Principales

- **Generación de Archivos TXT**: Crea archivos listos para subir al portal bancario cumpliendo con todas las especificaciones de BBVA.
- **Validación Automática**: Detecta errores comunes al instante (cuentas incorrectas, caracteres inválidos, montos erróneos).
- **Soporte Total**: Compatible con transferencias a cuentas BBVA (Mismo Banco) y a otros bancos (SPEI).
- **Importación Masiva**: Carga listados completos desde **Excel** (.xlsx) o **CSV** para no capturar una por una.
- **Modo Oscuro y Claro**: La aplicación se adapta automáticamente a la apariencia de tu sistema Windows.
- **Seguridad y Privacidad**: Todo el procesamiento se realiza en tu computadora. No se envían datos a internet.

---

## 📥 Guía de Instalación (Para Usuarios)

Sigue estos pasos sencillos para instalar la aplicación en tu computadora:

1.  **Localizar el Instalador**: Busca el archivo llamado `ElectroTransfer Setup 2.0.0.exe` (ubicado generalmente en la carpeta `dist` si te enviaron el proyecto, o donde lo hayas descargado).
2.  **Instalar**: Haz doble clic sobre el archivo `.exe`.
3.  **Listo**: La instalación es automática. Verás un icono de "ElectroTransfer" en tu escritorio.
4.  **Ejecutar**: Abre la aplicación y comienza a trabajar.

---

## 🛠️ Guía Técnica (Para Desarrolladores)

Si deseas modificar el código o generar una nueva versión del instalador, sigue estos pasos:

### 1. Requisitos

Asegúrate de tener instalado **Node.js** en tu equipo.

### 2. Instalación de Librerías

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

### 3. Comandos Disponibles

- **Iniciar en modo prueba**:

  ```bash
  npm run dev
  ```

  _Abre la aplicación en modo desarrollo para hacer cambios._

- **Generar Instalador (.exe)**:
  ```bash
  npm run build:win
  ```
  _Este comando creará el archivo instalador en la carpeta `dist`, listo para distribuir._

---

## 👨‍💻 Créditos

Desarrollado por **GanzytoX** - 2026.
Construido con tecnología moderna para garantizar rapidez y estabilidad: Electron, React y TypeScript.
