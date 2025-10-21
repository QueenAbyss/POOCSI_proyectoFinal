/**
 * SERVICIO: VerificadorLinealidad
 * RESPONSABILIDAD: Verificar la propiedad de linealidad de las integrales
 */
import { CalculadoraRiemann } from "./CalculadoraRiemann.js"

export class VerificadorLinealidad {
  constructor() {
    this.calculadora = new CalculadoraRiemann()
  }

  verificar(funcion1, funcion2, constante1, constante2, intervalo) {
    // Calcular ∫[a,b] [αf(x) + βg(x)] dx
    const funcionCombinada = this.crearFuncionCombinada(funcion1, funcion2, constante1, constante2)
    const ladoIzquierdo = this.calculadora.calcularIntegralExacta(funcionCombinada, intervalo)

    // Calcular α∫[a,b] f(x) dx + β∫[a,b] g(x) dx
    const integral1 = this.calculadora.calcularIntegralExacta(funcion1, intervalo)
    const integral2 = this.calculadora.calcularIntegralExacta(funcion2, intervalo)
    const ladoDerecho = constante1 * integral1 + constante2 * integral2

    const error = Math.abs(ladoIzquierdo - ladoDerecho)
    const tolerancia = 0.01

    return {
      cumple: error < tolerancia,
      ladoIzquierdo,
      ladoDerecho,
      error,
      errorRelativo: this.calculadora.calcularErrorRelativo(ladoIzquierdo, ladoDerecho),
    }
  }

  crearFuncionCombinada(funcion1, funcion2, constante1, constante2) {
    return {
      evaluar: (x) => constante1 * funcion1.evaluar(x) + constante2 * funcion2.evaluar(x),
    }
  }
}
