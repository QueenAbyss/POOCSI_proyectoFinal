/**
 * EscenarioPropiedadesAditividad - Escenario que maneja la visualización de aditividad
 * RESPONSABILIDAD ÚNICA: Solo coordinación del escenario de aditividad
 */
import { EstadoAditividad } from '../entidades/EstadoAditividad.js'
import { ConfiguracionAditividad } from '../entidades/ConfiguracionAditividad.js'
import { GestorVisualizacionAditividad } from '../servicios/GestorVisualizacionAditividad.js'
import { TransformadorCoordenadas } from '../servicios/TransformadorCoordenadas.js'

export class EscenarioPropiedadesAditividad {
    constructor() {
        this.estado = new EstadoAditividad()
        this.configuracion = new ConfiguracionAditividad()
        this.gestorVisualizacion = new GestorVisualizacionAditividad(this.estado, this.configuracion)
        this.transformador = null
        this.canvas = null
        this.containerTooltip = null
    }
    
    // Configurar canvas
    configurarCanvas(canvas, containerTooltip = null) {
        this.canvas = canvas
        this.containerTooltip = containerTooltip
        
        // ✅ CREAR TRANSFORMADOR CON INTERVALOS CORRECTOS
        const limites = this.estado.obtenerLimites()
        const intervaloX = { min: limites.a, max: limites.c }
        const intervaloY = { min: -1, max: 10 }
        
        console.log('EscenarioPropiedadesAditividad - Configurando transformador:')
        console.log('Límites:', limites)
        console.log('Intervalo X:', intervaloX)
        console.log('Intervalo Y:', intervaloY)
        
        this.transformador = new TransformadorCoordenadas(
            this.configuracion,
            intervaloX,
            intervaloY
        )
        
        console.log('Transformador creado:', this.transformador)
        console.log('Escalas del transformador:', this.transformador.escalas)
        
        // Configurar eventos del canvas
        this.configurarEventos()
        
        // ✅ CONFIGURAR REFERENCIAS EN EL GESTOR PARA RENDERIZADO AUTOMÁTICO
        this.gestorVisualizacion.configurarReferencias(canvas, this.transformador, containerTooltip)
        
        // ✅ NO RENDERIZAR INMEDIATAMENTE - Los datos se generarán con debouncing
        console.log('EscenarioPropiedadesAditividad - Canvas configurado, esperando datos...')
    }
    
    // Configurar eventos del canvas
    configurarEventos() {
        if (!this.canvas) return
        
        // Evento de hover
        this.canvas.addEventListener('mousemove', (evento) => {
            if (this.transformador) {
                const puntoHover = this.gestorVisualizacion.manejarHover(evento, this.canvas, this.transformador)
                this.renderizar()
            }
        })
        
        // Evento de salida del mouse
        this.canvas.addEventListener('mouseleave', () => {
            this.estado.establecerPuntoHover(null)
            this.renderizar()
        })
    }
    
    // Renderizar el escenario
    renderizar() {
        if (!this.canvas || !this.transformador) return
        
        console.log('EscenarioPropiedadesAditividad - Renderizando...')
        this.gestorVisualizacion.renderizar(this.canvas, this.transformador, this.containerTooltip)
    }
    
    // Actualizar función
    actualizarFuncion(funcion) {
        this.gestorVisualizacion.actualizarFuncion(funcion)
        this.renderizar()
    }
    
    // Actualizar límites
    actualizarLimites(a, b, c) {
        this.gestorVisualizacion.actualizarLimites(a, b, c)
        // ✅ NO RENDERIZAR INMEDIATAMENTE - El GestorVisualizacionAditividad se encargará del renderizado automático
        console.log('EscenarioPropiedadesAditividad - Límites actualizados, esperando recálculo...')
    }
    
    // Renderizar cálculos
    renderizarCalculos(container) {
        this.gestorVisualizacion.renderizarCalculos(container)
    }
    
    // Manejar hover del mouse (para React)
    manejarHover(evento, canvas, transformador) {
        if (this.gestorVisualizacion && this.transformador) {
            const puntoHover = this.gestorVisualizacion.manejarHover(evento, canvas, this.transformador)
            // ✅ NO RENDERIZAR INMEDIATAMENTE - Solo actualizar el estado del hover
            // El renderizado se manejará automáticamente por el GestorVisualizacionAditividad
            return puntoHover
        }
        return null
    }
    
    // Limpiar hover (para React)
    limpiarHover() {
        this.estado.establecerPuntoHover(null)
        // ✅ NO RENDERIZAR INMEDIATAMENTE - Solo limpiar el estado del hover
        // El renderizado se manejará automáticamente por el GestorVisualizacionAditividad
    }
    
    // Establecer estado (para React)
    setEstado(estado) {
        this.estado = estado
        this.gestorVisualizacion.estado = estado
    }
    
    // Establecer configuración (para React)
    setConfiguracion(configuracion) {
        this.configuracion = configuracion
        this.gestorVisualizacion.configuracion = configuracion
    }
    
    // Actualizar estado interno (para React)
    actualizarEstadoInterno(estado, configuracion) {
        this.setEstado(estado)
        this.setConfiguracion(configuracion)
    }
    
    // Obtener estado actual
    obtenerEstado() {
        return this.estado
    }
    
    // Obtener configuración
    obtenerConfiguracion() {
        return this.configuracion
    }
    
    // Obtener gestor de visualización
    obtenerGestorVisualizacion() {
        return this.gestorVisualizacion
    }
    
    // Obtener transformador
    obtenerTransformador() {
        return this.transformador
    }
    
    // Limpiar recursos
    limpiar() {
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.manejarHover)
            this.canvas.removeEventListener('mouseleave', this.manejarMouseLeave)
        }
        this.canvas = null
        this.transformador = null
        this.containerTooltip = null
    }
}
