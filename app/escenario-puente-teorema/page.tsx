"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle2, XCircle, Calculator, TrendingUp } from "lucide-react"
import Link from "next/link"
import { FuncionMatematica } from "@/src/entidades/FuncionMatematica"
import { TeoremaFundamental } from "@/src/entidades/TeoremaFundamental"
import { CalculadoraTFC } from "@/src/servicios/CalculadoraTFC"

export default function EscenarioPuenteTeorema() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [funcion, setFuncion] = useState<FuncionMatematica | null>(null)
  const [teorema, setTeorema] = useState<TeoremaFundamental | null>(null)
  const [calculadora] = useState(() => new CalculadoraTFC())
  const [limiteA, setLimiteA] = useState(0)
  const [limiteB, setLimiteB] = useState(4)
  const [puntoX, setPuntoX] = useState(2)
  const [resultado, setResultado] = useState<any>(null)
  const [parte, setParte] = useState<"primera" | "segunda">("primera")

  // Funciones predefinidas
  const funcionesPredefinidas = [
    { nombre: "x²", expresion: "x^2", evaluar: (x: number) => x * x },
    { nombre: "sin(x)", expresion: "sin(x)", evaluar: (x: number) => Math.sin(x) },
    { nombre: "2x", expresion: "2x", evaluar: (x: number) => 2 * x },
    { nombre: "x³", expresion: "x^3", evaluar: (x: number) => x * x * x },
  ]

  useEffect(() => {
    // Inicializar con la primera función
    const f = new FuncionMatematica(funcionesPredefinidas[0].expresion, funcionesPredefinidas[0].evaluar)
    setFuncion(f)

    const t = new TeoremaFundamental(f, limiteA, limiteB)
    t.setParte(parte)
    setTeorema(t)
  }, [])

  useEffect(() => {
    if (funcion && teorema) {
      dibujarGrafica()
    }
  }, [funcion, teorema, limiteA, limiteB, puntoX, resultado, parte])

  const cambiarFuncion = (index: number) => {
    const f = new FuncionMatematica(funcionesPredefinidas[index].expresion, funcionesPredefinidas[index].evaluar)
    setFuncion(f)

    const t = new TeoremaFundamental(f, limiteA, limiteB)
    t.setParte(parte)
    setTeorema(t)
    setResultado(null)
  }

  const calcularPrimeraParte = () => {
    if (!teorema || !funcion) return

    // Encontrar antiderivada
    const antiderivada = calculadora.encontrarAntiderivada(funcion)
    if (!antiderivada) {
      alert("No se pudo encontrar la antiderivada para esta función")
      return
    }

    teorema.setAntiderivada(antiderivada)
    const res = calculadora.calcularPrimeraParte(teorema)
    setResultado(res)
  }

  const calcularSegundaParte = () => {
    if (!teorema) return

    const res = calculadora.calcularSegundaParte(teorema, puntoX)
    setResultado(res)
  }

  const dibujarGrafica = () => {
    const canvas = canvasRef.current
    if (!canvas || !funcion) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Limpiar canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Configurar sistema de coordenadas
    const padding = 40
    const graphWidth = width - 2 * padding
    const graphHeight = height - 2 * padding

    const xMin = -1
    const xMax = 5
    const yMin = -2
    const yMax = 10

    const scaleX = graphWidth / (xMax - xMin)
    const scaleY = graphHeight / (yMax - yMin)

    const toCanvasX = (x: number) => padding + (x - xMin) * scaleX
    const toCanvasY = (y: number) => height - padding - (y - yMin) * scaleY

    // Dibujar ejes
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Eje X
    ctx.beginPath()
    ctx.moveTo(toCanvasX(xMin), toCanvasY(0))
    ctx.lineTo(toCanvasX(xMax), toCanvasY(0))
    ctx.stroke()

    // Eje Y
    ctx.beginPath()
    ctx.moveTo(toCanvasX(0), toCanvasY(yMin))
    ctx.lineTo(toCanvasX(0), toCanvasY(yMax))
    ctx.stroke()

    // Dibujar área bajo la curva si es primera parte
    if (parte === "primera" && limiteA < limiteB) {
      ctx.fillStyle = "rgba(59, 130, 246, 0.2)"
      ctx.beginPath()
      ctx.moveTo(toCanvasX(limiteA), toCanvasY(0))

      for (let x = limiteA; x <= limiteB; x += 0.1) {
        const y = funcion.evaluar(x)
        ctx.lineTo(toCanvasX(x), toCanvasY(y))
      }

      ctx.lineTo(toCanvasX(limiteB), toCanvasY(0))
      ctx.closePath()
      ctx.fill()
    }

    // Dibujar área hasta x si es segunda parte
    if (parte === "segunda" && limiteA < puntoX) {
      ctx.fillStyle = "rgba(16, 185, 129, 0.2)"
      ctx.beginPath()
      ctx.moveTo(toCanvasX(limiteA), toCanvasY(0))

      for (let x = limiteA; x <= puntoX; x += 0.1) {
        const y = funcion.evaluar(x)
        ctx.lineTo(toCanvasX(x), toCanvasY(y))
      }

      ctx.lineTo(toCanvasX(puntoX), toCanvasY(0))
      ctx.closePath()
      ctx.fill()
    }

    // Dibujar función
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3
    ctx.beginPath()

    let firstPoint = true
    for (let x = xMin; x <= xMax; x += 0.05) {
      const y = funcion.evaluar(x)
      const canvasX = toCanvasX(x)
      const canvasY = toCanvasY(y)

      if (firstPoint) {
        ctx.moveTo(canvasX, canvasY)
        firstPoint = false
      } else {
        ctx.lineTo(canvasX, canvasY)
      }
    }
    ctx.stroke()

    // Dibujar límites
    if (parte === "primera") {
      // Líneas verticales en a y b
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      ctx.beginPath()
      ctx.moveTo(toCanvasX(limiteA), toCanvasY(yMin))
      ctx.lineTo(toCanvasX(limiteA), toCanvasY(yMax))
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(toCanvasX(limiteB), toCanvasY(yMin))
      ctx.lineTo(toCanvasX(limiteB), toCanvasY(yMax))
      ctx.stroke()

      ctx.setLineDash([])

      // Etiquetas
      ctx.fillStyle = "#ef4444"
      ctx.font = "bold 14px sans-serif"
      ctx.fillText("a", toCanvasX(limiteA) - 5, toCanvasY(yMin) + 20)
      ctx.fillText("b", toCanvasX(limiteB) - 5, toCanvasY(yMin) + 20)
    } else {
      // Línea vertical en x
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      ctx.beginPath()
      ctx.moveTo(toCanvasX(puntoX), toCanvasY(yMin))
      ctx.lineTo(toCanvasX(puntoX), toCanvasY(yMax))
      ctx.stroke()

      ctx.setLineDash([])

      // Etiqueta
      ctx.fillStyle = "#10b981"
      ctx.font = "bold 14px sans-serif"
      ctx.fillText("x", toCanvasX(puntoX) - 5, toCanvasY(yMin) + 20)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-width mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-blue-900 mt-2">Puente del Teorema Fundamental</h1>
            <p className="text-gray-600 mt-2">Conecta la derivación con la integración</p>
          </div>
        </div>

        <Tabs value={parte} onValueChange={(v) => setParte(v as "primera" | "segunda")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="primera">Primera Parte</TabsTrigger>
            <TabsTrigger value="segunda">Segunda Parte</TabsTrigger>
          </TabsList>

          <TabsContent value="primera" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Primera Parte del TFC</CardTitle>
                <CardDescription>Si F es una antiderivada de f, entonces: ∫[a,b] f(x)dx = F(b) - F(a)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selección de función */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Función f(x)</label>
                  <div className="flex gap-2">
                    {funcionesPredefinidas.map((f, index) => (
                      <Button
                        key={index}
                        variant={funcion?.expresion === f.expresion ? "default" : "outline"}
                        onClick={() => cambiarFuncion(index)}
                      >
                        {f.nombre}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Canvas */}
                <div className="border rounded-lg p-4 bg-white">
                  <canvas ref={canvasRef} width={800} height={400} className="w-full" />
                </div>

                {/* Controles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Límite inferior (a): {limiteA.toFixed(1)}</label>
                    <Slider value={[limiteA]} onValueChange={(v) => setLimiteA(v[0])} min={-1} max={4} step={0.1} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Límite superior (b): {limiteB.toFixed(1)}</label>
                    <Slider value={[limiteB]} onValueChange={(v) => setLimiteB(v[0])} min={-1} max={4} step={0.1} />
                  </div>
                </div>

                <Button onClick={calcularPrimeraParte} className="w-full" size="lg">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calcular TFC Primera Parte
                </Button>

                {/* Resultados */}
                {resultado && (
                  <Card className={resultado.esValido ? "border-green-500" : "border-red-500"}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {resultado.esValido ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        Resultados
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">F(a)</p>
                          <p className="text-lg font-bold">{resultado.Fa?.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">F(b)</p>
                          <p className="text-lg font-bold">{resultado.Fb?.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">F(b) - F(a)</p>
                          <p className="text-lg font-bold text-blue-600">{resultado.valorAntiderivada?.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">∫[a,b] f(x)dx</p>
                          <p className="text-lg font-bold text-purple-600">{resultado.valorIntegral?.toFixed(4)}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">Diferencia</p>
                        <p className="text-lg font-bold">{resultado.diferencia?.toFixed(6)}</p>
                        <Badge variant={resultado.esValido ? "default" : "destructive"} className="mt-2">
                          {resultado.esValido ? "Teorema Verificado ✓" : "Error en verificación"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segunda" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Segunda Parte del TFC</CardTitle>
                <CardDescription>
                  La derivada de una integral es la función original: d/dx[∫[a,x] f(t)dt] = f(x)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selección de función */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Función f(x)</label>
                  <div className="flex gap-2">
                    {funcionesPredefinidas.map((f, index) => (
                      <Button
                        key={index}
                        variant={funcion?.expresion === f.expresion ? "default" : "outline"}
                        onClick={() => cambiarFuncion(index)}
                      >
                        {f.nombre}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Canvas */}
                <div className="border rounded-lg p-4 bg-white">
                  <canvas ref={canvasRef} width={800} height={400} className="w-full" />
                </div>

                {/* Controles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Límite inferior (a): {limiteA.toFixed(1)}</label>
                    <Slider value={[limiteA]} onValueChange={(v) => setLimiteA(v[0])} min={-1} max={4} step={0.1} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Punto x: {puntoX.toFixed(1)}</label>
                    <Slider value={[puntoX]} onValueChange={(v) => setPuntoX(v[0])} min={-1} max={4} step={0.1} />
                  </div>
                </div>

                <Button onClick={calcularSegundaParte} className="w-full" size="lg">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Calcular TFC Segunda Parte
                </Button>

                {/* Resultados */}
                {resultado && (
                  <Card className={resultado.esValido ? "border-green-500" : "border-red-500"}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {resultado.esValido ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        Resultados
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">∫[a,x] f(t)dt</p>
                          <p className="text-lg font-bold">{resultado.integralHastaX?.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">d/dx[∫[a,x] f(t)dt]</p>
                          <p className="text-lg font-bold text-blue-600">{resultado.derivada?.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">f(x)</p>
                          <p className="text-lg font-bold text-purple-600">{resultado.valorFuncion?.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Diferencia</p>
                          <p className="text-lg font-bold">{resultado.diferencia?.toFixed(6)}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <Badge variant={resultado.esValido ? "default" : "destructive"}>
                          {resultado.esValido ? "Teorema Verificado ✓" : "Error en verificación"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
