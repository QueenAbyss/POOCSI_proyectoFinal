"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Settings, BookOpen, Lightbulb, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

import { FuncionMatematica } from "@/src/entidades/FuncionMatematica"
import { EstadoVisualizacion } from "@/src/entidades/EstadoVisualizacion"
import { ConfiguracionCanvas } from "@/src/entidades/ConfiguracionCanvas"
import { CalculadoraRiemann } from "@/src/servicios/CalculadoraRiemann"
import { CalculadoraIntegralExacta } from "@/src/servicios/CalculadoraIntegralExacta"
import { CalculadoraError } from "@/src/servicios/CalculadoraError"
import { GestorLogros } from "@/src/servicios/GestorLogros"
import { GestorAnimacion } from "@/src/servicios/GestorAnimacion"
import { GestorMetricas } from "@/src/servicios/GestorMetricas"
import { TransformadorCoordenadas } from "@/src/servicios/TransformadorCoordenadas"
import { RenderizadorCanvas } from "@/src/presentacion/RenderizadorCanvas"
import { RenderizadorEjes } from "@/src/presentacion/RenderizadorEjes"
import { RenderizadorFuncion } from "@/src/presentacion/RenderizadorFuncion"
import { RenderizadorRectangulos } from "@/src/presentacion/RenderizadorRectangulos"
import { RenderizadorPuntos } from "@/src/presentacion/RenderizadorPuntos"
import { GestorInteraccion } from "@/src/interaccion/GestorInteraccion"
import { PuntoInteractivo } from "@/src/entidades/PuntoInteractivo"
import { AlmacenadorProgreso } from "@/src/persistencia/AlmacenadorProgreso"

