# 💊 Remedios de Amparo

App web para seguir el tratamiento de la receta del 21 nov 2026, toma por toma, y marcar lo que ya se dio.
Funciona en el teléfono, se instala en la pantalla de inicio y sirve sin internet.

---

## ¿Qué hace?

| Sección | Para qué sirve |
|---|---|
| **Ahora** | La próxima toma en grande. Tocas cada remedio cuando lo das, o "Marcar como dado" para todos juntos. |
| **Día a día** | Todas las horas del día elegido. Los días con tomas atrasadas se marcan en rojo. |
| **Tratamiento** | Cada remedio con su dosis, horario, cuándo termina y cuánto falta. |
| **Ajustes** | Alarmas en el calendario, fecha de inicio, respaldo, tema claro u oscuro y borrar marcas. |

Detalles útiles:

- Si te equivocas al marcar, aparece **Deshacer** abajo durante unos segundos.
- Los nasales se numeran (1º, 2º, 3º) para darlos en el orden correcto.
- **Agregar alarmas al calendario** descarga un archivo con todas las tomas pendientes. Al abrirlo, el teléfono las agrega al calendario con aviso. Es la forma más confiable de que suene aunque la app esté cerrada.

---

## Archivos

```
Mis-remedios/
├── receta.js              ← remedios, dosis, horarios y fecha de inicio (lo único que se edita)
├── index.html             ← estructura de la página
├── estilos.css            ← colores y diseño
├── app.js                 ← funcionamiento (marcar, calendario, respaldo, avisos)
├── sw.js                  ← permite instalarla y usarla sin internet
├── manifest.webmanifest   ← nombre e ícono al instalarla
├── icon-512.png           ← ícono
├── robots.txt             ← evita que aparezca en Google
├── vercel.json            ← configuración para Vercel
└── .github/workflows/
    └── pages.yml          ← publicación automática en GitHub Pages
```

---

## Publicarla

Elige **una** de las dos opciones. Las dos son gratis.

### Opción A · Vercel (recomendada)

1. Entra a [vercel.com](https://vercel.com) con tu cuenta de GitHub.
2. **Add New → Project** y elige el repo `Mis-remedios`.
3. Deja todo como viene (Framework: *Other*, sin comando de build) y toca **Deploy**.
4. Queda en una dirección tipo `https://mis-remedios.vercel.app`.

Desde ahí, cada cambio que subas a `main` se publica solo en menos de un minuto.

### Opción B · GitHub Pages

1. En el repo, ve a **Settings → Pages**.
2. En **Source** elige **GitHub Actions** (solo la primera vez).
3. Sube cualquier cambio a `main`, o en la pestaña **Actions** abre *Publicar en GitHub Pages* y toca **Run workflow**.
4. Queda en `https://rebolledoayarza-eng.github.io/Mis-remedios/`.

El flujo revisa que no falte ningún archivo antes de publicar; si algo está mal, no publica y lo verás en rojo en **Actions**.

> La app no aparece en buscadores, pero cualquiera que tenga el enlace puede abrirla. Compártelo solo con quien cuida a Amparo.

---

## Instalar en el teléfono

- **iPhone:** abre el enlace en Safari → **Compartir** → **Agregar a inicio**.
- **Android:** abre el enlace en Chrome → menú **⋮** → **Instalar app**.

---

## Cambiar la receta

Abre `receta.js` (en GitHub: el archivo → ícono del lápiz ✏️) y cambia la línea del remedio:

```js
{ id: 'cefa', n: 'Cefadroxilo 500 mg', d: '1 cápsula · oral', h: [1, 13], days: 14 },
//  id: código corto, no cambiarlo una vez en uso
//  n: nombre · d: dosis · h: horas del día (0–23) · days: días de tratamiento
```

Para agregar un remedio, copia una línea, ponle un `id` nuevo y guarda con **Commit changes**. Vercel o GitHub Pages lo publican solos.

La fecha de inicio también se puede cambiar desde la app, en **Ajustes → Inicio del tratamiento**.

---

## Bueno saber

- Lo que marcas se guarda **en el teléfono** (no en un servidor). Si van a marcar dos personas, o vas a cambiar de teléfono, usa **Ajustes → Respaldo** para pasar las marcas de uno a otro.
- Los avisos dentro de la app solo funcionan con la app abierta. Para alarmas seguras, usa **Agregar alarmas al calendario**.
- Si cambias la receta después de agregar las alarmas, borra los eventos viejos del calendario y vuelve a agregarlos.
