/**
 * Elimina los números de una cadena de texto, útil para quitar numeración de calles o departamentos.
 * @param str Cadena original
 * @returns Cadena sin números
 */
export const removeNumbers = (str: string | undefined): string => {
  if (!str) return "";
  // Eliminamos cualquier cosa que no sea una letra (incluyendo acentos) o espacio
  // \p{L} coincide con cualquier letra en cualquier lenguaje.
  return str.replace(/[^\p{L}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
};
