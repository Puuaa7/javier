import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import {
  contrasenaConfigurada,
  credencialesValidas,
  respuestaNoAutorizada,
} from "@/lib/acceso"

/**
 * Si ETL_PASSWORD está definida, toda la aplicación (página y API) pide
 * contraseña. Sin ella no se protege nada: es el modo de desarrollo local.
 */
export function proxy(request: NextRequest) {
  const contrasena = contrasenaConfigurada()
  if (!contrasena) return NextResponse.next()
  if (credencialesValidas(request.headers.get("authorization"), contrasena)) {
    return NextResponse.next()
  }
  return respuestaNoAutorizada()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
