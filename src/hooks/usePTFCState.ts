/**
 * HOOK: usePTFCState
 * RESPONSABILIDAD: Solo sincronización entre React y clases OOP del Primer Teorema Fundamental del Cálculo
 * SRP: Solo sincronización, no lógica de negocio ni presentación
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { EscenarioPTFC } from '../escenarios/EscenarioPTFC.js'

export interface PTFCState {
  estado: any
  configuracion: any
  calculos: any
  logros: any[]
  tiempo: any
  funciones: any
  actualizarFuncion: (funcion: string) => void
  actualizarLimites: (a: number, b: number) => void
  actualizarPosicionX: (x: number) => void
  actualizarAnimacion: (activa: boolean, velocidad?: number) => void
  manejarHover: (evento: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement, tipo?: string) => void
  desactivarHover: () => void
  renderizar: () => Promise<void>
  renderizarCalculos: (container: HTMLElement) => void
  reiniciar: () => void
  limpiar: () => void
  sincronizarConReact: () => void
}

export const usePTFCState = (): PTFCState => {
  // ✅ REFERENCIAS A CLASES OOP
  const escenarioRef = useRef<EscenarioPTFC | null>(null)
  
  // ✅ ESTADO LOCAL PARA SINCRONIZACIÓN
  const [estado, setEstado] = useState<any>(null)
  const [configuracion, setConfiguracion] = useState<any>(null)
  const [calculos, setCalculos] = useState<any>(null)
  const [logros, setLogros] = useState<any[]>([])
  const [tiempo, setTiempo] = useState<any>(null)
  const [funciones, setFunciones] = useState<any>(null)
  
  // ✅ INICIALIZAR ESCENARIO
  const inicializarEscenario = useCallback(() => {
    if (!escenarioRef.current) {
      escenarioRef.current = new EscenarioPTFC()
      
      // Configurar callbacks
      escenarioRef.current.configurarCallbacks({
        onEstadoCambiado: () => {
          sincronizarConReact()
        },
        onLogroDesbloqueado: (logro: any) => {
          console.log('Logro desbloqueado:', logro)
          sincronizarConReact()
        },
        onError: (error: any) => {
          console.error('Error en PTFC:', error)
        }
      })
    }
  }, [])
  
  // ✅ SINCRONIZACIÓN CON REACT
  const sincronizarConReact = useCallback(() => {
    if (escenarioRef.current) {
      try {
        const informacion = escenarioRef.current.obtenerInformacionCompleta()
        
        setEstado(informacion.estado)
        setConfiguracion(informacion.configuracion)
        setCalculos(informacion.calculos)
        setLogros(informacion.logros)
        setTiempo(informacion.tiempo)
        setFunciones(informacion.funciones)
      } catch (error) {
        console.error('Error sincronizando con React:', error)
      }
    }
  }, [])
  
  // ✅ ACTUALIZAR FUNCIÓN
  const actualizarFuncion = useCallback((funcion: string) => {
    if (escenarioRef.current) {
      escenarioRef.current.actualizarFuncion(funcion)
    }
  }, [])
  
  // ✅ ACTUALIZAR LÍMITES
  const actualizarLimites = useCallback((a: number, b: number) => {
    if (escenarioRef.current) {
      escenarioRef.current.actualizarLimites(a, b)
    }
  }, [])
  
  // ✅ ACTUALIZAR POSICIÓN X
  const actualizarPosicionX = useCallback((x: number) => {
    if (escenarioRef.current) {
      escenarioRef.current.actualizarPosicionX(x)
    }
  }, [])
  
  // ✅ ACTUALIZAR ANIMACIÓN
  const actualizarAnimacion = useCallback((activa: boolean, velocidad: number = 1) => {
    if (escenarioRef.current) {
      escenarioRef.current.actualizarAnimacion(activa, velocidad)
    }
  }, [])
  
  // ✅ MANEJAR HOVER
  const manejarHover = useCallback((evento: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement, tipo: string = 'cartesiano') => {
    if (escenarioRef.current) {
      escenarioRef.current.manejarHover(evento, canvas, tipo)
    }
  }, [])
  
  // ✅ DESACTIVAR HOVER
  const desactivarHover = useCallback(() => {
    if (escenarioRef.current) {
      escenarioRef.current.desactivarHover()
    }
  }, [])
  
  // ✅ RENDERIZAR
  const renderizar = useCallback(async () => {
    if (escenarioRef.current) {
      await escenarioRef.current.renderizar()
    }
  }, [])
  
  // ✅ RENDERIZAR CÁLCULOS
  const renderizarCalculos = useCallback((container: HTMLElement) => {
    if (escenarioRef.current) {
      escenarioRef.current.renderizarCalculos(container)
    }
  }, [])
  
  // ✅ REINICIAR
  const reiniciar = useCallback(() => {
    if (escenarioRef.current) {
      escenarioRef.current.reiniciar()
    }
  }, [])
  
  // ✅ LIMPIAR
  const limpiar = useCallback(() => {
    if (escenarioRef.current) {
      escenarioRef.current.limpiar()
    }
  }, [])
  
  // ✅ CONFIGURAR CANVAS
  const configurarCanvas = useCallback((canvasPuente: HTMLCanvasElement, canvasCartesiano: HTMLCanvasElement, containerTooltip?: HTMLElement) => {
    if (escenarioRef.current) {
      escenarioRef.current.configurarCanvas(canvasPuente, canvasCartesiano, containerTooltip)
    }
  }, [])
  
  // ✅ OBTENER ESCENARIO
  const obtenerEscenario = useCallback(() => {
    return escenarioRef.current
  }, [])
  
  // ✅ INICIALIZAR AL MONTAR
  useEffect(() => {
    inicializarEscenario()
    sincronizarConReact()
  }, [inicializarEscenario, sincronizarConReact])
  
  // ✅ LIMPIAR AL DESMONTAR
  useEffect(() => {
    return () => {
      if (escenarioRef.current) {
        escenarioRef.current.limpiar()
      }
    }
  }, [])
  
  return {
    estado,
    configuracion,
    calculos,
    logros,
    tiempo,
    funciones,
    actualizarFuncion,
    actualizarLimites,
    actualizarPosicionX,
    actualizarAnimacion,
    manejarHover,
    desactivarHover,
    renderizar,
    renderizarCalculos,
    reiniciar,
    limpiar,
    sincronizarConReact,
    // Funciones adicionales para configuración
    configurarCanvas,
    obtenerEscenario
  }
}
