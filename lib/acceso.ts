/**
 * Autenticación mínima para publicar la práctica: HTTP Basic con una única
 * contraseña definida en ETL_PASSWORD (el usuario puede ser cualquiera).
 * Sin dependencias de Node para poder usarse tanto en proxy.ts como en los
 * route handlers.
 */
export function contrasenaConfigurada(): string | null {
  const contrasena = process.env.ETL_PASSWORD
  return contrasena ? contrasena : null
}

/** Comparación en tiempo constante para no filtrar la contraseña por tiempos. */
function igualesSeguro(a: string, b: string): boolean {
  let diferencia = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diferencia |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diferencia === 0
}

export function credencialesValidas(
  cabecera: string | null,
  contrasena: string
): boolean {
  if (!cabecera?.startsWith("Basic ")) return false
  let decodificado: string
  try {
    decodificado = atob(cabecera.slice("Basic ".length).trim())
  } catch {
    return false
  }
  const separador = decodificado.indexOf(":")
  if (separador === -1) return false
  return igualesSeguro(decodificado.slice(separador + 1), contrasena)
}

export function respuestaNoAutorizada(): Response {
  return new Response("Se necesita contraseña.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Meteo ETL", charset="UTF-8"' },
  })
}
