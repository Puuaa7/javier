import "server-only"

import {
  contrasenaConfigurada,
  credencialesValidas,
  respuestaNoAutorizada,
} from "@/lib/acceso"

/**
 * En producción los endpoints exigen la contraseña de ETL_PASSWORD (HTTP
 * Basic, también comprobada en proxy.ts). Sin ella siguen deshabilitados salvo
 * que se active ETL_PERMITIR_EN_PRODUCCION=true, que los deja abiertos.
 * Además se rechazan peticiones de escritura de otros orígenes.
 */
export function comprobarAcceso(
  request: Request,
  { escritura }: { escritura: boolean }
): Response | null {
  const contrasena = contrasenaConfigurada()
  if (contrasena) {
    if (!credencialesValidas(request.headers.get("authorization"), contrasena)) {
      return respuestaNoAutorizada()
    }
  } else if (
    process.env.NODE_ENV === "production" &&
    process.env.ETL_PERMITIR_EN_PRODUCCION !== "true"
  ) {
    return Response.json(
      {
        error:
          "Endpoint deshabilitado en producción: define ETL_PASSWORD para publicarlo con contraseña.",
      },
      { status: 403 }
    )
  }

  if (escritura) {
    const origen = request.headers.get("origin")
    const host = request.headers.get("host")
    if (origen && host && new URL(origen).host !== host) {
      return Response.json({ error: "Origen no permitido." }, { status: 403 })
    }
  }
  return null
}
