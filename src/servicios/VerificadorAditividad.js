/**
 * SERVICIO: VerificadorAditividad
 * RESPONSABILIDAD: Verificar la propiedad de aditividad de las integrales
 */
import { CalculadoraRiemann } from "./CalculadoraRiemann.js"

export class VerificadorAditividad {
  constructor() {
    this.calculadora = new CalculadoraRiemann()
  }

  verificar(funcion, intervalo, puntoIntermedio) {
    // Verificar que a < b < c
    if (puntoIntermedio <= intervalo.inicio || puntoIntermedio >= intervalo.fin) {
      throw new Error("El punto intermedio debe estar dentro del intervalo")
    }

    // Calcular ∫[a,c] f(x) dx
    const integralCompleta = this.calculadora.calcularIntegralExacta(funcion, intervalo)

    // Calcular ∫[a,b] f(x) dx + ∫[b,c] f(x) dx
    const integral1 = this.calculadora.calcularIntegralExacta(funcion, {
      inicio: intervalo.inicio,
      fin: puntoIntermedio,
    })
    const integral2 = this.calculadora.calcularIntegralExacta(funcion, {
      inicio: puntoIntermedio,
      fin: intervalo.fin,
    })
    const integralesParciales = integral1 + integral2

    const error = Math.abs(integralCompleta - integralesParciales)
    const tolerancia = 0.01

    return {
      cumple: error < tolerancia,
      integralCompleta,
      integralesParciales,
      integral1,
      integral2,
      error,
    }
  }
}
