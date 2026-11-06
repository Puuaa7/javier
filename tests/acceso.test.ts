import { describe, expect, it } from "vitest"

import { credencialesValidas } from "@/lib/acceso"

// Igual que el navegador: credenciales en UTF-8 y codificadas en base64.
const basic = (usuario: string, contrasena: string) =>
  `Basic ${btoa(
    String.fromCharCode(
      ...new TextEncoder().encode(`${usuario}:${contrasena}`)
    )
  )}`

describe("credencialesValidas", () => {
  it("acepta la contraseña correcta con cualquier usuario", () => {
    expect(credencialesValidas(basic("profe", "clave:1"), "clave:1")).toBe(true)
    expect(credencialesValidas(basic("", "clave:1"), "clave:1")).toBe(true)
  })

  it("acepta caracteres no ASCII y espacios sobrantes", () => {
    expect(credencialesValidas(basic("Íñigo", "contraseña€"), "contraseña€")).toBe(
      true
    )
    expect(credencialesValidas(basic("x", "clave "), "clave")).toBe(true)
  })

  it("rechaza contraseñas incorrectas o cabeceras mal formadas", () => {
    expect(credencialesValidas(basic("profe", "clave"), "clave:1")).toBe(false)
    expect(credencialesValidas(basic("profe", "clave:12"), "clave:1")).toBe(false)
    expect(credencialesValidas(null, "clave:1")).toBe(false)
    expect(credencialesValidas("Bearer abc", "clave:1")).toBe(false)
    expect(credencialesValidas("Basic %%%", "clave:1")).toBe(false)
    expect(credencialesValidas(`Basic ${btoa("sin-dos-puntos")}`, "x")).toBe(false)
  })
})
