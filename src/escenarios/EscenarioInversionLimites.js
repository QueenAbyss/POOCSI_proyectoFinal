/**
 * EscenarioInversionLimites - Escenario que maneja la visualización de inversión de límites
 * RESPONSABILIDAD ÚNICA: Solo coordinación del escenario de inversión de límites
 */
import { EstadoInversionLimites } from '../entidades/EstadoInversionLimites.js'
import { ConfiguracionInversionLimites } from '../entidades/ConfiguracionInversionLimites.js'
import { GestorVisualizacionInversionLimites } from '../servicios/GestorVisualizacionInversionLimites.js'
import { TransformadorCoordenadas } from '../servicios/TransformadorCoordenadas.js'

export class EscenarioInversionLimites {
    constructor() {
        this.nombre = "Propiedades Mágicas - Inversión de Límites"
        this.descripcion = "Visualización interactiva de la propiedad de inversión de límites de las integrales"
        
        // Inicializar componentes
        this.estado = new EstadoInversionLimites()
        this.configuracion = new ConfiguracionInversionLimites()
        this.gestorVisualizacion = new GestorVisualizacionInversionLimites(this.estado, this.configuracion)
        
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
            min: Math.min(limites.a, limites.b) - 1, 
            max: Math.max(limites.a, limites.b) + 1
        }
        const intervaloY = { min: -2, max: 5 }
        
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
    
    actualizarFuncion(funcion) {
        this.gestorVisualizacion.actualizarFuncion(funcion)
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
            funcionesDisponibles: this.gestorVisualizacion.obtenerFuncionesDisponibles(),
            explicacion: this.gestorVisualizacion.obtenerExplicacion(),
            casosEspeciales: this.gestorVisualizacion.obtenerCasosEspeciales(),
            colores: this.gestorVisualizacion.obtenerColores()
        }
    }
    
    // Obtener estado
    obtenerEstado() {
        return this.estado
    }
    
    // Obtener configuración
    obtenerConfiguracion() {
        return this.configuracion
    }
    
    // Reiniciar
    reiniciar() {
        this.estado.reiniciar()
        this.gestorVisualizacion.reiniciar()
    }
    
    // Verificar si está inicializado
    estaInicializado() {
        return this.gestorVisualizacion && this.transformador
    }
    
    // Obtener nombre
    obtenerNombre() {
        return this.nombre
    }
    
    // Obtener descripción
    obtenerDescripcion() {
        return this.descripcion
    }
}
