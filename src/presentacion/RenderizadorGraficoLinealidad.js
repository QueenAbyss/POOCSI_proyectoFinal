/**
 * RENDERIZADOR: RenderizadorGraficoLinealidad
 * RESPONSABILIDAD: Renderizar el gráfico de linealidad en el canvas
 * SRP: Solo maneja presentación visual, no lógica de negocio ni estado
 */
export class RenderizadorGraficoLinealidad {
  constructor(canvas, configuracion, transformador) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.configuracion = configuracion
    this.transformador = transformador
  }

  // Renderizar el gráfico completo
  renderizar(estado, calculos) {
    this.limpiarCanvas()
    this.renderizarEjes()
    this.renderizarGrid()
    this.renderizarFunciones(estado, calculos)
    this.renderizarLeyenda(estado)
    this.renderizarLímites(estado)
  }

  // Limpiar el canvas
  limpiarCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // Renderizar ejes
  renderizarEjes() {
    const { ancho, alto, margen } = this.configuracion.grafico
    const colores = this.configuracion.colores
    
    this.ctx.strokeStyle = colores.eje
    this.ctx.lineWidth = 2
    
    // Eje X
    this.ctx.beginPath()
    this.ctx.moveTo(margen.izquierdo, alto - margen.inferior)
    this.ctx.lineTo(ancho - margen.derecho, alto - margen.inferior)
    this.ctx.stroke()
    
    // Eje Y
    this.ctx.beginPath()
    this.ctx.moveTo(margen.izquierdo, margen.superior)
    this.ctx.lineTo(margen.izquierdo, alto - margen.inferior)
    this.ctx.stroke()
    
    // Renderizar etiquetas numéricas
    this.renderizarEtiquetasEjes()
  }

  // Renderizar grid
  renderizarGrid() {
    const { ancho, alto, margen } = this.configuracion.grafico
    const colores = this.configuracion.colores
    
    this.ctx.strokeStyle = colores.grid
    this.ctx.lineWidth = 1
    
    // Líneas verticales
    for (let x = margen.izquierdo; x <= ancho - margen.derecho; x += 50) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, margen.superior)
      this.ctx.lineTo(x, alto - margen.inferior)
      this.ctx.stroke()
    }
    
    // Líneas horizontales
    for (let y = margen.superior; y <= alto - margen.inferior; y += 50) {
      this.ctx.beginPath()
      this.ctx.moveTo(margen.izquierdo, y)
      this.ctx.lineTo(ancho - margen.derecho, y)
      this.ctx.stroke()
    }
  }

  // Renderizar las funciones
  renderizarFunciones(estado, calculos) {
    this.renderizarFuncionF(estado)
    this.renderizarFuncionG(estado)
    this.renderizarFuncionCombinada(estado)
  }

  // Renderizar función f(x)
  renderizarFuncionF(estado) {
    const colores = this.configuracion.colores
    this.ctx.strokeStyle = colores.fFuncion
    this.ctx.lineWidth = 2
    
    this.renderizarFuncion(estado.fFuncion, estado.limiteA, estado.limiteB)
  }

  // Renderizar función g(x)
  renderizarFuncionG(estado) {
    const colores = this.configuracion.colores
    this.ctx.strokeStyle = colores.gFuncion
    this.ctx.lineWidth = 2
    
    this.renderizarFuncion(estado.gFuncion, estado.limiteA, estado.limiteB)
  }

  // Renderizar función combinada αf(x) + βg(x)
  renderizarFuncionCombinada(estado) {
    const colores = this.configuracion.colores
    this.ctx.strokeStyle = colores.combinada
    this.ctx.lineWidth = 3
    
    this.renderizarCombinacionLineal(estado)
  }

  // Renderizar una función individual
  renderizarFuncion(funcion, limiteA, limiteB) {
    const puntos = this.generarPuntosFuncion(funcion, limiteA, limiteB)
    this.dibujarLinea(puntos)
  }

  // Renderizar combinación lineal
  renderizarCombinacionLineal(estado) {
    const puntos = this.generarPuntosCombinacion(estado)
    this.dibujarLinea(puntos)
  }

  // Generar puntos para una función
  generarPuntosFuncion(funcion, limiteA, limiteB) {
    const puntos = []
    const paso = (limiteB - limiteA) / 200
    
    for (let x = limiteA; x <= limiteB; x += paso) {
      const y = this.calcularFuncion(funcion, x)
      const puntoCanvas = this.transformador.matematicasACanvas(x, y)
      puntos.push(puntoCanvas)
    }
    
    return puntos
  }

  // Generar puntos para combinación lineal
  generarPuntosCombinacion(estado) {
    const puntos = []
    const paso = (estado.limiteB - estado.limiteA) / 200
    
    for (let x = estado.limiteA; x <= estado.limiteB; x += paso) {
      const y = this.calcularCombinacionLineal(estado, x)
      const puntoCanvas = this.transformador.matematicasACanvas(x, y)
      puntos.push(puntoCanvas)
    }
    
    return puntos
  }

  // Calcular valor de función
  calcularFuncion(funcion, x) {
    switch (funcion) {
      case "x": return x
      case "x²": return x * x
      case "x³": return x * x * x
      case "sin(x)": return Math.sin(x)
      case "cos(x)": return Math.cos(x)
      case "√x": return Math.sqrt(Math.max(0, x))
      case "eˣ": return Math.exp(x)
      default: return 0
    }
  }

  // Calcular combinación lineal
  calcularCombinacionLineal(estado, x) {
    const f = this.calcularFuncion(estado.fFuncion, x)
    const g = this.calcularFuncion(estado.gFuncion, x)
    return estado.alpha * f + estado.beta * g
  }

  // Dibujar línea
  dibujarLinea(puntos) {
    if (puntos.length < 2) return
    
    this.ctx.beginPath()
    this.ctx.moveTo(puntos[0].x, puntos[0].y)
    
    for (let i = 1; i < puntos.length; i++) {
      this.ctx.lineTo(puntos[i].x, puntos[i].y)
    }
    
    this.ctx.stroke()
  }

  // Renderizar leyenda
  renderizarLeyenda(estado) {
    const { ancho, margen } = this.configuracion.grafico
    const colores = this.configuracion.colores
    const y = margen.superior + 20
    
    this.ctx.font = "14px Arial"
    
    // f(x)
    this.ctx.fillStyle = colores.fFuncion
    this.ctx.fillRect(ancho - 200, y, 15, 15)
    this.ctx.fillStyle = "#000"
    this.ctx.fillText(`f(x) = ${estado.fFuncion}`, ancho - 180, y + 12)
    
    // g(x)
    this.ctx.fillStyle = colores.gFuncion
    this.ctx.fillRect(ancho - 200, y + 25, 15, 15)
    this.ctx.fillStyle = "#000"
    this.ctx.fillText(`g(x) = ${estado.gFuncion}`, ancho - 180, y + 37)
    
    // Combinada
    this.ctx.fillStyle = colores.combinada
    this.ctx.fillRect(ancho - 200, y + 50, 15, 15)
    this.ctx.fillStyle = "#000"
    this.ctx.fillText(`αf(x) + βg(x)`, ancho - 180, y + 62)
  }

  // Renderizar límites
  renderizarLímites(estado) {
    const colores = this.configuracion.colores
    this.ctx.strokeStyle = colores.eje
    this.ctx.lineWidth = 1
    this.ctx.setLineDash([5, 5])
    
    // Línea límite A
    const puntoA = this.transformador.matematicasACanvas(estado.limiteA, 0)
    this.ctx.beginPath()
    this.ctx.moveTo(puntoA.x, 0)
    this.ctx.lineTo(puntoA.x, this.canvas.height)
    this.ctx.stroke()
    
    // Línea límite B
    const puntoB = this.transformador.matematicasACanvas(estado.limiteB, 0)
    this.ctx.beginPath()
    this.ctx.moveTo(puntoB.x, 0)
    this.ctx.lineTo(puntoB.x, this.canvas.height)
    this.ctx.stroke()
    
    this.ctx.setLineDash([])
  }

  // Renderizar etiquetas de los ejes
  renderizarEtiquetasEjes() {
    const { ancho, alto, margen } = this.configuracion.grafico
    const colores = this.configuracion.colores
    
    // Obtener intervalos del transformador
    const intervaloX = this.transformador.intervaloX
    const intervaloY = this.transformador.intervaloY
    
    if (!intervaloX || !intervaloY) {
      console.log('❌ Intervalos no disponibles para etiquetas')
      return
    }
    
    this.ctx.fillStyle = colores.eje
    this.ctx.font = "12px Arial"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "top"
    
    // Etiquetas del eje X
    const pasoX = (intervaloX.max - intervaloX.min) / 5
    for (let i = 0; i <= 5; i++) {
      const valorX = intervaloX.min + i * pasoX
      const puntoCanvas = this.transformador.matematicasACanvas(valorX, 0)
      this.ctx.fillText(valorX.toFixed(1), puntoCanvas.x, alto - margen.inferior + 5)
    }
    
    // Etiquetas del eje Y
    this.ctx.textAlign = "right"
    this.ctx.textBaseline = "middle"
    const pasoY = (intervaloY.max - intervaloY.min) / 5
    for (let i = 0; i <= 5; i++) {
      const valorY = intervaloY.min + i * pasoY
      const puntoCanvas = this.transformador.matematicasACanvas(0, valorY)
      this.ctx.fillText(valorY.toFixed(1), margen.izquierdo - 5, puntoCanvas.y)
    }
  }
}
