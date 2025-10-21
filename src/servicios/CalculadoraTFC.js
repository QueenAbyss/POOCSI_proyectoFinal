/**
 * Servicio: CalculadoraTFC (Teorema Fundamental del Cálculo)
 * Responsabilidad: Realizar cálculos relacionados con el TFC
 * SRP: Solo se encarga de los cálculos del teorema, no de la presentación
 */
export class CalculadoraTFC {
  constructor() {
    this.precision = 1000 // número de particiones para aproximación numérica
  }

  /**
   * Primera parte del TFC: Si F es antiderivada de f, entonces ∫[a,b] f(x)dx = F(b) - F(a)
   */
  calcularPrimeraParte(teorema) {
    const { funcion, a, b, antiderivada } = teorema

    if (!antiderivada) {
      throw new Error("Se requiere una antiderivada para la primera parte del TFC")
    }

    // Calcular F(b) - F(a)
    const Fb = antiderivada.evaluar(b)
    const Fa = antiderivada.evaluar(a)
    const valorAntiderivada = Fb - Fa

    // Calcular la integral numéricamente para verificar
    const valorIntegral = this.integralNumerica(funcion, a, b)

    const diferencia = Math.abs(valorIntegral - valorAntiderivada)

    teorema.setResultados(valorIntegral, valorAntiderivada, diferencia)

    return {
      Fa,
      Fb,
      valorAntiderivada,
      valorIntegral,
      diferencia,
      esValido: teorema.esValido,
    }
  }

  /**
   * Segunda parte del TFC: d/dx[∫[a,x] f(t)dt] = f(x)
   */
  calcularSegundaParte(teorema, x) {
    const { funcion, a } = teorema

    // Calcular ∫[a,x] f(t)dt
    const integralHastaX = this.integralNumerica(funcion, a, x)

    // Calcular la derivada usando diferencias finitas
    const h = 0.0001
    const integralHastaXPlusH = this.integralNumerica(funcion, a, x + h)
    const derivada = (integralHastaXPlusH - integralHastaX) / h

    // Evaluar f(x)
    const valorFuncion = funcion.evaluar(x)

    const diferencia = Math.abs(derivada - valorFuncion)

    return {
      integralHastaX,
      derivada,
      valorFuncion,
      diferencia,
      esValido: diferencia < 0.01,
    }
  }

  /**
   * Integración numérica usando regla del trapecio
   */
  integralNumerica(funcion, a, b) {
    const n = this.precision
    const h = (b - a) / n
    let suma = 0

    for (let i = 0; i <= n; i++) {
      const x = a + i * h
      const peso = i === 0 || i === n ? 0.5 : 1
      suma += peso * funcion.evaluar(x)
    }

    return suma * h
  }

  /**
   * Encontrar antiderivada simbólica simple
   */
  encontrarAntiderivada(funcion) {
    // Implementación simplificada para funciones polinómicas
    const { expresion } = funcion

    // Detectar tipo de función y retornar antiderivada
    if (expresion.includes("x^2")) {
      return {
        expresion: "x^3/3",
        evaluar: (x) => Math.pow(x, 3) / 3,
      }
    } else if (expresion.includes("x")) {
      return {
        expresion: "x^2/2",
        evaluar: (x) => Math.pow(x, 2) / 2,
      }
    } else if (expresion.includes("sin")) {
      return {
        expresion: "-cos(x)",
        evaluar: (x) => -Math.cos(x),
      }
    } else if (expresion.includes("cos")) {
      return {
        expresion: "sin(x)",
        evaluar: (x) => Math.sin(x),
      }
    }

    return null
  }
}
