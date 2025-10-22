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
    // Usar min si existe, sino usar inicio (compatibilidad)
    const inicioX = this.intervaloX.min !== undefined ? this.intervaloX.min : this.intervaloX.inicio
    const inicioY = this.intervaloY.min !== undefined ? this.intervaloY.min : this.intervaloY.inicio
    
    const canvasX = this.area.x + (x - inicioX) * this.escalas.escalaX
    const canvasY = this.area.y + this.area.alto - (y - inicioY) * this.escalas.escalaY
    
    return { x: canvasX, y: canvasY }
  }

  canvasAMatematicas(canvasX, canvasY) {
    // Usar min si existe, sino usar inicio (compatibilidad)
    const inicioX = this.intervaloX.min !== undefined ? this.intervaloX.min : this.intervaloX.inicio
    const inicioY = this.intervaloY.min !== undefined ? this.intervaloY.min : this.intervaloY.inicio
    
    const x = inicioX + (canvasX - this.area.x) / this.escalas.escalaX
    const y = inicioY + (this.area.y + this.area.alto - canvasY) / this.escalas.escalaY
    return { x, y }
  }

  escalarAncho(ancho) {
    return ancho * this.escalas.escalaX
  }

  escalarAlto(alto) {
    return alto * this.escalas.escalaY
  }
}
