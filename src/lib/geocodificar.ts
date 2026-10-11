// Geocodificación en tiempo de build con caché en disco.
// Nominatim pide máximo 1 petición por segundo y un User-Agent identificable:
// https://operations.osmfoundation.org/policies/nominatim/
// La caché se versiona en git para que los builds no dependan de Nominatim.
// Para forzar una nueva búsqueda, borrar la entrada (o el archivo).
import fs from "node:fs";
import path from "node:path";

export interface Coordenadas {
  lat: number;
  lon: number;
  // "direccion": se encontró la calle; "ciudad": solo el centro de la ciudad
  precision: "direccion" | "ciudad";
}

const CACHE_PATH = path.resolve(process.cwd(), "src/data/coordenadas.json");
const USER_AGENT = "MarSolPropiedades/1.0 (+https://marsolpropiedades.cl)";
const ESPERA_MS = 1100;

type Cache = Record<string, { lat: number; lon: number } | null>;

const leerCache = (): Cache => {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
};

// Se relee en cada consulta para que las ediciones a mano se vean sin reiniciar el dev server
let cache: Cache = {};

const guardarCache = () => {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  const ordenado = Object.fromEntries(
    Object.entries(cache).sort(([a], [b]) => a.localeCompare(b, "es")),
  );
  fs.writeFileSync(CACHE_PATH, JSON.stringify(ordenado, null, 2) + "\n");
};

// Quita número de depto/oficina, "#" y espacios repetidos
const limpiarDireccion = (direccion: string) =>
  direccion
    .replace(
      /\s(of|oficina|depto|dpto|departamento|local|casa|sitio|lote|block|torre)\.?\s*[\w-]*/gi,
      "",
    )
    .replace(/#/g, "")
    .replace(/\s+,/g, ",")
    .replace(/\s+/g, " ")
    .trim();

let ultimaPeticion = 0;
// Serializa las peticiones aunque varias páginas pidan coordenadas a la vez
let cola: Promise<unknown> = Promise.resolve();

const buscarEnNominatim = (consulta: string) => {
  const tarea = cola.then(async () => {
    const espera = ultimaPeticion + ESPERA_MS - Date.now();
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    ultimaPeticion = Date.now();

    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=cl&q=" +
      encodeURIComponent(consulta);
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "es" },
    });
    if (!res.ok) throw new Error(`Nominatim respondió ${res.status}`);
    const datos = await res.json();
    return datos.length > 0
      ? { lat: parseFloat(datos[0].lat), lon: parseFloat(datos[0].lon) }
      : null;
  });
  cola = tarea.catch(() => {});
  return tarea;
};

const buscar = async (consulta: string) => {
  if (consulta in cache) return cache[consulta];
  try {
    const resultado = await buscarEnNominatim(consulta);
    cache[consulta] = resultado;
    guardarCache();
    return resultado;
  } catch (error) {
    // Sin red o Nominatim caído: no se guarda en caché para reintentar en el próximo build
    console.warn(`[geocodificar] No se pudo buscar "${consulta}":`, error);
    return null;
  }
};

export const obtenerCoordenadas = async (
  direccion: string | undefined,
  ciudad: string | undefined,
): Promise<Coordenadas | null> => {
  cache = leerCache();
  if (direccion && ciudad) {
    const exacta = await buscar(`${limpiarDireccion(direccion)}, ${ciudad}, Chile`);
    if (exacta) return { ...exacta, precision: "direccion" };
  }
  if (ciudad) {
    const centro = await buscar(`${ciudad}, Chile`);
    if (centro) return { ...centro, precision: "ciudad" };
  }
  return null;
};
