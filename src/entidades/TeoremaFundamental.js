/**
 * Entidad: TeoremaFundamental
 * Responsabilidad: Representar el estado del Teorema Fundamental del Cálculo
 * SRP: Solo almacena datos del teorema, no realiza cálculos
 */
export class TeoremaFundamental {
  constructor(funcion, a, b, antiderivada = null) {
    this.funcion = funcion // FuncionMatematica
    this.a = a // límite inferior
    this.b = b // límite superior
    this.antiderivada = antiderivada // función antiderivada F(x)
    this.parte = "primera" // 'primera' o 'segunda'
    this.valorIntegral = null
    this.valorAntiderivada = null
    this.diferencia = null
    this.esValido = false
  }

  setResultados(valorIntegral, valorAntiderivada, diferencia) {
    this.valorIntegral = valorIntegral
    this.valorAntiderivada = valorAntiderivada
    this.diferencia = diferencia
    this.esValido = Math.abs(diferencia) < 0.001
  }

  setParte(parte) {
    this.parte = parte // 'primera' o 'segunda'
  }

  setAntiderivada(antiderivada) {
    this.antiderivada = antiderivada
  }
}
