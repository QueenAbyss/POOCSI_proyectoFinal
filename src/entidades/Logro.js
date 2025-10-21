/**
 * ENTIDAD: Logro
 * RESPONSABILIDAD: Representar un logro desbloqueable
 */
export class Logro {
  constructor(id, nombre, descripcion, icono, condicion) {
    this.id = id
    this.nombre = nombre
    this.descripcion = descripcion
    this.icono = icono
    this.desbloqueado = false
    this.fechaDesbloqueo = null
    this.condicion = condicion // función que determina si se desbloquea
  }

  verificarDesbloqueo(datos) {
    if (!this.desbloqueado && this.condicion(datos)) {
      this.desbloquear()
      return true
    }
    return false
  }

  desbloquear() {
    this.desbloqueado = true
    this.fechaDesbloqueo = new Date()
  }

  obtenerProgreso(datos) {
    // Retorna un valor entre 0 y 1 indicando el progreso hacia el logro
    return this.desbloqueado ? 1 : 0
  }
}
