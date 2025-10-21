"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Target, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { FuncionMatematica } from "@/src/entidades/FuncionMatematica"
import { TeoremaValorMedio } from "@/src/entidades/TeoremaValorMedio"
import { CalculadoraTVM } from "@/src/servicios/CalculadoraTVM"

export default function EscenarioTorreValorMedio() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [funcion, setFuncion] = useState<FuncionMatematica | null>(null)
  const [teorema, setTeorema] = useState<TeoremaValorMedio | null>(null)
  const [calculadora] = useState(() => new CalculadoraTVM())
  const [limiteA, setLimiteA] = useState(0)
  const [limiteB, setLimiteB] = useState(4)
  const [resultado, setResultado] = useState<any>(null)

  // Funciones predefinidas
  const funcionesPredefinidas = [
    { nombre: "x²", expresion: "x^2", evaluar: (x: number) => x * x },
    { nombre: "sin(x)", expresion: "sin(x)", evaluar: (x: number) => Math.sin(x) },
    { nombre: "x³ - 3x", expresion: "x^3 - 3x", evaluar: (x: number) => x * x * x - 3 * x },
    { nombre: "e^(-x²/4)", expresion: "e^(-x^2/4)", evaluar: (x: number) => Math.exp((-x * x) / 4) },
  ]

  useEffect(() => {
    // Inicializar con la primera función
    const f = new FuncionMatematica(funcionesPredefinidas[0].expresion, funcionesPredefinidas[0].evaluar)
    setFuncion(f)

    const t = new TeoremaValorMedio(f, limiteA, limiteB)
    setTeorema(t)
  }, [])

  useEffect(() => {
    if (funcion && teorema) {
      dibujarGrafica()
    }
  }, [funcion, teorema, limiteA, limiteB, resultado])

  const cambiarFuncion = (index: number) => {
    const f = new FuncionMatematica(funcionesPredefinidas[index].expresion, funcionesPredefinidas[index].evaluar)
    setFuncion(f)

    const t = new TeoremaValorMedio(f, limiteA, limiteB)
    setTeorema(t)
    setResultado(null)
  }

  const verificarTeorema = () => {
    if (!teorema) return

    const res = calculadora.verificarTeorema(teorema)
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
    const yMin = -5
    const yMax = 15

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

    // Dibujar área bajo la curva
    if (limiteA < limiteB) {
      ctx.fillStyle = "rgba(139, 92, 246, 0.2)"
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

    // Dibujar función
    ctx.strokeStyle = "#8b5cf6"
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

    // Etiquetas de límites
    ctx.fillStyle = "#ef4444"
    ctx.font = "bold 14px sans-serif"
    ctx.fillText("a", toCanvasX(limiteA) - 5, toCanvasY(yMin) + 20)
    ctx.fillText("b", toCanvasX(limiteB) - 5, toCanvasY(yMin) + 20)

    // Dibujar línea del valor promedio y punto c si hay resultado
    if (resultado) {
      // Línea horizontal del valor promedio
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.setLineDash([10, 5])

      ctx.beginPath()
      ctx.moveTo(toCanvasX(limiteA), toCanvasY(resultado.valorPromedio))
      ctx.lineTo(toCanvasX(limiteB), toCanvasY(resultado.valorPromedio))
      ctx.stroke()

      ctx.setLineDash([])

      // Etiqueta del valor promedio
      ctx.fillStyle = "#10b981"
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(
        `f_avg = ${resultado.valorPromedio.toFixed(3)}`,
        toCanvasX(limiteB) + 10,
        toCanvasY(resultado.valorPromedio),
      )

      // Punto c
      if (resultado.puntoC) {
        ctx.fillStyle = "#f59e0b"
        ctx.beginPath()
        ctx.arc(toCanvasX(resultado.puntoC), toCanvasY(resultado.valorEnC), 8, 0, 2 * Math.PI)
        ctx.fill()

        // Línea vertical en c
        ctx.strokeStyle = "#f59e0b"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])

        ctx.beginPath()
        ctx.moveTo(toCanvasX(resultado.puntoC), toCanvasY(yMin))
        ctx.lineTo(toCanvasX(resultado.puntoC), toCanvasY(yMax))
        ctx.stroke()

        ctx.setLineDash([])

        // Etiqueta de c
        ctx.fillStyle = "#f59e0b"
        ctx.font = "bold 14px sans-serif"
        ctx.fillText(`c = ${resultado.puntoC.toFixed(3)}`, toCanvasX(resultado.puntoC) - 20, toCanvasY(yMin) + 20)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
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
            <h1 className="text-4xl font-bold text-purple-900 mt-2">Torre del Valor Medio</h1>
            <p className="text-gray-600 mt-2">Encuentra el punto donde f(c) = valor promedio</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Teorema del Valor Medio para Integrales</CardTitle>
            <CardDescription>
              Si f es continua en [a,b], existe c ∈ [a,b] tal que: f(c) = (1/(b-a)) ∫[a,b] f(x)dx
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selección de función */}
            <div>
              <label className="text-sm font-medium mb-2 block">Función f(x)</label>
              <div className="flex gap-2 flex-wrap">
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

            <Button onClick={verificarTeorema} className="w-full" size="lg">
              <Target className="mr-2 h-5 w-5" />
              Buscar Punto c
            </Button>

            {/* Resultados */}
            {resultado && (
              <Card className={resultado.esValido ? "border-green-500" : "border-amber-500"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {resultado.esValido ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-amber-500" />
                    )}
                    Resultados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Integral ∫[a,b] f(x)dx</p>
                      <p className="text-lg font-bold">{resultado.integral?.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor Promedio f_avg</p>
                      <p className="text-lg font-bold text-green-600">{resultado.valorPromedio?.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Punto c</p>
                      <p className="text-lg font-bold text-amber-600">{resultado.puntoC?.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">f(c)</p>
                      <p className="text-lg font-bold text-purple-600">{resultado.valorEnC?.toFixed(4)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Diferencia |f(c) - f_avg|</span>
                      <span className="font-bold">{resultado.diferencia?.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Intentos de búsqueda</span>
                      <span className="font-bold">{resultado.intentos}</span>
                    </div>
                    <Badge variant={resultado.esValido ? "default" : "secondary"} className="mt-2">
                      {resultado.esValido ? "Teorema Verificado ✓" : "Aproximación encontrada"}
                    </Badge>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 mb-2">Interpretación:</p>
                    <p className="text-sm text-purple-800">
                      El punto c = {resultado.puntoC?.toFixed(3)} es donde la función alcanza su valor promedio. En este
                      punto, f(c) = {resultado.valorEnC?.toFixed(3)} ≈ {resultado.valorPromedio?.toFixed(3)} (valor
                      promedio).
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
