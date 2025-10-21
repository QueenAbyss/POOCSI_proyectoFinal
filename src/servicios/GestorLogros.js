import { Logro } from "../entidades/Logro"

/**
 * SERVICIO: GestorLogros
 * RESPONSABILIDAD: Gestionar logros y desbloqueos
 */
export class GestorLogros {
  constructor() {
    this.logros = this.inicializarLogros()
  }

  inicializarLogros() {
    return [
      new Logro(
        "primer-exito",
        "Primer Éxito",
        "Logra tu primera aproximación con error < 0.5",
        "🌱",
        (datos) => datos.errorAbsoluto < 0.5,
      ),
      new Logro(
        "aproximacion-excelente",
        "Aproximación Excelente",
        "Consigue una aproximación excelente (error < 0.1)",
        "🎯",
        (datos) => datos.errorAbsoluto < 0.1,
      ),
      new Logro(
        "maestro-perfecto",
        "Maestro Perfecto",
        "Alcanza la perfección con error < 0.01",
        "👑",
        (datos) => datos.errorAbsoluto < 0.01,
      ),
      new Logro(
        "velocista-magico",
        "Velocista Mágico",
        "Consigue excelencia con menos de 30 segundos",
        "⚡",
        (datos) => datos.errorAbsoluto < 0.1 && datos.tiempo < 30,
      ),
      new Logro(
        "experto-eficiencia",
        "Experto en Eficiencia",
        "Logra excelencia con menos de 50 macetas",
        "💎",
        (datos) => datos.errorAbsoluto < 0.1 && datos.macetas < 50,
      ),
    ]
  }

  verificarLogros(datos) {
    const logrosDesbloqueados = []
    this.logros.forEach((logro) => {
      if (logro.verificarDesbloqueo(datos)) {
        logrosDesbloqueados.push(logro)
      }
    })
    return logrosDesbloqueados
  }

  obtenerLogros() {
    return this.logros
  }

  obtenerLogrosDesbloqueados() {
    return this.logros.filter((logro) => logro.desbloqueado)
  }

  obtenerProgreso() {
    const total = this.logros.length
    const desbloqueados = this.obtenerLogrosDesbloqueados().length
    return {
      total,
      desbloqueados,
      porcentaje: (desbloqueados / total) * 100,
    }
  }

  reiniciar() {
    this.logros.forEach((logro) => {
      logro.desbloqueado = false
      logro.fechaDesbloqueo = null
    })
  }
}