export default function JardinRiemannPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [estado] = useState(() => new EstadoVisualizacion())
  const [configuracion] = useState(() => new ConfiguracionCanvas(800, 500))
  const calculadoraRiemann = useRef(new CalculadoraRiemann())
  const calculadoraExacta = useRef(new CalculadoraIntegralExacta())
  const calculadoraError = useRef(new CalculadoraError())
  const gestorLogros = useRef(new GestorLogros())
  const gestorAnimacion = useRef(new GestorAnimacion())
  const gestorMetricas = useRef(new GestorMetricas())
  const almacenador = useRef(new AlmacenadorProgreso())
  const gestorInteraccion = useRef<GestorInteraccion | null>(null)

  // Estado React para UI
  const [funcionActual, setFuncionActual] = useState("parabola")
  const [aproximacionRiemann, setAproximacionRiemann] = useState(0)
  const [integralExacta, setIntegralExacta] = useState(0)
  const [errorAbsoluto, setErrorAbsoluto] = useState(0)
  const [precision, setPrecision] = useState(0)
  const [logros, setLogros] = useState(gestorLogros.current.obtenerLogros())
  const [metricas, setMetricas] = useState(gestorMetricas.current.obtenerResumen())
  const [, setForceUpdate] = useState(0)

  // Funciones disponibles
  const funciones = {
    parabola: new FuncionMatematica("cuadratica", { a: 0.5, b: 0, c: 1 }),
    seno: new FuncionMatematica("seno", { a: 2, b: 1, c: 0, d: 3 }),
    cubica: new FuncionMatematica("cubica", { a: 0.1, b: 0.5, c: 0, d: 2 }),
  }

  useEffect(() => {
    if (!canvasRef.current) return

    // Inicializar función
    estado.funcion = funciones[funcionActual as keyof typeof funciones]

    // Configurar interacción
    const intervaloX = estado.obtenerIntervalo()
    const intervaloY = { min: -1, max: 10 }
    const transformador = new TransformadorCoordenadas(configuracion, intervaloX, intervaloY)

    gestorInteraccion.current = new GestorInteraccion(canvasRef.current, transformador)
    gestorInteraccion.current.callbacks.onLimiteIzquierdoCambiado = (x) => {
      estado.actualizarLimites(x, estado.limiteDerecho)
      calcularYRenderizar()
    }
    gestorInteraccion.current.callbacks.onLimiteDerechoCambiado = (x) => {
      estado.actualizarLimites(estado.limiteIzquierdo, x)
      calcularYRenderizar()
    }

    // Agregar puntos interactivos
    const puntoIzq = transformador.matematicasACanvas(estado.limiteIzquierdo, 0)
    const puntoDer = transformador.matematicasACanvas(estado.limiteDerecho, 0)
    gestorInteraccion.current.agregarPunto(new PuntoInteractivo(puntoIzq.x, puntoIzq.y, "limite-izquierdo"))
    gestorInteraccion.current.agregarPunto(new PuntoInteractivo(puntoDer.x, puntoDer.y, "limite-derecho"))

    calcularYRenderizar()
  }, [funcionActual])

  const calcularYRenderizar = () => {
    if (!canvasRef.current || !estado.funcion) return

    const intervalo = estado.obtenerIntervalo()
    const tipoAproximacion =
      estado.tipoHechizo === "izquierdo" ? "izquierda" : estado.tipoHechizo === "derecho" ? "derecha" : "punto-medio"

    // Calcular valores usando las clases de servicio
    const aprox = calculadoraRiemann.current.calcularSumaRiemann(
      estado.funcion,
      intervalo,
      estado.numeroMacetas,
      tipoAproximacion,
    )
    const exacta = calculadoraExacta.current.calcular(estado.funcion, intervalo)
    const error = calculadoraError.current.calcularErrorAbsoluto(aprox, exacta)
    const prec = calculadoraError.current.calcularPrecision(aprox, exacta)

    setAproximacionRiemann(aprox)
    setIntegralExacta(exacta)
    setErrorAbsoluto(error)
    setPrecision(prec)

    // Actualizar métricas
    gestorMetricas.current.registrarIntento()
    gestorMetricas.current.calcularPrecision(aprox, exacta)
    setMetricas(gestorMetricas.current.obtenerResumen())

    // Verificar logros
    const datosLogros = {
      errorAbsoluto: error,
      tiempo: gestorMetricas.current.obtenerResumen().tiempo,
      macetas: estado.numeroMacetas,
    }
    const nuevosLogros = gestorLogros.current.verificarLogros(datosLogros)
    if (nuevosLogros.length > 0) {
      setLogros([...gestorLogros.current.obtenerLogros()])
    }

    // Renderizar
    renderizar()
  }

  const renderizar = () => {
    if (!canvasRef.current || !estado.funcion) return

    const intervalo = estado.obtenerIntervalo()
    const intervaloY = { min: -1, max: 10 }
    const transformador = new TransformadorCoordenadas(configuracion, intervalo, intervaloY)

    // Crear renderizadores
    const renderizadorCanvas = new RenderizadorCanvas(canvasRef.current, configuracion)
    const renderizadorEjes = new RenderizadorEjes(configuracion, transformador)
    const renderizadorFuncion = new RenderizadorFuncion(estado.funcion, transformador, configuracion)

    const tipoAproximacion =
      estado.tipoHechizo === "izquierdo" ? "izquierda" : estado.tipoHechizo === "derecho" ? "derecha" : "punto-medio"
    const rectangulos = calculadoraRiemann.current.generarRectangulos(
      estado.funcion,
      intervalo,
      estado.numeroMacetas,
      tipoAproximacion,
    )
    const renderizadorRectangulos = new RenderizadorRectangulos(rectangulos, transformador, configuracion)

    const puntos = gestorInteraccion.current?.obtenerPuntos() || []
    const renderizadorPuntos = new RenderizadorPuntos(puntos, transformador)

    // Renderizar todo
    renderizadorCanvas.renderizar([renderizadorEjes, renderizadorRectangulos, renderizadorFuncion, renderizadorPuntos])
  }

  const toggleAnimacion = () => {
    if (gestorAnimacion.current.estaActiva()) {
      gestorAnimacion.current.detener()
      estado.detener()
    } else {
      gestorAnimacion.current.iniciar(estado.numeroMacetas, 50, (macetas) => {
        estado.actualizarMacetas(macetas)
        calcularYRenderizar()
        setForceUpdate((n) => n + 1)
      })
      estado.toggleAnimacion()
    }
    setForceUpdate((n) => n + 1)
  }

  const reiniciar = () => {
    estado.reiniciar()
    gestorMetricas.current.reiniciar()
    gestorLogros.current.reiniciar()
    setLogros([...gestorLogros.current.obtenerLogros()])
    setMetricas(gestorMetricas.current.obtenerResumen())
    calcularYRenderizar()
  }

  const nombresFunciones = {
    parabola: "Parábola Mágica",
    seno: "Onda Senoidal",
    cubica: "Curva Cúbica",
  }

  const expresionesFunciones = {
    parabola: "f(x) = 0.5x² + 1",
    seno: "f(x) = 2sin(x) + 3",
    cubica: "f(x) = 0.1x³ + 0.5x² + 2",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-green-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white text-xl">
              🌸
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">El Jardín Mágico de Riemann</h1>
              <p className="text-sm text-green-600">
                Aprende integrales definidas plantando macetas mágicas con el Hada Aria
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <span className="text-purple-600">✨</span>
            Propiedades Mágicas
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="visualizacion" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="teoria" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Teoría
            </TabsTrigger>
            <TabsTrigger value="visualizacion" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Visualización
            </TabsTrigger>
            <TabsTrigger value="ejemplos" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              Ejemplos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualizacion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Panel Izquierdo */}
              <div className="space-y-6">
                {/* Función Actual */}
                <Card className="p-6 bg-white border-2 border-green-200">
                  <div className="text-center space-y-3">
                    <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                      Función Actual:
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      {expresionesFunciones[funcionActual as keyof typeof expresionesFunciones]}
                    </div>
                    <div className="text-sm text-green-600">
                      {nombresFunciones[funcionActual as keyof typeof nombresFunciones]}
                    </div>
                    <div className="pt-3 border-t border-green-100">
                      <div className="text-sm text-gray-600 mb-1">Integral Definida:</div>
                      <div className="text-lg font-mono text-blue-600">
                        ∫[{estado.limiteIzquierdo.toFixed(1)}, {estado.limiteDerecho.toFixed(1)}] f(x)dx
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <span className="font-medium">💡 Tip:</span> Arrastra los puntos rojos y azules para cambiar los
                    límites de integración
                  </div>
                </Card>
              </div>

              {/* Canvas Central */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 bg-white">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Visualización Mágica</h3>
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={500}
                      className="w-full border-2 border-green-200 rounded-lg bg-green-50"
                    />
                  </div>
                </Card>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-blue-50 border-2 border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">Aproximación de Riemann</div>
                    <div className="text-3xl font-bold text-blue-700">{aproximacionRiemann.toFixed(4)}</div>
                    <div className="text-xs text-blue-500 mt-1">Σf(xi) con {estado.numeroMacetas} macetas</div>
                  </Card>
                  <Card className="p-4 bg-green-50 border-2 border-green-200">
                    <div className="text-sm text-green-600 mb-1">Integral Exacta</div>
                    <div className="text-3xl font-bold text-green-700">{integralExacta.toFixed(4)}</div>
                    <div className="text-xs text-green-500 mt-1">Teorema Fundamental del Cálculo</div>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-2 border-purple-200">
                    <div className="text-sm text-purple-600 mb-1">Error</div>
                    <div className="text-3xl font-bold text-purple-700">{errorAbsoluto.toFixed(6)}</div>
                    <div className="text-xs text-purple-500 mt-1">Aproximación - Exacta</div>
                  </Card>
                </div>

                {/* Verificación y Logros */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-blue-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        ✓
                      </div>
                      <h4 className="font-bold text-blue-900">Verificación Mágica</h4>
                      <span className="ml-auto text-sm text-blue-600">0:40</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Precisión</span>
                        <span className="font-bold text-blue-600">{precision.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${precision}%` }} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="text-center">
                          <div className="text-xs text-gray-600">Tu Aproximación</div>
                          <div className="font-bold text-blue-700">{aproximacionRiemann.toFixed(4)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600">Valor Exacto</div>
                          <div className="font-bold text-green-700">{integralExacta.toFixed(4)}</div>
                        </div>
                      </div>
                      <div className="text-center pt-2">
                        <div className="text-xs text-gray-600">Error Absoluto</div>
                        <div className="font-bold text-purple-700">{errorAbsoluto.toFixed(6)}</div>
                      </div>
                      <div className="mt-3 p-2 bg-blue-100 rounded text-center text-sm text-blue-800 font-medium">
                        {precision > 99
                          ? "¡BIEN! Vas por buen camino, intenta con más macetas"
                          : "Aumenta las macetas para mejorar"}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-yellow-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white">
                        🏆
                      </div>
                      <h4 className="font-bold text-yellow-900">Logros del Jardín Mágico</h4>
                    </div>
                    <div className="space-y-2">
                      {logros.map((logro) => (
                        <div
                          key={logro.id}
                          className={`p-2 rounded-lg border-2 ${
                            logro.desbloqueado
                              ? "bg-green-100 border-green-300"
                              : "bg-gray-100 border-gray-200 opacity-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{logro.icono}</span>
                            <div className="flex-1">
                              <div className="font-bold text-sm">{logro.nombre}</div>
                              <div className="text-xs text-gray-600">{logro.descripcion}</div>
                            </div>
                            {logro.desbloqueado && <span className="text-green-600">✓</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Panel Derecho - Controles */}
            <Card className="p-6 bg-white">
              <div className="space-y-6">
                {/* Modo de Aprendizaje */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Modo de Aprendizaje</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={estado.modoAprendizaje === "guiado" ? "default" : "outline"}
                      onClick={() => {
                        estado.cambiarModoAprendizaje("guiado")
                        setForceUpdate((n) => n + 1)
                      }}
                      className="gap-2"
                    >
                      📚 Guiado
                    </Button>
                    <Button
                      variant={estado.modoAprendizaje === "libre" ? "default" : "outline"}
                      onClick={() => {
                        estado.cambiarModoAprendizaje("libre")
                        setForceUpdate((n) => n + 1)
                      }}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      ✨ Libre
                    </Button>
                  </div>
                </div>

                {/* Función del Jardín */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Función del Jardín</h4>
                  <div className="space-y-2">
                    {Object.entries(nombresFunciones).map(([key, nombre]) => (
                      <Button
                        key={key}
                        variant={funcionActual === key ? "default" : "outline"}
                        onClick={() => setFuncionActual(key)}
                        className={`w-full justify-start gap-2 ${funcionActual === key ? "bg-green-600" : ""}`}
                      >
                        <span>{key === "parabola" ? "🌱" : key === "seno" ? "🌊" : "🌿"}</span>
                        {nombre}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Número de Macetas */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-800">Número de Macetas</h4>
                    <span className="text-2xl font-bold text-green-600">{estado.numeroMacetas}</span>
                  </div>
                  <Slider
                    value={[estado.numeroMacetas]}
                    onValueChange={([value]) => {
                      estado.actualizarMacetas(value)
                      calcularYRenderizar()
                      setForceUpdate((n) => n + 1)
                    }}
                    min={1}
                    max={50}
                    step={1}
                    className="mb-2"
                  />
                  <Button variant="destructive" size="sm" className="w-full">
                    Sembrar
                  </Button>
                </div>

                {/* Animación */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Animación</h4>
                  <Button onClick={toggleAnimacion} className="w-full gap-2 bg-green-600 hover:bg-green-700">
                    {gestorAnimacion.current.estaActiva() ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {gestorAnimacion.current.estaActiva() ? "Pausar" : "Play"}
                  </Button>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Velocidad</span>
                      <span className="text-gray-800">{estado.velocidadAnimacion.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[estado.velocidadAnimacion]}
                      onValueChange={([value]) => {
                        estado.actualizarVelocidad(value)
                        gestorAnimacion.current.cambiarVelocidad(value)
                        setForceUpdate((n) => n + 1)
                      }}
                      min={0.1}
                      max={5}
                      step={0.1}
                    />
                  </div>
                </div>

                {/* Controles del Jardín */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Controles del Jardín</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Límite Izquierdo</span>
                        <span className="text-gray-800">{estado.limiteIzquierdo.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[estado.limiteIzquierdo]}
                        onValueChange={([value]) => {
                          estado.actualizarLimites(value, estado.limiteDerecho)
                          calcularYRenderizar()
                          setForceUpdate((n) => n + 1)
                        }}
                        min={-10}
                        max={0}
                        step={0.1}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Límite Derecho</span>
                        <span className="text-gray-800">{estado.limiteDerecho.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[estado.limiteDerecho]}
                        onValueChange={([value]) => {
                          estado.actualizarLimites(estado.limiteIzquierdo, value)
                          calcularYRenderizar()
                          setForceUpdate((n) => n + 1)
                        }}
                        min={0}
                        max={10}
                        step={0.1}
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo de Hechizo */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Tipo de Hechizo</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {["izquierdo", "derecho", "central"].map((tipo) => (
                      <Button
                        key={tipo}
                        variant={estado.tipoHechizo === tipo ? "default" : "outline"}
                        onClick={() => {
                          estado.cambiarTipoHechizo(tipo)
                          calcularYRenderizar()
                          setForceUpdate((n) => n + 1)
                        }}
                        className={`text-xs ${estado.tipoHechizo === tipo ? "bg-green-600" : ""}`}
                      >
                        {tipo === "izquierdo" ? "⬅️ Izq" : tipo === "derecho" ? "➡️ Der" : "⬆️ Central"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <span className="font-medium">💡</span> Arrastra los puntos rojos y azules en el gráfico
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2 bg-transparent">
                    <Settings className="w-4 h-4" />
                    Configuración
                  </Button>
                  <Button onClick={reiniciar} variant="outline" className="flex-1 gap-2 bg-transparent">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="teoria">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-4">Teoría: Sumas de Riemann</h3>
              <p className="text-gray-700">Contenido teórico sobre sumas de Riemann...</p>
            </Card>
          </TabsContent>

          <TabsContent value="ejemplos">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-4">Ejemplos Prácticos</h3>
              <p className="text-gray-700">Ejemplos resueltos paso a paso...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
