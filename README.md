# Remedios de Amparo

App web para seguir el tratamiento de la receta del 21 nov 2026: horarios de 00:00 a 23:59, toma por toma, para ir marcando lo que ya se dio.

## Archivos

- `index.html`: toda la app (HTML, CSS y JS en un solo archivo)
- `manifest.webmanifest`, `icon-512.png`: para instalarla en el inicio del teléfono
- `sw.js`: service worker (instalación, uso sin internet y avisos)

## Publicar con GitHub Pages

1. Crea un repo nuevo, por ejemplo `remedios-amparo`.
2. Sube los 5 archivos a la raíz del repo, en la rama `main`.
3. Ve a **Settings → Pages → Source: Deploy from a branch → main / (root)** y guarda.
4. En 1 o 2 minutos queda publicada en `https://<tu-usuario>.github.io/remedios-amparo/`.

Para publicar con Vercel: **Add New → Project**, importas el repo y le das **Deploy**. No necesita configuración.

## Instalar en el iPhone

Ábrela en Safari y ve a **Compartir → Agregar a inicio**.

## Notas

- Lo que marcas se guarda en el navegador del teléfono (localStorage), no en un servidor, así que conviene marcar siempre desde el mismo teléfono.
- Para cambiar remedios u horarios, edita el arreglo `MEDS` al principio del `<script>` en `index.html`.
- La fecha de inicio del tratamiento se cambia en la app, en "Ajustes y avisos".
- Los avisos del navegador solo funcionan con la app abierta. Para tener alarmas confiables, usa los eventos del calendario del teléfono.
