/**
 * SERVICIO: VerificadorComparacion
 * RESPONSABILIDAD: Verificar la propiedad de comparación de integrales
 */
import { CalculadoraRiemann } from "./CalculadoraRiemann.js"

export class VerificadorComparacion {
  constructor() {
    this.calculadora = new CalculadoraRiemann()
  }

  verificar(funcion1, funcion2, intervalo) {
    // Verificar que f(x) ≤ g(x) en el intervalo
    const cumpleCondicion = this.verificarCondicion(funcion1, funcion2, intervalo)

    // Calcular integrales
    const integral1 = this.calculadora.calcularIntegralExacta(funcion1, intervalo)
    const integral2 = this.calculadora.calcularIntegralExacta(funcion2, intervalo)

    return {
      cumple: cumpleCondicion && integral1 <= integral2,
      cumpleCondicion,
      integral1,
      integral2,
      diferencia: integral2 - integral1,
    }
  }

  verificarCondicion(funcion1, funcion2, intervalo) {
    const pasos = 100
    const deltaX = (intervalo.fin - intervalo.inicio) / pasos

    for (let i = 0; i <= pasos; i++) {
      const x = intervalo.inicio + i * deltaX
      if (funcion1.evaluar(x) > funcion2.evaluar(x) + 0.001) {
        return false
      }
    }

    return true
  }
}
