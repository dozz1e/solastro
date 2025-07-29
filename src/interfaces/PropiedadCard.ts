// Interface para Precio
interface Precio {
  precio?: number;
  precioUf?: number;
}

// Interface para Operacion
interface Operacion {
  operacion: string;
}

// Interface para Direccion
interface Direccion {
  ciudad: string;
}

// Interface para Categoría
interface CategoriaGraphql {
  categoria: string;
}

// Interface para Imagen destacada
interface FeaturedImage {
  node: {
    sourceUrl: string;
    altText: string;
  };
}

export interface PropiedadCard {
  title: string;
  slug: string;
  categoriaGraphql: CategoriaGraphql;
  featuredImage: FeaturedImage;
  precio: Precio;
  direccion: Direccion;
  operacion: Operacion;
}

// Interface para un listado de nodos
// interface PropiedadesCard {
//   nodes: PropiedadesCard[];
// }
