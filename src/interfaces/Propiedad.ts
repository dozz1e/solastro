// Interface para Precio
interface Precio {
  precio: number;
  precioUf: number;
}

// Interface para Operacion
interface Operacion {
  operacion: string;
}

// Interface para Incluye
interface Incluye {
  incluye: string[];
}

// Interface para Espacios Comunes
interface EspaciosComunes {
  espaciosComunes: string;
}

// Interface para Direccion
interface Direccion {
  ciudad: string;
  direccion: string;
}

// Interface para Detalles Adicionales
interface DetallesAdicionales {
  detalles: string;
}

// Interface para Datos
interface Datos {
  areaTotal: number;
  banos: number;
  habitaciones: number;
  galeria: number;
  video: number;
  urlVideo: string;
}

// Interface para Categoría
interface CategoriaGraphql {
  categoria: string;
}

// Interface para SEO
interface Seo {
  metaKeywords: string;
  metaDesc: string;
  title: string;
}

interface Propiedad {
  title: string;
  slug: string;
  precio: Precio;
  operacion: Operacion;
  incluye: Incluye;
  espaciosComunes: EspaciosComunes;
  direccion: Direccion;
  detallesAdicionales: DetallesAdicionales;
  datos: Datos;
  categoriaGraphql: CategoriaGraphql;
  seo: Seo;
  categories: {
    nodes: {
      categoryId: number;
    }[];
  };
}

export { Propiedad, Datos };
