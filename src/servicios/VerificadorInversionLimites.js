/**
 * SERVICIO: VerificadorInversionLimites
 * RESPONSABILIDAD: Verificar la propiedad de inversión de límites
 */
import { CalculadoraRiemann } from "./CalculadoraRiemann.js"

export class VerificadorInversionLimites {
  constructor() {
    this.calculadora = new CalculadoraRiemann()
  }

  verificar(funcion, intervalo) {
    // Calcular ∫[a,b] f(x) dx
    const integralOriginal = this.calculadora.calcularIntegralExacta(funcion, intervalo)

    // Calcular ∫[b,a] f(x) dx
    const integralInvertida = this.calculadora.calcularIntegralExacta(funcion, {
      inicio: intervalo.fin,
      fin: intervalo.inicio,
    })

    // Verificar que ∫[a,b] f(x) dx = -∫[b,a] f(x) dx
    const suma = integralOriginal + integralInvertida
    const tolerancia = 0.01

    return {
      cumple: Math.abs(suma) < tolerancia,
      integralOriginal,
      integralInvertida,
      suma,
      cumpleRelacion: Math.abs(integralOriginal + integralInvertida) < tolerancia,
    }
  }
}
