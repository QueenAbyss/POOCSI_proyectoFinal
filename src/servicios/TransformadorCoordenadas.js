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
    this.escalas = this.calcularEscalas(intervaloX, intervaloY)
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

  // Actualizar intervalo X
  actualizarIntervaloX(nuevoIntervaloX) {
    this.intervaloX = nuevoIntervaloX
    this.escalas = this.calcularEscalas(this.intervaloX, this.intervaloY)
  }

  // Actualizar intervalo Y
  actualizarIntervaloY(nuevoIntervaloY) {
    this.intervaloY = nuevoIntervaloY
    this.escalas = this.calcularEscalas(this.intervaloX, this.intervaloY)
  }

  // Calcular escalas basado en intervalos y área de dibujo
  calcularEscalas(intervaloX, intervaloY) {
    // Compatibilidad con diferentes formatos de intervalo
    const inicioX = intervaloX.min !== undefined ? intervaloX.min : intervaloX.inicio
    const finX = intervaloX.max !== undefined ? intervaloX.max : intervaloX.fin
    const inicioY = intervaloY.min !== undefined ? intervaloY.min : intervaloY.inicio
    const finY = intervaloY.max !== undefined ? intervaloY.max : intervaloY.fin
    
    const rangoX = finX - inicioX
    const rangoY = finY - inicioY
    
    const escalaX = this.area.ancho / rangoX
    const escalaY = this.area.alto / rangoY
    
    return { escalaX, escalaY }
  }
}
