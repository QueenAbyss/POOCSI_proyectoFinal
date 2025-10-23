/**
 * Hook personalizado para Torre del Valor Medio
 * Maneja el estado y la lógica del escenario
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { EscenarioFactory } from '../escenarios/EscenarioFactory.js'

interface TorreValorMedioState {
  // Estado del escenario
  escenario: any
  estado: any
  configuracion: any
  
  // Estado de la interfaz
  funcionActual: string
  limiteA: number
  limiteB: number
  estimacionUsuario: number | null
  puntoCReal: number | null
  errorEstimacion: number
  verificacionExitosa: boolean
  
  // Estado de renderizado
  estaRenderizando: boolean
  estaVerificando: boolean
  estaBloqueado: boolean
  
  // Métricas
  tiempoInicio: number
  numeroIntentos: number
  estimacionesExcelentes: number
  
  // Ejemplos y logros
  ejemplos: any[]
  logros: any[]
  logrosDesbloqueados: string[]
  
  // Métodos
  establecerFuncion: (tipo: string, funcionPersonalizada?: string) => void
  establecerLimites: (a: number, b: number) => void
  establecerEstimacionUsuario: (c: number) => void
  calcularPuntoCReal: () => number | null
  verificarEstimacion: () => boolean
  cargarEjemplo: (ejemplo: any) => void
  resetear: () => void
  manejarClickTorre: (evento: MouseEvent) => number | null
  manejarClickCartesiano: (evento: MouseEvent) => number | null
  obtenerInformacionHover: (evento: MouseEvent, tipoCanvas: string) => any
  renderizarCompleto: () => void
  configurarCanvas: (canvasTorre: HTMLCanvasElement, canvasCartesiano: HTMLCanvasElement) => void
  obtenerCalculos: () => any
  obtenerMetricas: () => any
  obtenerInformacionTeorema: () => any
  verificarCondicionesTeorema: () => any
}

export const useTorreValorMedio = (): TorreValorMedioState => {
  // Referencias
  const escenarioFactoryRef = useRef<EscenarioFactory | null>(null)
  const escenarioRef = useRef<any>(null)
  
  // Estado del escenario
  const [escenario, setEscenario] = useState<any>(null)
  const [estado, setEstado] = useState<any>(null)
  const [configuracion, setConfiguracion] = useState<any>(null)
  
  // Estado de la interfaz
  const [funcionActual, setFuncionActual] = useState<string>('cuadratica')
  const [limiteA, setLimiteA] = useState<number>(-2)
  const [limiteB, setLimiteB] = useState<number>(2)
  const [estimacionUsuario, setEstimacionUsuario] = useState<number | null>(null)
  const [puntoCReal, setPuntoCReal] = useState<number | null>(null)
  const [errorEstimacion, setErrorEstimacion] = useState<number>(0)
  const [verificacionExitosa, setVerificacionExitosa] = useState<boolean>(false)
  
  // Estado de renderizado
  const [estaRenderizando, setEstaRenderizando] = useState<boolean>(false)
  const [estaVerificando, setEstaVerificando] = useState<boolean>(false)
  const [estaBloqueado, setEstaBloqueado] = useState<boolean>(false)
  
  // Métricas
  const [tiempoInicio, setTiempoInicio] = useState<number>(Date.now())
  const [numeroIntentos, setNumeroIntentos] = useState<number>(0)
  const [estimacionesExcelentes, setEstimacionesExcelentes] = useState<number>(0)
  
  // Ejemplos y logros
  const [ejemplos, setEjemplos] = useState<any[]>([])
  const [logros, setLogros] = useState<any[]>([])
  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState<string[]>([])
  
  // ✅ INICIALIZAR ESCENARIO
  const inicializarEscenario = useCallback(() => {
    if (!escenarioFactoryRef.current) {
      escenarioFactoryRef.current = new EscenarioFactory()
      escenarioRef.current = escenarioFactoryRef.current.crearEscenario('torre-valor-medio')
      
      console.log('🏰 Escenario Torre del Valor Medio inicializado:', escenarioRef.current)
      
      setEscenario(escenarioRef.current)
      setEstado(escenarioRef.current.obtenerEstado())
      setConfiguracion(escenarioRef.current.obtenerConfiguracion())
      setEjemplos(escenarioRef.current.obtenerEjemplos())
      setLogros(escenarioRef.current.obtenerLogros())
    }
  }, [])
  
  // ✅ CONFIGURAR CANVAS
  const configurarCanvas = useCallback((canvasTorre: HTMLCanvasElement, canvasCartesiano: HTMLCanvasElement) => {
    if (escenarioRef.current) {
      try {
        escenarioRef.current.configurarCanvas(canvasTorre, canvasCartesiano)
        console.log('🎨 Canvas configurado para Torre del Valor Medio')
      } catch (error) {
        console.error('Error configurando canvas:', error)
      }
    }
  }, [])
  
  // ✅ ESTABLECER FUNCIÓN
  const establecerFuncion = useCallback((tipo: string, funcionPersonalizada: string = '') => {
    if (escenarioRef.current) {
      try {
        escenarioRef.current.establecerFuncion(tipo, funcionPersonalizada)
        setFuncionActual(tipo)
        console.log(`📊 Función establecida: ${tipo}`)
      } catch (error) {
        console.error('Error estableciendo función:', error)
      }
    }
  }, [])
  
  // ✅ ESTABLECER LÍMITES
  const establecerLimites = useCallback((a: number, b: number) => {
    if (escenarioRef.current) {
      try {
        escenarioRef.current.establecerLimites(a, b)
        setLimiteA(a)
        setLimiteB(b)
        console.log(`📏 Límites establecidos: [${a}, ${b}]`)
      } catch (error) {
        console.error('Error estableciendo límites:', error)
      }
    }
  }, [])
  
  // ✅ ESTABLECER ESTIMACIÓN DEL USUARIO
  const establecerEstimacionUsuario = useCallback((c: number) => {
    if (escenarioRef.current) {
      try {
        escenarioRef.current.establecerEstimacionUsuario(c)
        setEstimacionUsuario(c)
        setEstaBloqueado(true)
        setNumeroIntentos(prev => prev + 1)
        console.log(`🎯 Estimación del usuario: ${c}`)
      } catch (error) {
        console.error('Error estableciendo estimación:', error)
      }
    }
  }, [])
  
  // ✅ CALCULAR PUNTO C REAL
  const calcularPuntoCReal = useCallback((): number | null => {
    if (escenarioRef.current) {
      try {
        setEstaVerificando(true)
        const puntoC = escenarioRef.current.calcularPuntoCReal()
        setPuntoCReal(puntoC)
        console.log(`🔍 Punto c real calculado: ${puntoC}`)
        return puntoC
      } catch (error) {
        console.error('Error calculando punto c real:', error)
        return null
      } finally {
        setEstaVerificando(false)
      }
    }
    return null
  }, [])
  
  // ✅ VERIFICAR ESTIMACIÓN
  const verificarEstimacion = useCallback((): boolean => {
    if (escenarioRef.current) {
      try {
        const exitosa = escenarioRef.current.verificarEstimacion()
        setVerificacionExitosa(exitosa)
        
        if (exitosa) {
          setEstimacionesExcelentes(prev => prev + 1)
        }
        
        console.log(`✅ Verificación: ${exitosa ? 'Exitosa' : 'Fallida'}`)
        return exitosa
      } catch (error) {
        console.error('Error verificando estimación:', error)
        return false
      }
    }
    return false
  }, [])
  
  // ✅ CARGAR EJEMPLO
  const cargarEjemplo = useCallback((ejemplo: any) => {
    if (escenarioRef.current) {
      try {
        escenarioRef.current.cargarEjemplo(ejemplo)
        setFuncionActual(ejemplo.tipoFuncion)
        setLimiteA(ejemplo.limiteA)
        setLimiteB(ejemplo.limiteB)
        setEstimacionUsuario(null)
        setPuntoCReal(null)
        setErrorEstimacion(0)
        setVerificacionExitosa(false)
        setEstaBloqueado(false)
        console.log(`📚 Ejemplo cargado: ${ejemplo.titulo}`)
      } catch (error) {
        console.error('Error cargando ejemplo:', error)
      }
    }
  }, [])
  
  // ✅ RESETEAR
  const resetear = useCallback(() => {
    if (escenarioRef.current) {
      try {
        escenarioRef.current.resetear()
        setEstimacionUsuario(null)
        setPuntoCReal(null)
        setErrorEstimacion(0)
        setVerificacionExitosa(false)
        setEstaBloqueado(false)
        setEstaVerificando(false)
        console.log('🔄 Escenario reseteado')
      } catch (error) {
        console.error('Error reseteando escenario:', error)
      }
    }
  }, [])
  
  // ✅ MANEJAR CLICK EN TORRE
  const manejarClickTorre = useCallback((evento: MouseEvent): number | null => {
    if (escenarioRef.current) {
      try {
        const x = escenarioRef.current.manejarClickTorre(evento)
        if (x !== null) {
          setEstimacionUsuario(x)
          setEstaBloqueado(true)
          setNumeroIntentos(prev => prev + 1)
        }
        return x
      } catch (error) {
        console.error('Error manejando click en torre:', error)
        return null
      }
    }
    return null
  }, [])
  
  // ✅ MANEJAR CLICK EN CARTESIANO
  const manejarClickCartesiano = useCallback((evento: MouseEvent): number | null => {
    if (escenarioRef.current) {
      try {
        const x = escenarioRef.current.manejarClickCartesiano(evento)
        if (x !== null) {
          setEstimacionUsuario(x)
          setEstaBloqueado(true)
          setNumeroIntentos(prev => prev + 1)
        }
        return x
      } catch (error) {
        console.error('Error manejando click en cartesiano:', error)
        return null
      }
    }
    return null
  }, [])
  
  // ✅ OBTENER INFORMACIÓN DE HOVER
  const obtenerInformacionHover = useCallback((evento: MouseEvent, tipoCanvas: string) => {
    if (escenarioRef.current) {
      try {
        return escenarioRef.current.obtenerInformacionHover(evento, tipoCanvas)
      } catch (error) {
        console.error('Error obteniendo información de hover:', error)
        return null
      }
    }
    return null
  }, [])
  
  // ✅ RENDERIZAR COMPLETO
  const renderizarCompleto = useCallback(() => {
    if (escenarioRef.current) {
      try {
        setEstaRenderizando(true)
        escenarioRef.current.renderizarCompleto()
        console.log('🎨 Renderizado completo ejecutado')
      } catch (error) {
        console.error('Error en renderizado completo:', error)
      } finally {
        setEstaRenderizando(false)
      }
    }
  }, [])
  
  // ✅ OBTENER CÁLCULOS
  const obtenerCalculos = useCallback(() => {
    if (escenarioRef.current) {
      try {
        return escenarioRef.current.obtenerCalculos()
      } catch (error) {
        console.error('Error obteniendo cálculos:', error)
        return null
      }
    }
    return null
  }, [])
  
  // ✅ OBTENER MÉTRICAS
  const obtenerMetricas = useCallback(() => {
    if (escenarioRef.current) {
      try {
        return escenarioRef.current.obtenerMetricas()
      } catch (error) {
        console.error('Error obteniendo métricas:', error)
        return null
      }
    }
    return null
  }, [])
  
  // ✅ OBTENER INFORMACIÓN DEL TEOREMA
  const obtenerInformacionTeorema = useCallback(() => {
    if (escenarioRef.current) {
      try {
        return escenarioRef.current.obtenerInformacionTeorema()
      } catch (error) {
        console.error('Error obteniendo información del teorema:', error)
        return null
      }
    }
    return null
  }, [])

  // ✅ VERIFICAR LOGROS
  const verificarLogros = useCallback(() => {
    if (escenarioRef.current) {
      try {
        return escenarioRef.current.verificarLogros()
      } catch (error) {
        console.error('Error verificando logros:', error)
        return []
      }
    }
    return []
  }, [])
  
  // ✅ VERIFICAR CONDICIONES DEL TEOREMA
  const verificarCondicionesTeorema = useCallback(() => {
    if (escenarioRef.current) {
      try {
        return escenarioRef.current.verificarCondicionesTeorema()
      } catch (error) {
        console.error('Error verificando condiciones del teorema:', error)
        return null
      }
    }
    return null
  }, [])
  
  // ✅ INICIALIZAR AL MONTAR
  useEffect(() => {
    inicializarEscenario()
  }, [inicializarEscenario])
  
  // ✅ ACTUALIZAR ESTADO CUANDO CAMBIE EL ESCENARIO
  useEffect(() => {
    if (estado) {
      setFuncionActual(estado.obtenerTipoFuncion())
      const limites = estado.obtenerLimites()
      setLimiteA(limites.a)
      setLimiteB(limites.b)
      setEstimacionUsuario(estado.obtenerEstimacionUsuario())
      setPuntoCReal(estado.obtenerPuntoCReal())
      setErrorEstimacion(estado.obtenerErrorEstimacion())
      setVerificacionExitosa(estado.obtenerVerificacionExitosa())
      
      const metricas = estado.obtenerMetricas()
      setNumeroIntentos(metricas.numeroIntentos)
      setEstimacionesExcelentes(metricas.estimacionesExcelentes)
    }
  }, [estado])
  
  return {
    // Estado del escenario
    escenario,
    estado,
    configuracion,
    
    // Estado de la interfaz
    funcionActual,
    limiteA,
    limiteB,
    estimacionUsuario,
    puntoCReal,
    errorEstimacion,
    verificacionExitosa,
    
    // Estado de renderizado
    estaRenderizando,
    estaVerificando,
    estaBloqueado,
    
    // Métricas
    tiempoInicio,
    numeroIntentos,
    estimacionesExcelentes,
    
    // Ejemplos y logros
    ejemplos,
    logros,
    logrosDesbloqueados,
    
    // Métodos
    establecerFuncion,
    establecerLimites,
    establecerEstimacionUsuario,
    calcularPuntoCReal,
    verificarEstimacion,
    cargarEjemplo,
    resetear,
    manejarClickTorre,
    manejarClickCartesiano,
    obtenerInformacionHover,
    renderizarCompleto,
    configurarCanvas,
    obtenerCalculos,
    obtenerMetricas,
    obtenerInformacionTeorema,
    verificarCondicionesTeorema,
    verificarLogros
  }
}
