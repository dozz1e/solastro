// Lógica de búsqueda del lado del cliente.
// No importar "@lib/propiedades" aquí: ese módulo hace el fetch a GraphQL y
// terminaría empaquetado en el navegador. Los datos llegan embebidos en el HTML.

export interface PropiedadBusqueda {
  slug: string;
  title: string;
  categoria: string;
  ciudad: string;
  operacion: string;
  precio?: number;
  precioUf?: number;
  areaTotal?: number;
  banos?: number;
  habitaciones?: number;
  estacionamiento?: number;
  bodega?: number;
}

interface Filtros {
  categoria: string;
  ciudad: string;
  operacion: string;
}

const escapar = (valor: unknown): string =>
  String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const filtrar = (lista: PropiedadBusqueda[], filtros: Filtros) =>
  lista.filter(
    (p) =>
      (!filtros.categoria || p.categoria === filtros.categoria) &&
      (!filtros.ciudad || p.ciudad === filtros.ciudad) &&
      (!filtros.operacion || p.operacion === filtros.operacion),
  );

const plural = (n: number, singular: string, varios: string) =>
  n > 1 ? `${n} ${varios}` : `1 ${singular}`;

const renderCard = (p: PropiedadBusqueda): string => {
  const slug = encodeURIComponent(p.slug);
  return `
          <a href="/propiedades/${slug}" class="col-span-1">
            <div class="card shadow-lg col-span-1 transition-shadow duration-300 rounded-md">
              <figure class="relative">
                <img
                  src="https://marsolpropiedades.cl/images/propiedades/${slug}/mini.webp"
                  alt="${escapar(p.title)}"
                  width="800"
                  height="500"
                  loading="lazy"
                  decoding="async"
                  class="w-full object-cover hover:scale-110 transition-all duration-300 img-card"
                />
                <div class="card-body bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 w-full p-4">
                  <div class="badge border-none text-white bg-red-800 px-2 w-fit">
                    ${p.precio ? `$${escapar(p.precio)} CLP` : `${escapar(p.precioUf)} UF`}
                  </div>
                </div>
              </figure>
              <div class="bg-zinc-700 px-2 py-1">${escapar(p.categoria)} en ${escapar(p.operacion)}</div>
              <div class="card-body p-0 bg-neutral-800 rounded-br-md rounded-bl-md">
                <ul class="list">
                  <li class="list-row flex flex-col gap-1 h-20">
                    <header class="overflow-hidden text-ellipsis">
                      <h2 class="card-title">${escapar(p.title)}</h2>
                    </header>
                    <div class="flex justify-center items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="red" class="bi bi-geo-alt" viewBox="0 0 16 16">
  <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
  <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
</svg>
                      <p>${escapar(p.ciudad)}</p>
                    </div>
                  </li>
                  <li class="list-row p-2">
                    <div class="grid gap-1">
                      ${p.areaTotal ? `<div class="tooltip" data-tip="Área Total: ${escapar(p.areaTotal)} m²"><span class="flex items-center badge bg-red-700 hover:bg-red-800 border-none text-white text-xs rounded-sm">${escapar(p.areaTotal)} m²</span></div>` : ""}
                      ${p.banos ? `<div class="tooltip" data-tip="${plural(p.banos, "Baño", "Baños")}"><span class="flex items-center badge bg-red-700 hover:bg-red-800 border-none text-white text-xs rounded-sm">${escapar(p.banos)} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bath-icon lucide-bath"><path d="M10 4 8 6"/><path d="M17 19v2"/><path d="M2 12h20"/><path d="M7 19v2"/><path d="M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/></svg></span></div>` : ""}
                      ${p.habitaciones ? `<div class="tooltip" data-tip="${plural(p.habitaciones, "Dormitorio", "Dormitorios")}"><span class="flex items-center badge bg-red-700 hover:bg-red-800 border-none text-white text-xs rounded-sm">${escapar(p.habitaciones)} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bed-double-icon lucide-bed-double"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg></span></div>` : ""}
                      ${p.estacionamiento ? `<div class="tooltip" data-tip="${plural(p.estacionamiento, "Estacionamiento", "Estacionamientos")}"><span class="badge bg-red-700 hover:bg-red-800 border-none text-white text-xs rounded-sm"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-car-icon lucide-car"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></span></div>` : ""}
                      ${p.bodega ? `<div class="tooltip" data-tip="${plural(p.bodega, "Bodega", "Bodegas")}"><span class="badge bg-red-700 hover:bg-red-800 border-none text-white text-xs rounded-sm">Bod</span></div>` : ""}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </a>
        `;
};

/**
 * Conecta un formulario de búsqueda con su contenedor de resultados.
 * @param formId Formulario con selects name="categoria" | "ciudad" | "operacion"
 * @param botonId Botón que dispara la búsqueda
 * @param resultadosId Contenedor donde se pintan las cards
 * @param datosId <script type="application/json"> con las propiedades
 */
export const initBuscador = (
  formId: string,
  botonId: string,
  resultadosId: string,
  datosId: string,
) => {
  const form = document.getElementById(formId) as HTMLFormElement | null;
  const boton = document.getElementById(botonId);
  const resultados = document.getElementById(resultadosId);
  const datos = document.getElementById(datosId);
  if (!form || !boton || !resultados || !datos) return;

  const propiedades: PropiedadBusqueda[] = JSON.parse(datos.textContent || "[]");

  boton.addEventListener("click", () => {
    const valor = (nombre: string) =>
      (form.elements.namedItem(nombre) as HTMLSelectElement | null)?.value ?? "";

    const encontradas = filtrar(propiedades, {
      categoria: valor("categoria"),
      ciudad: valor("ciudad"),
      operacion: valor("operacion"),
    });

    resultados.innerHTML =
      encontradas.length === 0
        ? "<div class='text-center p-4'><p class='text-gray-500'>No se encontraron resultados para los criterios seleccionados</p></div>"
        : encontradas.map(renderCard).join("");
  });
};
