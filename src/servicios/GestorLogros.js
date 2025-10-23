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
      // ✅ LOGROS DE RIEMANN (Jardín Mágico)
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
      
      // ✅ LOGROS DE PTFC (Puente Mágico)
      new Logro(
        "explorador-ptfc",
        "🧭 Explorador del Puente",
        "Primera exploración del puente mágico",
        "🧭",
        (datos) => datos.posicionX > datos.limiteA + 0.1,
      ),
      new Logro(
        "maestro-teorema-ptfc",
        "🎓 Maestro del Teorema",
        "Verificaste F'(x) = f(x) correctamente",
        "🎓",
        (datos) => datos.verificacionTeorema,
      ),
      new Logro(
        "animador-ptfc",
        "🎬 Animador del Puente",
        "Completaste una animación completa",
        "🎬",
        (datos) => datos.posicionX >= datos.limiteB - 0.1,
      ),
      new Logro(
        "explorador-funciones-ptfc",
        "🔬 Explorador de Funciones",
        "Exploraste múltiples funciones matemáticas",
        "🔬",
        (datos) => datos.funcionesExploradas > 1,
      ),
      new Logro(
        "verificador-precision-ptfc",
        "🎯 Verificador de Precisión",
        "Lograste una verificación con diferencia < 0.001",
        "🎯",
        (datos) => datos.diferenciaVerificacion < 0.001,
      ),
      new Logro(
        "constructor-puente-ptfc",
        "🏗️ Constructor del Puente",
        "Construiste el puente completo con área > 10",
        "🏗️",
        (datos) => datos.integralAcumulada > 10,
      ),
      new Logro(
        "matematico-avanzado-ptfc",
        "🧮 Matemático Avanzado",
        "Verificaste el teorema en 5 funciones diferentes",
        "🧮",
        (datos) => datos.verificacionesExitosas >= 5,
      ),
      new Logro(
        "explorador-tiempo-ptfc",
        "⏱️ Explorador del Tiempo",
        "Exploraste por más de 2 minutos",
        "⏱️",
        (datos) => datos.tiempoExploracion > 120000, // 2 minutos en ms
      ),
      
      // ✅ LOGROS DE TORRE DEL VALOR MEDIO
      new Logro(
        "primera-estimacion-tvm",
        "🎯 Primera Estimación",
        "Haz tu primera estimación de c",
        "🎯",
        (datos) => datos.estimacionUsuario !== null,
      ),
      new Logro(
        "ojo-aguila-tvm",
        "🦅 Ojo de Águila",
        "Estima c con error < 0.2",
        "🦅",
        (datos) => datos.errorEstimacion < 0.2,
      ),
      new Logro(
        "perfeccionista-tvm",
        "🏆 Perfeccionista",
        "Consigue 3 estimaciones excelentes",
        "🏆",
        (datos) => datos.estimacionesExcelentes >= 3,
      ),
      new Logro(
        "explorador-tvm",
        "🔍 Explorador",
        "Prueba los 5 ejemplos",
        "🔍",
        (datos) => datos.ejemplosCompletados >= 5,
      ),
      new Logro(
        "velocista-tvm",
        "⚡ Velocista",
        "Completa un ejemplo en < 30s",
        "⚡",
        (datos) => datos.tiempoCompletado < 30000, // 30 segundos
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
  
  // ✅ OBTENER LOGROS POR ESCENARIO
  obtenerLogrosPorEscenario(escenario) {
    if (escenario === 'riemann') {
      return this.logros.filter(logro => 
        !logro.id.includes('-ptfc') && !logro.id.includes('-tvm') && !logro.id.includes('-antiderivadas')
      )
    } else if (escenario === 'ptfc') {
      return this.logros.filter(logro => logro.id.includes('-ptfc'))
    } else if (escenario === 'tvm') {
      return this.logros.filter(logro => logro.id.includes('-tvm'))
    } else if (escenario === 'antiderivadas') {
      return this.logros.filter(logro => logro.id.includes('-antiderivadas'))
    }
    return this.logros
  }
  
  // ✅ OBTENER LOGROS DESBLOQUEADOS POR ESCENARIO
  obtenerLogrosDesbloqueadosPorEscenario(escenario) {
    return this.obtenerLogrosPorEscenario(escenario).filter(logro => logro.desbloqueado)
  }
  
  // ✅ OBTENER PROGRESO POR ESCENARIO
  obtenerProgresoPorEscenario(escenario) {
    const logrosEscenario = this.obtenerLogrosPorEscenario(escenario)
    const total = logrosEscenario.length
    const desbloqueados = logrosEscenario.filter(logro => logro.desbloqueado).length
    
    return {
      total,
      desbloqueados,
      porcentaje: total > 0 ? (desbloqueados / total) * 100 : 0,
    }
  }
}
