/**
 * SERVICIO: TransformadorCoordenadas
 * RESPONSABILIDAD: Convertir entre coordenadas matemáticas y canvas
 */
export class TransformadorCoordenadas {
  constructor(configuracion, intervaloX, intervaloY) {
    this.configuracion = configuracion
    this.intervaloX = intervaloX
    this.intervaloY = intervaloY
    this.area = configuracion.obtenerAreaDibujo()
    this.escalas = configuracion.calcularEscalas(intervaloX, intervaloY)
  }

  matematicasACanvas(x, y) {
    const canvasX = this.area.x + (x - this.intervaloX.inicio) * this.escalas.escalaX
    const canvasY = this.area.y + this.area.alto - (y - this.intervaloY.min) * this.escalas.escalaY
    return { x: canvasX, y: canvasY }
  }

  canvasAMatematicas(canvasX, canvasY) {
    const x = this.intervaloX.inicio + (canvasX - this.area.x) / this.escalas.escalaX
    const y = this.intervaloY.min + (this.area.y + this.area.alto - canvasY) / this.escalas.escalaY
    return { x, y }
  }

  escalarAncho(ancho) {
    return ancho * this.escalas.escalaX
  }

  escalarAlto(alto) {
    return alto * this.escalas.escalaY
  }
}
