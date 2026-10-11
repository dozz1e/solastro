import type { Propiedad } from "@interfaces/Propiedad";
import type { PropiedadBusqueda } from "@lib/buscador";

const response = await fetch("https://marsolpropiedades.cl/data/graphql", {
  method: "POST",

  headers: {
    "Content-Type": "application/json",
  },

  body: JSON.stringify({
    query: `{
      propiedades(where: {categoryId: 2}, first: 100) {
        nodes {
          title
          slug
          precio {
            precio
            precioUf
          }
          operacion {
            operacion
          }
          incluye {
            incluye
          }
          espaciosComunes {
            espaciosComunes
          }
          direccion {
            ciudad
            direccion
          }
          detallesAdicionales {
            detalles
          }
          datos {
            areaTotal
            banos
            habitaciones
            galeria
            video
            urlVideo
            estacionamiento
            bodega
          }
          categoriaGraphql {
            categoria
          }
          seo {
            metaKeywords
            metaDesc
            title
          }
          categories {
            nodes {
              categoryId
            }
          }
        }
      }
    }`,
  }),
});

if (!response.ok) throw new Error("Problemas con la conexión");
const datos = await response.json();
const propiedades = datos.data.propiedades.nodes;

const destacadas = propiedades.filter((pp: Propiedad) => {
  if (pp.categories.nodes.some((cat) => cat.categoryId === 11)) return pp;
  return false;
});

const nuevas = propiedades.slice(0, 8);

let categoria = propiedades.map(
  (pp: Propiedad) => pp.categoriaGraphql.categoria[0],
);
categoria = [...new Set(categoria)];

let ciudad = propiedades.map((pp: Propiedad) => pp.direccion.ciudad);
ciudad = [...new Set(ciudad)];

let tags = [...categoria, "Venta", "Arriendo"];

export { propiedades, destacadas, nuevas, categoria, ciudad, tags };

// Versión reducida para los buscadores: se embebe como JSON en el HTML
const propiedadesBusqueda: PropiedadBusqueda[] = propiedades.map(
  (pp: Propiedad) => ({
    slug: pp.slug.replace(/^\//, ""),
    title: pp.title,
    categoria: pp.categoriaGraphql.categoria[0],
    ciudad: pp.direccion.ciudad,
    operacion: pp.operacion.operacion,
    precio: pp.precio.precio,
    precioUf: pp.precio.precioUf,
    areaTotal: pp.datos.areaTotal,
    banos: pp.datos.banos,
    habitaciones: pp.datos.habitaciones,
    estacionamiento: pp.datos.estacionamiento,
    bodega: pp.datos.bodega,
  }),
);

// Seguro para incrustar dentro de <script type="application/json">
const propiedadesBusquedaJson = JSON.stringify(propiedadesBusqueda).replace(
  /</g,
  "\u003c",
);

export { propiedadesBusqueda, propiedadesBusquedaJson };
