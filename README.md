# Pantalla Londres

PWA de pantalla ambiental para una tablet Android en orientación horizontal. Muestra el tiempo actual y el pronóstico de Londres, la hora local de Londres y la hora de Colombia. No necesita base de datos, cuentas ni claves de API.

## Ejecutar en local

Requiere Node.js 20.9 o posterior.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. El service worker se desactiva durante el desarrollo para evitar caché antiguo. Para probar el PWA de producción:

```bash
npm run build
npm start
```

El bloqueo de pantalla requiere HTTPS o `localhost` y puede ser rechazado por el navegador, el modo de ahorro de batería o la configuración del dispositivo.

## Comprobaciones

```bash
npm run lint
npm run test
npm run build
```

## Desplegar en Vercel

1. Importa este repositorio como un nuevo proyecto en Vercel.
2. Deja el framework en **Next.js** y el comando de compilación en `npm run build`.
3. No añadas variables de entorno: Open-Meteo no necesita clave para esta aplicación.
4. Despliega. Vercel proporciona el HTTPS necesario para la instalación y Screen Wake Lock.

La aplicación usa únicamente renderizado y datos en el navegador; no depende de un proceso Node.js permanente.

## Instalar en Android

1. Abre la URL HTTPS desplegada en Chrome.
2. En el menú de Chrome, elige **Instalar aplicación** o **Añadir a pantalla de inicio**.
3. Abre **Pantalla Londres** desde el icono instalado y gira la tablet a horizontal.
4. Si aparece **Iniciar pantalla**, tócala una vez para autorizar el bloqueo de pantalla.
5. Desactiva la optimización agresiva de batería para Chrome o la PWA si el fabricante sigue apagando la pantalla.

El manifiesto usa `display: standalone` y orientación horizontal, por lo que la instalación se abre sin la barra normal del navegador.

## Cambiar las imágenes ambientales

Sustituye los cuatro archivos WebP manteniendo sus nombres:

- `public/backgrounds/morning.webp`
- `public/backgrounds/day.webp`
- `public/backgrounds/evening.webp`
- `public/backgrounds/night.webp`

Se recomienda una proporción 16:9 y al menos 2048×1152 px. Para cambiar nombres o rutas, edita `backgrounds` en `src/config/dashboard.ts`. Los periodos predeterminados de Londres son mañana 05:00, día 11:00, tarde 17:00 y noche 21:00.

## Cambiar la ubicación del tiempo

Edita `location` en `src/config/dashboard.ts`:

```ts
location: {
  name: "Londres",
  latitude: 51.5072,
  longitude: -0.1276,
  timezone: "Europe/London",
}
```

El intervalo meteorológico se configura con `weatherRefreshMs`; el valor predeterminado es 20 minutos. El último pronóstico correcto se conserva en `localStorage` y se reutiliza cuando no hay conexión.

La zona horaria de Colombia está configurada como `America/Bogota`. Ambas horas se calculan con `Intl.DateTimeFormat`, por lo que el horario de verano británico se aplica automáticamente.
