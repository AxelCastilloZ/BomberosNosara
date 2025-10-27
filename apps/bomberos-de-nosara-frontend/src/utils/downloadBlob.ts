// Intenta obtener el nombre de archivo desde Content-Disposition.
// Siempre retorna un string válido (usa 'archivo.descarga' como fallback)
export function filenameFromContentDisposition(cd?: string | null): string {
  if (!cd) return 'archivo.descarga';

  // filename*=UTF-8''nombre.ext
  let m = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (m && m[1]) return decodeURIComponent(m[1].replace(/["']/g, ''));

  // filename="nombre.ext"
  m = cd.match(/filename\s*=\s*("?)([^";]+)\1/i);
  if (m && m[2]) return m[2];

  return 'archivo.descarga';
}


export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
