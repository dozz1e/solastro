# MarSol Propiedades

Sitio web de [MarSol Propiedades](https://marsolpropiedades.cl): compra, venta y arriendo de propiedades.

Es un sitio estático hecho con [Astro](https://astro.build), Tailwind CSS 4 y daisyUI 5. Las propiedades se administran en WordPress y se leen por GraphQL al compilar.

## Comandos

Desde la raíz del proyecto:

| Comando        | Acción                                              |
| :------------- | :-------------------------------------------------- |
| `pnpm install` | Instala las dependencias                            |
| `pnpm dev`     | Servidor de desarrollo en `http://localhost:4321`   |
| `pnpm build`   | Genera el sitio de producción en `./dist/`          |
| `pnpm preview` | Sirve el build localmente para revisarlo            |

## De dónde salen los datos

- **Propiedades:** WordPress headless, en `https://marsolpropiedades.cl/data/graphql`. La consulta está en [`src/lib/propiedades.ts`](src/lib/propiedades.ts): recorre todas las páginas, reintenta fallas pasajeras y detiene el build con un mensaje claro si WordPress no responde bien.
- **Imágenes y videos:** se sirven desde `https://marsolpropiedades.cl/images/propiedades/<slug>/` y `/videos/propiedades/<slug>/`, no desde este repo.
- **UF y dólar:** [mindicador.cl](https://mindicador.cl), consultado en el navegador.
- **Formulario de contacto:** se envía a `https://marsolpropiedades.cl/data/correo.php`.

Como el sitio es estático, **un cambio en WordPress se ve recién después de volver a compilar y publicar**.

## Mapas y coordenadas

Las coordenadas de cada propiedad se calculan al compilar con [Nominatim](https://nominatim.org) (OpenStreetMap), en [`src/lib/geocodificar.ts`](src/lib/geocodificar.ts), y se guardan en [`src/data/coordenadas.json`](src/data/coordenadas.json). Ese archivo se versiona, así que los builds siguientes no dependen de Nominatim.

- Solo se consultan las direcciones que no están en la caché. La primera vez el build tarda más, porque Nominatim permite una petición por segundo.
- Si Nominatim no encuentra una dirección, la propiedad se muestra en el centro de su ciudad. Para corregirla, pon las coordenadas a mano en `coordenadas.json`, usando como clave la dirección tal como aparece ahí. El build no sobrescribe entradas existentes.
- Para forzar una nueva búsqueda, borra la entrada (o el archivo completo).
- Los departamentos con dirección encontrada llevan pin exacto; las casas y locales, un círculo aproximado de 100 m.

## Estructura

```text
src/
├── components/
│   ├── inicio/        Portada, buscador y secciones del home
│   ├── propiedad/     Ficha de una propiedad (imágenes, mapa, detalles)
│   ├── propiedades/   Listado
│   └── extras/        Piezas compartidas (formulario, buscador lateral, etc.)
├── data/              Caché de coordenadas
├── interfaces/        Tipos de TypeScript
├── layouts/           Layout general y de propiedad
├── lib/               Datos y lógica: propiedades, buscador, geocodificación
├── pages/             Rutas del sitio
└── styles/            CSS global (Tailwind + daisyUI)
```

### Rutas

| Ruta                   | Página                               |
| :--------------------- | :----------------------------------- |
| `/`                    | Inicio                               |
| `/propiedades`         | Listado con buscador                 |
| `/propiedades/[slug]`  | Ficha de una propiedad               |
| `/mapa/[slug]`         | Mapa a pantalla completa             |
| `/nosotros`            | Nosotros                             |
| `/servicios`           | Servicios                            |
| `/contacto`            | Contacto                             |

## Skills de Claude Code

En `.agents/skills` hay skills de diseño (impeccable, taste-skill, animaciones, etc.), registrados en `skills-lock.json`. Claude Code los carga desde `.claude/skills`, que se enlaza localmente y no se versiona.
