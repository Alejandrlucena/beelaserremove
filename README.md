# Bee Laser Remove

Web estática de Bee Laser Remove, estudio especializado en eliminación de tatuajes y micropigmentación con tecnología Pico Láser en Móstoles, Madrid.

## Estructura

- `index.html` — página principal.
- `aviso-legal.html` — aviso legal.
- `privacidad.html` — política de privacidad.
- `css/styles.css` — estilos del sitio.
- `css/legal.css` — estilos de las páginas legales.
- `js/config.js` — datos de contacto editables.
- `js/main.js` — renderizado de contacto, menú, acordeones y animaciones.
- `js/hero3d.js` — abeja 3D del hero con Three.js.
- `js/bee-shape.js` — silueta vectorial utilizada por la abeja 3D.
- `assets/` — logotipos, favicons, fuentes, imagen social y Three.js.
- `robots.txt` y `sitemap.xml` — archivos para buscadores.

## Editar los datos de contacto

Abre `js/config.js` y modifica solo los valores entre comillas:

- `email`
- `phone`
- `whatsapp`
- `instagram`
- `studioAddress`
- `mapsUrl`
- `hours`

Los cambios se aplican en la web automáticamente al recargar.

## Ver la web en local

Desde la carpeta del proyecto:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Después abre `http://127.0.0.1:4173/`.

## Publicar en GitHub Pages

1. Sube el contenido de esta carpeta a un repositorio de GitHub.
2. En el repositorio, entra en **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda y espera a que GitHub publique la web.

El archivo `.nojekyll` ya está incluido para que GitHub Pages sirva todos los archivos sin procesarlos con Jekyll.

## SEO y dominio

La web está preparada con:

- Título de marca «Bee Láser Remove | Eliminación de tatuajes» y descripción orientada a la eliminación de tatuajes en Móstoles.
- Open Graph y Twitter Card.
- Datos estructurados `LocalBusiness`, `Service`, `WebSite` y `FAQPage`.
- Dirección, teléfono, email, coordenadas y enlace a Google Maps.
- `robots.txt` y `sitemap.xml`.

El dominio provisional usado en `canonical`, `og:url`, `sitemap.xml` y en los datos estructurados es:

```text
https://beelaserremove.com/
```

Si el dominio final es otro, hay que reemplazarlo en:

- `index.html` (`canonical`, `og:url`, `og:image`, `twitter:image` y JSON-LD).
- `sitemap.xml`.
- `robots.txt` (solo la línea del sitemap).

Después, da de alta la web en [Google Search Console](https://search.google.com/search-console) y envía el sitemap.

## Datos pendientes de confirmar

- Email definitivo.
- NIF o nombre legal de la titular.
- Horario de atención.
- Dominio final.

Mientras no se confirmen, el email `hola@beelaserremove.com`, el horario «Atención exclusiva con cita previa» y el dominio `beelaserremove.com` funcionan como valores provisionales.
