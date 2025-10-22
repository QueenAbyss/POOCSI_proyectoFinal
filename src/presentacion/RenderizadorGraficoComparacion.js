/**
 * PRESENTACIÓN: RenderizadorGraficoComparacion
 * RESPONSABILIDAD: Solo renderizar el gráfico de comparación
 * SRP: Solo renderizado gráfico, no cálculos ni estado
 */
import { RenderizadorEjes } from './RenderizadorEjes'

export class RenderizadorGraficoComparacion {
    constructor(configuracion) {
        this.configuracion = configuracion
        this.colores = configuracion.obtenerColores()
        this.grafico = configuracion.obtenerGrafico()
    }

    renderizar(ctx, estado, calculos, transformador) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        const limites = estado.obtenerLimites()
        const funciones = estado.obtenerFunciones()
        const puntoHover = estado.obtenerPuntoHover()
        const datosGrafico = estado.obtenerDatosGrafico()

        // Dibujar ejes
        const renderizadorEjes = new RenderizadorEjes(this.configuracion, transformador)
        renderizadorEjes.renderizar(ctx)

        // Dibujar áreas bajo las curvas
        this.dibujarAreas(ctx, datosGrafico, transformador)

        // Dibujar funciones
        this.dibujarFunciones(ctx, datosGrafico, transformador)

        // Dibujar punto hover si existe
        if (puntoHover) {
            this.dibujarPuntoHover(ctx, puntoHover, transformador)
        }

        // Dibujar leyenda
        this.dibujarLeyenda(ctx, limites, funciones)
    }

    // Dibujar áreas bajo las curvas
    dibujarAreas(ctx, datos, transformador) {
        if (!datos || datos.length === 0) return

        // Área bajo f(x)
        ctx.fillStyle = this.colores.areaF
        ctx.beginPath()
        let primerPuntoF = true
        for (const punto of datos) {
            const pos = transformador.matematicasACanvas(punto.x, punto.yF)
            if (primerPuntoF) {
                ctx.moveTo(pos.x, pos.y)
                primerPuntoF = false
            } else {
                ctx.lineTo(pos.x, pos.y)
            }
        }
        // Completar el área hasta el eje X
        const ultimoPunto = datos[datos.length - 1]
        const posUltimo = transformador.matematicasACanvas(ultimoPunto.x, 0)
        ctx.lineTo(posUltimo.x, posUltimo.y)
        const primerPunto = datos[0]
        const posPrimer = transformador.matematicasACanvas(primerPunto.x, 0)
        ctx.lineTo(posPrimer.x, posPrimer.y)
        ctx.closePath()
        ctx.fill()

        // Área bajo g(x)
        ctx.fillStyle = this.colores.areaG
        ctx.beginPath()
        let primerPuntoG = true
        for (const punto of datos) {
            const pos = transformador.matematicasACanvas(punto.x, punto.yG)
            if (primerPuntoG) {
                ctx.moveTo(pos.x, pos.y)
                primerPuntoG = false
            } else {
                ctx.lineTo(pos.x, pos.y)
            }
        }
        // Completar el área hasta el eje X
        ctx.lineTo(posUltimo.x, posUltimo.y)
        ctx.lineTo(posPrimer.x, posPrimer.y)
        ctx.closePath()
        ctx.fill()
    }

    // Dibujar las funciones
    dibujarFunciones(ctx, datos, transformador) {
        if (!datos || datos.length === 0) return

        // Función f(x)
        ctx.strokeStyle = this.colores.funcionF
        ctx.lineWidth = this.grafico.grosorLinea
        ctx.beginPath()
        let primerPuntoF = true
        for (const punto of datos) {
            const pos = transformador.matematicasACanvas(punto.x, punto.yF)
            if (primerPuntoF) {
                ctx.moveTo(pos.x, pos.y)
                primerPuntoF = false
            } else {
                ctx.lineTo(pos.x, pos.y)
            }
        }
        ctx.stroke()

        // Función g(x)
        ctx.strokeStyle = this.colores.funcionG
        ctx.lineWidth = this.grafico.grosorLinea
        ctx.beginPath()
        let primerPuntoG = true
        for (const punto of datos) {
            const pos = transformador.matematicasACanvas(punto.x, punto.yG)
            if (primerPuntoG) {
                ctx.moveTo(pos.x, pos.y)
                primerPuntoG = false
            } else {
                ctx.lineTo(pos.x, pos.y)
            }
        }
        ctx.stroke()
    }

    // Dibujar punto hover
    dibujarPuntoHover(ctx, punto, transformador) {
        const pos = transformador.matematicasACanvas(punto.x, punto.yF)
        const posG = transformador.matematicasACanvas(punto.x, punto.yG)

        // Línea vertical
        ctx.strokeStyle = this.colores.hover
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(pos.x, 0)
        ctx.lineTo(pos.x, ctx.canvas.height)
        ctx.stroke()
        ctx.setLineDash([])

        // Puntos en las funciones
        ctx.fillStyle = this.colores.funcionF
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, this.grafico.radioPunto, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = this.colores.funcionG
        ctx.beginPath()
        ctx.arc(posG.x, posG.y, this.grafico.radioPunto, 0, 2 * Math.PI)
        ctx.fill()
    }

    // Dibujar leyenda
    dibujarLeyenda(ctx, limites, funciones) {
        const area = this.configuracion.obtenerAreaDibujo()
        const x = area.x + area.ancho - 150
        const y = area.y + 20

        const items = [
            { color: this.colores.funcionF, texto: `f(x) = ${funciones.f}` },
            { color: this.colores.funcionG, texto: `g(x) = ${funciones.g}` }
        ]

        ctx.save()
        ctx.font = '12px Arial'
        ctx.fillStyle = this.colores.texto

        items.forEach((item, index) => {
            const itemY = y + index * 20
            ctx.fillStyle = item.color
            ctx.fillRect(x, itemY - 8, 10, 10)
            ctx.fillStyle = this.colores.texto
            ctx.fillText(item.texto, x + 15, itemY)
        })
        ctx.restore()
    }
}
