/**
 * ESCENARIO: EscenarioComparacion
 * RESPONSABILIDAD: Coordinar la propiedad de comparación
 * SRP: Solo coordinación, no cálculos ni renderizado
 */
import { EstadoComparacion } from '../entidades/EstadoComparacion'
import { ConfiguracionComparacion } from '../entidades/ConfiguracionComparacion'
import { GestorVisualizacionComparacion } from '../servicios/GestorVisualizacionComparacion'
import { TransformadorCoordenadas } from '../servicios/TransformadorCoordenadas'

export class EscenarioComparacion {
    constructor() {
        // Inicializar componentes
        this.estado = new EstadoComparacion()
        this.configuracion = new ConfiguracionComparacion()
        this.gestorVisualizacion = new GestorVisualizacionComparacion(this.estado, this.configuracion)

        // Referencias
        this.transformador = null
        this.canvas = null
        this.containerCalculos = null
    }

    // Configurar canvas
    configurarCanvas(canvas, containerCalculos = null) {
        if (!canvas) {
            throw new Error("Canvas es requerido")
        }

        this.canvas = canvas
        this.containerCalculos = containerCalculos

        // Crear transformador de coordenadas
        const limites = this.estado.obtenerLimites()
        const intervaloX = {
            min: Math.min(limites.a, limites.b) - 0.5,
            max: Math.max(limites.a, limites.b) + 0.5
        }
        const intervaloY = { min: -0.5, max: 2 }

        this.transformador = new TransformadorCoordenadas(
            this.configuracion,
            intervaloX,
            intervaloY
        )

        // Configurar referencias en el gestor
        this.gestorVisualizacion.configurarReferencias(
            canvas,
            this.transformador,
            containerCalculos
        )

        // Renderizar inicial
        this.renderizar()
    }

    // Renderizar
    renderizar() {
        if (!this.gestorVisualizacion) return

        this.gestorVisualizacion.renderizar()
    }

    // Métodos de control
    actualizarLimites(a, b) {
        this.gestorVisualizacion.actualizarLimites(a, b)
    }

    actualizarFunciones(funcionF, funcionG) {
        this.gestorVisualizacion.actualizarFunciones(funcionF, funcionG)
    }

    // Manejar hover
    manejarHover(evento, canvas, transformador) {
        if (this.gestorVisualizacion && this.gestorVisualizacion.manejarHover) {
            this.gestorVisualizacion.manejarHover(evento, canvas, transformador)
        }
    }

    // Limpiar hover
    limpiarHover() {
        if (this.gestorVisualizacion && this.gestorVisualizacion.limpiarHover) {
            this.gestorVisualizacion.limpiarHover()
        }
    }

    // Obtener datos
    obtenerDatos() {
        return {
            estado: this.estado,
            configuracion: this.configuracion,
            calculadora: this.gestorVisualizacion.calculadora,
            verificador: this.gestorVisualizacion.verificador,
            renderizadorGrafico: this.gestorVisualizacion.renderizadorGrafico,
            renderizadorCalculos: this.gestorVisualizacion.renderizadorCalculos,
            gestorVisualizacion: this.gestorVisualizacion,
            transformador: this.transformador
        }
    }
}
