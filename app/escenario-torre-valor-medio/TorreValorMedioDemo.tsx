'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useTorreValorMedio } from '../../src/hooks/useTorreValorMedio'
import { useEstimation } from '../../src/hooks/useEstimation'
import { RenderizadorTeoria } from '../../src/presentacion/RenderizadorTeoria.js'
import { FunctionValidator } from '../../src/servicios/FunctionValidator.js'
import { FunctionScaler } from '../../src/servicios/FunctionScaler.js'
import { CustomFunctionManager } from '../../src/servicios/CustomFunctionManager.js'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  Target, 
  Trophy, 
  Clock, 
  Lightbulb, 
  CheckCircle, 
  XCircle,
  Play,
  RotateCcw,
  Search
} from 'lucide-react'

function TorreValorMedioDemo() {
  // Referencias a los canvas
  const canvasTorreRef = useRef<HTMLCanvasElement>(null)
  const canvasCartesianoRef = useRef<HTMLCanvasElement>(null)
  
  // Hook para manejo de estimación
  const { userEstimateC, isEstimating, hasVerified, attempts, startEstimation, updateEstimation, verifyEstimation, resetEstimation } = useEstimation()
  const containerTooltipRef = useRef<HTMLDivElement>(null)
  
  // Hook del escenario
  const {
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
  } = useTorreValorMedio()
  
  // Estado local
  const [tabActivo, setTabActivo] = useState('visualizacion')
  const [funcionPersonalizada, setFuncionPersonalizada] = useState('')
  const [errorFuncion, setErrorFuncion] = useState('')
  const [informacionHover, setInformacionHover] = useState<{x: number, y: number} | null>(null)
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0)
  const [renderizadorTeoria, setRenderizadorTeoria] = useState<RenderizadorTeoria | null>(null)
  
  // Estado para función personalizada
  const [mostrarTeclado, setMostrarTeclado] = useState(false)
  const [cursorPosicion, setCursorPosicion] = useState(0)
  const [sugerencias, setSugerencias] = useState<any[]>([])
  
  // Servicios para función personalizada
  const [functionValidator] = useState(() => new FunctionValidator())
  const [functionScaler] = useState(() => new FunctionScaler())
  const [customFunctionManager] = useState(() => new CustomFunctionManager(functionValidator, functionScaler))
  
  // ✅ CONFIGURAR CANVAS AL MONTAR
  useEffect(() => {
    if (canvasTorreRef.current && canvasCartesianoRef.current) {
      configurarCanvas(canvasTorreRef.current, canvasCartesianoRef.current)
    }
  }, [configurarCanvas])

  // ✅ INICIALIZAR RENDERIZADOR DE TEORÍA
  useEffect(() => {
    if (containerTooltipRef.current) {
      const renderizador = new RenderizadorTeoria(containerTooltipRef.current)
      setRenderizadorTeoria(renderizador)
    }
  }, [])

  // ✅ RENDERIZAR TEORÍA CUANDO SE CAMBIE A LA PESTAÑA
  useEffect(() => {
    if (tabActivo === 'teoria' && renderizadorTeoria && escenario) {
      const informacionTeorema = obtenerInformacionTeorema()
      if (informacionTeorema) {
        renderizadorTeoria.renderizarTeoria(informacionTeorema)
      }
    }
  }, [tabActivo, renderizadorTeoria, escenario, obtenerInformacionTeorema])
  
  // ✅ ACTUALIZAR TIEMPO TRANSCURRIDO
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoTranscurrido(Date.now() - tiempoInicio)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [tiempoInicio])
  
  // ✅ MANEJAR CAMBIO DE FUNCIÓN
  const handleFuncionChange = useCallback((tipo: string) => {
    if (!estaBloqueado) {
      establecerFuncion(tipo, funcionPersonalizada)
    }
  }, [establecerFuncion, funcionPersonalizada, estaBloqueado])
  
  // ✅ MANEJAR CAMBIO DE LÍMITES
  const handleLimitesChange = useCallback((a: number, b: number) => {
    if (!estaBloqueado) {
      establecerLimites(a, b)
    }
  }, [establecerLimites, estaBloqueado])
  
  // ✅ MANEJAR CLICK EN TORRE
  const handleClickTorre = useCallback((evento: React.MouseEvent<HTMLCanvasElement>) => {
    if (!estaBloqueado && !hasVerified) {
      const x = manejarClickTorre(evento.nativeEvent)
      if (x !== null) {
        startEstimation(x)
        console.log(`🎯 Estimación colocada en torre: ${x}`)
      }
    }
  }, [manejarClickTorre, estaBloqueado, hasVerified, startEstimation])
  
  // ✅ MANEJAR CLICK EN CARTESIANO
  const handleClickCartesiano = useCallback((evento: React.MouseEvent<HTMLCanvasElement>) => {
    if (!estaBloqueado && !hasVerified) {
      const x = manejarClickCartesiano(evento.nativeEvent)
      if (x !== null) {
        if (isEstimating) {
          updateEstimation(x)
        } else {
          startEstimation(x)
        }
        console.log(`🎯 Estimación colocada en cartesiano: ${x}`)
      }
    }
  }, [manejarClickCartesiano, estaBloqueado, hasVerified, isEstimating, startEstimation, updateEstimation])
  
  // ✅ MANEJAR HOVER
  const handleHover = useCallback((evento: React.MouseEvent<HTMLCanvasElement>, tipoCanvas: string) => {
    const info = obtenerInformacionHover(evento.nativeEvent, tipoCanvas)
    setInformacionHover(info)
  }, [obtenerInformacionHover])
  
  // ✅ MANEJAR VERIFICACIÓN
  const handleVerificacion = useCallback(async () => {
    if (estimacionUsuario !== null) {
      const puntoC = calcularPuntoCReal()
      if (puntoC !== null) {
        const exitosa = verificarEstimacion()
        console.log(`✅ Verificación: ${exitosa ? 'Exitosa' : 'Fallida'}`)
        
        // Verificar logros después de la verificación
        const logrosDesbloqueados = verificarLogros()
        if (logrosDesbloqueados.length > 0) {
          console.log('🏆 Logros desbloqueados:', logrosDesbloqueados)
        }
      }
    }
  }, [estimacionUsuario, calcularPuntoCReal, verificarEstimacion, verificarLogros])

  // ✅ MANEJAR FUNCIÓN PERSONALIZADA
  const handleFuncionPersonalizada = useCallback((func: string) => {
    setFuncionPersonalizada(func)
    
    // Validar función en tiempo real
    const validation = functionValidator.validateComplete(func, limiteA, limiteB)
    
    if (validation.valid) {
      setErrorFuncion('')
      // Establecer función personalizada en el escenario
      establecerFuncion('personalizada', func)
    } else {
      setErrorFuncion(validation.error)
    }
  }, [functionValidator, limiteA, limiteB, establecerFuncion])

  // ✅ INSERTAR EN POSICIÓN DEL CURSOR
  const insertarEnCursor = useCallback((texto: string) => {
    const nuevaFuncion = funcionPersonalizada.slice(0, cursorPosicion) + texto + funcionPersonalizada.slice(cursorPosicion)
    setFuncionPersonalizada(nuevaFuncion)
    setCursorPosicion(cursorPosicion + texto.length)
  }, [funcionPersonalizada, cursorPosicion])

  // ✅ OBTENER SUGERENCIAS INTELIGENTES
  const obtenerSugerencias = useCallback(() => {
    const sugerencias = customFunctionManager.getSmartSuggestions(funcionPersonalizada, [limiteA, limiteB])
    setSugerencias(sugerencias)
  }, [customFunctionManager, funcionPersonalizada, limiteA, limiteB])

  // ✅ MANEJAR CAMBIO DE FUNCIÓN
  const handleCambioFuncion = useCallback((tipo: string) => {
    if (tipo === 'personalizada') {
      // Mostrar teclado para función personalizada
      setMostrarTeclado(true)
      obtenerSugerencias()
      // Establecer función personalizada
      establecerFuncion('personalizada', funcionPersonalizada)
    } else {
      // Ocultar teclado para funciones predefinidas
      setMostrarTeclado(false)
      establecerFuncion(tipo)
    }
  }, [establecerFuncion, obtenerSugerencias, funcionPersonalizada])
  
  // ✅ MANEJAR CARGA DE EJEMPLO
  const handleCargarEjemplo = useCallback((ejemplo: any) => {
    cargarEjemplo(ejemplo)
    console.log(`📚 Ejemplo cargado: ${ejemplo.titulo}`)
  }, [cargarEjemplo])
  
  // ✅ MANEJAR RESET
  const handleReset = useCallback(() => {
    resetear()
    setFuncionPersonalizada('')
    setErrorFuncion('')
    setInformacionHover(null)
    console.log('🔄 Escenario reseteado')
  }, [resetear])
  
  // ✅ MANEJAR FUNCIÓN PERSONALIZADA
  const handleFuncionPersonalizadaChange = useCallback((valor: string) => {
    setFuncionPersonalizada(valor)
    setErrorFuncion('')
    
    try {
      if (valor.trim()) {
        const func = new Function('x', `return ${valor}`)
        // Probar la función
        func(0)
        establecerFuncion('personalizada', valor)
      }
    } catch (error) {
      setErrorFuncion('Sintaxis inválida')
    }
  }, [establecerFuncion])
  
  // ✅ FORMATEAR TIEMPO
  const formatearTiempo = (ms: number) => {
    const segundos = Math.floor(ms / 1000)
    const minutos = Math.floor(segundos / 60)
    const segundosRestantes = segundos % 60
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`
  }
  
  // ✅ OBTENER CLASIFICACIÓN DE ERROR
  const obtenerClasificacionError = (error: number) => {
    if (error < 0.1) return { nivel: 'Perfecto', emoji: '🎯', color: 'bg-green-100 text-green-800' }
    if (error < 0.3) return { nivel: 'Excelente', emoji: '✨', color: 'bg-blue-100 text-blue-800' }
    if (error < 0.6) return { nivel: 'Bueno', emoji: '👍', color: 'bg-yellow-100 text-yellow-800' }
    return { nivel: 'Intenta', emoji: '🔄', color: 'bg-red-100 text-red-800' }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏰 Torre del Valor Medio
          </h1>
          <p className="text-lg text-gray-600">
            Bienvenido al reino mágico del cálculo, donde las derivadas e integrales se encuentran en perfecta armonía
          </p>
        </div>
        
        {/* Navegación de pestañas */}
        <Tabs value={tabActivo} onValueChange={setTabActivo} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="teoria">Teoría</TabsTrigger>
            <TabsTrigger value="ejemplos">Ejemplos</TabsTrigger>
            <TabsTrigger value="visualizacion">Visualización</TabsTrigger>
            <TabsTrigger value="segundo-teorema">2do Teorema Fundamental</TabsTrigger>
          </TabsList>
          
          {/* Pestaña de Teoría */}
          <TabsContent value="teoria" className="space-y-6">
            <div ref={containerTooltipRef} className="min-h-[600px]">
              {/* El contenido se renderiza dinámicamente por RenderizadorTeoria.js */}
            </div>
          </TabsContent>
          
          {/* Pestaña de Ejemplos */}
          <TabsContent value="ejemplos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Ejemplos Mágicos
                </CardTitle>
                <CardDescription>
                  Haz clic en un ejemplo para cargarlo y explorar cómo funciona el teorema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ejemplos.map((ejemplo) => (
                    <Card key={ejemplo.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 text-xl">*</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {ejemplo.titulo}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {ejemplo.descripcion}
                          </p>
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>Función:</strong> {ejemplo.funcion}
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>Intervalo:</strong> [{ejemplo.limiteA}, {ejemplo.limiteB}]
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>Valor de c:</strong> {ejemplo.puntoC}
                          </div>
                          <div className="bg-yellow-50 p-2 rounded text-sm text-yellow-800 mb-3">
                            {ejemplo.insight}
                          </div>
                          <Button 
                            onClick={() => handleCargarEjemplo(ejemplo)}
                            className="w-full"
                            size="sm"
                          >
                            Cargar ejemplo
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestaña de Visualización */}
          <TabsContent value="visualizacion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Panel de Controles */}
              <div className="space-y-4">
                {/* Controles Interactivos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Controles Interactivos</CardTitle>
                    <CardDescription>
                      Ajusta los parámetros para explorar el teorema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Límites */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Punto inicial a = {limiteA.toFixed(1)}</label>
                      <Slider
                        value={[limiteA]}
                        onValueChange={(value) => handleLimitesChange(value[0], limiteB)}
                        min={-4}
                        max={4}
                        step={0.1}
                        disabled={estaBloqueado}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Punto final b = {limiteB.toFixed(1)}</label>
                      <Slider
                        value={[limiteB]}
                        onValueChange={(value) => handleLimitesChange(limiteA, value[0])}
                        min={-4}
                        max={4}
                        step={0.1}
                        disabled={estaBloqueado}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Tipo de función */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de función</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={funcionActual === 'cuadratica' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleFuncionChange('cuadratica')}
                          disabled={estaBloqueado}
                        >
                          x²
                        </Button>
                        <Button
                          variant={funcionActual === 'cubica' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleFuncionChange('cubica')}
                          disabled={estaBloqueado}
                        >
                          x³
                        </Button>
                        <Button
                          variant={funcionActual === 'seno' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleFuncionChange('seno')}
                          disabled={estaBloqueado}
                        >
                          sin(x)
                        </Button>
                        <Button
                          variant={funcionActual === 'lineal' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleFuncionChange('lineal')}
                          disabled={estaBloqueado}
                        >
                          2x + 1
                        </Button>
                        <Button
                          variant={funcionActual === 'personalizada' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleCambioFuncion('personalizada')}
                          disabled={estaBloqueado}
                        >
                          f(x)
                        </Button>
                      </div>
                    </div>
                    
                    {/* Función personalizada */}
                    {funcionActual === 'personalizada' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Función personalizada</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={funcionPersonalizada}
                            onChange={(e) => {
                              setFuncionPersonalizada(e.target.value)
                              setCursorPosicion(e.target.selectionStart || 0)
                              handleFuncionPersonalizada(e.target.value)
                            }}
                            placeholder="x**2"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            disabled={estaBloqueado}
                          />
                          <Button
                            onClick={() => setMostrarTeclado(!mostrarTeclado)}
                            variant="outline"
                            size="sm"
                          >
                            {mostrarTeclado ? 'Ocultar' : 'Mostrar'} Teclado
                          </Button>
                        </div>
                        
                        {errorFuncion && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {errorFuncion}
                          </div>
                        )}
                        
                        {/* Sugerencias */}
                        {sugerencias.length > 0 && (
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-600">Sugerencias:</label>
                            <div className="flex flex-wrap gap-1">
                              {sugerencias.map((sugerencia, index) => (
                                <Button
                                  key={index}
                                  onClick={() => insertarEnCursor(sugerencia.code)}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  {sugerencia.name}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Teclado matemático */}
                        {mostrarTeclado && (
                          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="grid grid-cols-4 gap-2">
                              <Button onClick={() => insertarEnCursor('+')} variant="outline" size="sm">+</Button>
                              <Button onClick={() => insertarEnCursor('-')} variant="outline" size="sm">-</Button>
                              <Button onClick={() => insertarEnCursor('*')} variant="outline" size="sm">×</Button>
                              <Button onClick={() => insertarEnCursor('/')} variant="outline" size="sm">÷</Button>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-2">
                              <Button onClick={() => insertarEnCursor('**')} variant="outline" size="sm">x^y</Button>
                              <Button onClick={() => insertarEnCursor('(')} variant="outline" size="sm">(</Button>
                              <Button onClick={() => insertarEnCursor(')')} variant="outline" size="sm">)</Button>
                              <Button onClick={() => insertarEnCursor('x')} variant="outline" size="sm">x</Button>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-2">
                              <Button onClick={() => insertarEnCursor('Math.sin(')} variant="outline" size="sm">sin</Button>
                              <Button onClick={() => insertarEnCursor('Math.cos(')} variant="outline" size="sm">cos</Button>
                              <Button onClick={() => insertarEnCursor('Math.tan(')} variant="outline" size="sm">tan</Button>
                              <Button onClick={() => insertarEnCursor('Math.exp(')} variant="outline" size="sm">e^x</Button>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-2">
                              <Button onClick={() => insertarEnCursor('Math.log(')} variant="outline" size="sm">ln</Button>
                              <Button onClick={() => insertarEnCursor('Math.sqrt(')} variant="outline" size="sm">√</Button>
                              <Button onClick={() => insertarEnCursor('Math.abs(')} variant="outline" size="sm">|x|</Button>
                              <Button onClick={() => insertarEnCursor('Math.PI')} variant="outline" size="sm">π</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Instrucciones */}
                    <div className="bg-purple-50 p-3 rounded text-sm text-purple-800">
                      <strong>Paso 1:</strong> Haz clic en la gráfica o torre para colocar tu estimación de c.
                    </div>
                  </CardContent>
                </Card>
                
                {/* Logros */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Logros
                    </CardTitle>
                    <CardDescription>
                      {logrosDesbloqueados.length} de {logros.length} desbloqueados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {logros.map((logro) => (
                        <div key={logro.id} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                          logrosDesbloqueados.includes(logro.id) 
                            ? 'bg-yellow-50 border border-yellow-200 shadow-sm' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            logrosDesbloqueados.includes(logro.id)
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg' 
                              : 'bg-gray-300'
                          }`}>
                            <span className="text-lg">
                              {logrosDesbloqueados.includes(logro.id) ? '🏆' : '🔒'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm font-medium ${
                              logrosDesbloqueados.includes(logro.id) ? 'text-yellow-700' : 'text-gray-500'
                            }`}>
                              {logro.titulo}
                            </span>
                            {logro.descripcion && (
                              <p className={`text-xs mt-1 ${
                                logrosDesbloqueados.includes(logro.id) ? 'text-yellow-600' : 'text-gray-400'
                              }`}>
                                {logro.descripcion}
                              </p>
                            )}
                          </div>
                          {logrosDesbloqueados.includes(logro.id) && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Cronómetro */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Cronómetro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-mono font-bold text-blue-600">
                        {formatearTiempo(tiempoTranscurrido)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Tiempo total</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Visualizaciones */}
              <div className="lg:col-span-2 space-y-4">
                {/* Torre del Valor Medio */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Torre del Valor Medio</CardTitle>
                    <CardDescription>
                      Representación visual de la función
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <canvas
                        ref={canvasTorreRef}
                        onClick={handleClickTorre}
                        onMouseMove={(e) => handleHover(e, 'torre')}
                        className="w-full h-80 border rounded-lg cursor-crosshair"
                        style={{ background: 'linear-gradient(180deg, #D1C4E9 0%, #F8BBD0 100%)' }}
                      />
                      {informacionHover && (
                        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                          x: {informacionHover.x.toFixed(2)}, y: {informacionHover.y.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Plano Cartesiano */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plano Cartesiano</CardTitle>
                    <CardDescription>
                      Haz clic para colocar tu estimación de c
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <canvas
                        ref={canvasCartesianoRef}
                        onClick={handleClickCartesiano}
                        onMouseMove={(e) => handleHover(e, 'cartesiano')}
                        className="w-full h-80 border rounded-lg cursor-crosshair bg-white"
                      />
                      {informacionHover && (
                        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                          x: {informacionHover.x.toFixed(2)}, y: {informacionHover.y.toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={handleVerificacion}
                        disabled={estimacionUsuario === null || estaVerificando || hasVerified}
                        className="flex-1"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {estaVerificando ? 'Buscando c...' : 'Buscar c'}
                      </Button>
                      <Button
                        onClick={resetEstimation}
                        variant="outline"
                        disabled={estimacionUsuario === null}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Intentar de nuevo
                      </Button>
                    </div>
                    
                    {/* Indicadores de estado */}
                    {isEstimating && (
                      <div className="mt-2 text-sm text-blue-600">
                        Estimando c... Haz clic para reposicionar (Intento {attempts})
                      </div>
                    )}
                    
                    {hasVerified && (
                      <div className="mt-2 text-sm text-green-600">
                        c verificado
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Resultados */}
                {estimacionUsuario !== null && puntoCReal !== null && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resultado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Tu estimación:</span>
                            <span className="ml-2 text-blue-600">{estimacionUsuario.toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="font-medium">c real:</span>
                            <span className="ml-2 text-orange-600">{puntoCReal.toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Error:</span>
                            <span className="ml-2 text-red-600">{errorEstimacion.toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Precisión:</span>
                            <span className="ml-2 text-green-600">
                              {((1 - errorEstimacion / Math.abs(puntoCReal)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {verificacionExitosa ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="font-medium">
                              {verificacionExitosa ? 'Verificación exitosa' : 'Verificación fallida'}
                            </span>
                          </div>
                          <Badge className={obtenerClasificacionError(errorEstimacion).color}>
                            {obtenerClasificacionError(errorEstimacion).emoji} {obtenerClasificacionError(errorEstimacion).nivel}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Pestaña del Segundo Teorema Fundamental */}
          <TabsContent value="segundo-teorema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calculator className="h-6 w-6" />
                  Segundo Teorema Fundamental del Cálculo
                </CardTitle>
                <CardDescription>
                  La conexión entre derivadas e integrales definidas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Enunciado del Teorema</h3>
                  <p className="text-blue-700 mb-3">
                    Si f es continua en [a, b] y F(x) = ∫[a,x] f(t) dt, entonces F'(x) = f(x) para todo x en [a, b].
                  </p>
                  <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                    <code className="text-sm font-mono">
                      d/dx [∫[a,x] f(t) dt] = f(x)
                    </code>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Interpretación Geométrica</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>La derivada de la integral es la función original</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Conecta el área bajo la curva con la pendiente</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Fundamental para el cálculo de integrales</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Aplicaciones</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Cálculo de integrales definidas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Resolución de ecuaciones diferenciales</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Análisis de funciones acumulativas</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Ejemplo Práctico</h3>
                  <p className="text-yellow-700 mb-3">
                    Si f(x) = x², entonces F(x) = ∫[0,x] t² dt = x³/3
                  </p>
                  <p className="text-yellow-700">
                    Verificamos: F'(x) = d/dx[x³/3] = x² = f(x) ✓
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Estado de Implementación</h3>
                  <p className="text-gray-600">
                    Esta sección está preparada para futuras implementaciones del Segundo Teorema Fundamental del Cálculo.
                    Incluirá visualizaciones interactivas y ejemplos prácticos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default TorreValorMedioDemo
