// Intenta obtener el nombre de archivo desde Content-Disposition.
// Soporta: filename="..." y (simple) filename*=UTF-8''...
export function filenameFromContentDisposition(cd?: string | null): string | undefined {
  if (!cd) return undefined;
  // filename*=UTF-8''nombre.ext
  let m = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (m && m[1]) return decodeURIComponent(m[1].replace(/["']/g, ''));
  // filename="nombre.ext"
  m = cd.match(/filename\s*=\s*("?)([^";]+)\1/i);
  if (m && m[2]) return m[2];
  return undefined;
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
