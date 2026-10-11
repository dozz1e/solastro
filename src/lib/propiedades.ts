import type { Propiedad } from "@interfaces/Propiedad";
import type { PropiedadBusqueda } from "@lib/buscador";

const GRAPHQL_URL = "https://marsolpropiedades.cl/data/graphql";
const POR_PAGINA = 100;
const INTENTOS = 3;

const QUERY = `query Propiedades($after: String) {
  propiedades(where: {categoryId: 2}, first: ${POR_PAGINA}, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
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
}`;

interface Pagina {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: Propiedad[];
}

const errorWordPress = (detalle: string) =>
  new Error(
    `[propiedades] No se pudieron obtener las propiedades desde WordPress (${GRAPHQL_URL}).\n${detalle}`,
  );

// Una sola consulta: valida HTTP, que la respuesta sea JSON y que no traiga errores de GraphQL
const consultarPagina = async (after: string | null): Promise<Pagina> => {
  let response: Response;
  try {
    response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { after } }),
    });
  } catch (error) {
    const causa = (error as { cause?: { code?: string } }).cause?.code;
    throw errorWordPress(
      `Error de red: ${(error as Error).message}${causa ? ` (${causa})` : ""}`,
    );
  }

  const texto = await response.text();
  if (!response.ok) {
    throw errorWordPress(
      `El servidor respondió ${response.status} ${response.statusText}.\nInicio de la respuesta: ${texto.slice(0, 200)}`,
    );
  }

  let datos;
  try {
    datos = JSON.parse(texto);
  } catch {
    throw errorWordPress(
      `La respuesta no es JSON (Content-Type: ${response.headers.get("content-type")}). ` +
        `Puede ser una página de error, mantenimiento o del firewall.\nInicio de la respuesta: ${texto.slice(0, 200)}`,
    );
  }

  if (datos.errors?.length) {
    throw errorWordPress(
      `GraphQL devolvió errores: ${datos.errors.map((e: { message: string }) => e.message).join("; ")}`,
    );
  }
  if (!Array.isArray(datos.data?.propiedades?.nodes)) {
    throw errorWordPress("La respuesta no trae data.propiedades.nodes.");
  }
  return datos.data.propiedades;
};

// Reintenta fallas pasajeras (red, 5xx, respuesta HTML) antes de cortar el build
const consultarConReintentos = async (after: string | null) => {
  for (let intento = 1; ; intento++) {
    try {
      return await consultarPagina(after);
    } catch (error) {
      if (intento >= INTENTOS) throw error;
      console.warn(
        `${(error as Error).message}\nReintentando (${intento}/${INTENTOS - 1})...`,
      );
      await new Promise((r) => setTimeout(r, 2000 * intento));
    }
  }
};

// Recorre todas las páginas: ya no hay un tope fijo de 100 propiedades
const obtenerPropiedades = async (): Promise<Propiedad[]> => {
  const todas: Propiedad[] = [];
  let after: string | null = null;
  do {
    const pagina = await consultarConReintentos(after);
    todas.push(...pagina.nodes);
    after = pagina.pageInfo.hasNextPage ? pagina.pageInfo.endCursor : null;
  } while (after);

  if (todas.length === 0) {
    throw errorWordPress(
      "La consulta no devolvió ninguna propiedad. Se detiene el build para no publicar el sitio vacío.",
    );
  }
  return todas;
};

const propiedades = await obtenerPropiedades();

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
