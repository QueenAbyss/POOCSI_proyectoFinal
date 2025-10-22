/**
 * ESCENARIO: EscenarioPTFC
 * RESPONSABILIDAD: Solo coordinación general del Primer Teorema Fundamental del Cálculo
 * SRP: Solo coordinación, no implementación de lógica ni presentación
 */
import { EstadoPTFC } from '../entidades/EstadoPTFC.js'
import { ConfiguracionPTFC } from '../entidades/ConfiguracionPTFC.js'
import { CalculadoraPTFC } from '../servicios/CalculadoraPTFC.js'
import { VerificadorPTFC } from '../servicios/VerificadorPTFC.js'
import { GestorVisualizacionPTFC } from '../servicios/GestorVisualizacionPTFC.js'
import { RenderizadorPuenteMagico } from '../presentacion/RenderizadorPuenteMagico.js'
import { RenderizadorCartesianoPTFC } from '../presentacion/RenderizadorCartesianoPTFC.js'
import { GestorLogros } from '../servicios/GestorLogros.js'
import { GestorTiempoPTFC } from '../servicios/GestorTiempoPTFC.js'
import { TransformadorCoordenadas } from '../servicios/TransformadorCoordenadas.js'

export class EscenarioPTFC {
    constructor() {
        // ✅ INSTANCIACIÓN DE ENTIDADES
        this.estado = new EstadoPTFC()
        this.configuracion = new ConfiguracionPTFC()
        
        // ✅ INSTANCIACIÓN DE SERVICIOS
        this.calculadora = new CalculadoraPTFC()
        this.verificador = new VerificadorPTFC()
        this.gestorLogros = new GestorLogros()
        this.gestorTiempo = new GestorTiempoPTFC()
        this.gestorVisualizacion = new GestorVisualizacionPTFC()
        
        // ✅ INSTANCIACIÓN DE RENDERIZADORES
        this.renderizadorPuente = new RenderizadorPuenteMagico(this.configuracion)
        this.renderizadorCartesiano = new RenderizadorCartesianoPTFC(this.configuracion)
        
        // ✅ TRANSFORMADOR DE COORDENADAS
        this.transformador = null
        
        // ✅ REFERENCIAS DE CANVAS
        this.canvasPuente = null
        this.canvasCartesiano = null
        this.containerTooltip = null
        
        // ✅ CALLBACKS
        this.onEstadoCambiado = () => {}
        this.onLogroDesbloqueado = () => {}
        this.onError = () => {}
        
        // ✅ INICIALIZAR GESTOR DE VISUALIZACIÓN
        this.inicializarGestorVisualizacion()
        
        // ✅ INICIALIZAR GESTOR DE TIEMPO
        this.gestorTiempo.iniciarSesion()
    }
    
    // ✅ INICIALIZAR GESTOR DE VISUALIZACIÓN
    inicializarGestorVisualizacion() {
        this.gestorVisualizacion.inicializar(
            this.estado,
            this.configuracion,
            this.calculadora,
            this.verificador,
            this.renderizadorPuente,
            this.renderizadorCartesiano,
            this.gestorLogros
        )
        
        // Configurar callbacks
        this.gestorVisualizacion.configurarCallbacks({
            onEstadoCambiado: () => this.onEstadoCambiado(),
            onLogroDesbloqueado: (logro) => this.onLogroDesbloqueado(logro)
        })
    }
    
    // ✅ CONFIGURAR CANVAS
    configurarCanvas(canvasPuente, canvasCartesiano, containerTooltip = null) {
        this.canvasPuente = canvasPuente
        this.canvasCartesiano = canvasCartesiano
        this.containerTooltip = containerTooltip
        
        // Crear transformador de coordenadas
        const limites = this.estado.obtenerLimites()
        const configuracion = this.configuracion.obtenerConfiguracionVisualizacion()
        
        const intervaloX = { min: limites.a, max: limites.b }
        const intervaloY = { min: 0, max: 10 } // Ajustar según la función
        
        // ✅ ÁREA DE DIBUJO PARA CANVAS
        const area = {
            x: configuracion.cartesiana.margen,
            y: configuracion.cartesiana.margen,
            ancho: configuracion.cartesiana.ancho - 2 * configuracion.cartesiana.margen,
            alto: configuracion.cartesiana.alto - 2 * configuracion.cartesiana.margen
        }
        
        this.transformador = new TransformadorCoordenadas(
            this.configuracion,
            intervaloX,
            intervaloY,
            area
        )
        
        // Configurar referencias en el gestor
        this.gestorVisualizacion.configurarReferencias(
            canvasPuente,
            canvasCartesiano,
            this.transformador,
            containerTooltip
        )
    }
    
    // ✅ ACTUALIZAR FUNCIÓN
    actualizarFuncion(nombreFuncion) {
        try {
            this.gestorVisualizacion.actualizarFuncion(nombreFuncion)
            
            // Actualizar transformador si es necesario
            if (this.transformador) {
                const limites = this.estado.obtenerLimites()
                const intervaloX = { min: limites.a, max: limites.b }
                this.transformador.actualizarIntervaloX(intervaloX)
            }
        } catch (error) {
            console.error('Error actualizando función:', error)
            this.onError(error)
        }
    }
    
    // ✅ ACTUALIZAR LÍMITES
    actualizarLimites(a, b) {
        try {
            this.gestorVisualizacion.actualizarLimites(a, b)
            
            // Actualizar transformador
            if (this.transformador) {
                const intervaloX = { min: a, max: b }
                this.transformador.actualizarIntervaloX(intervaloX)
            }
        } catch (error) {
            console.error('Error actualizando límites:', error)
            this.onError(error)
        }
    }
    
    // ✅ ACTUALIZAR POSICIÓN X
    actualizarPosicionX(x) {
        try {
            this.gestorVisualizacion.actualizarPosicionX(x)
            this.verificarLogros()
        } catch (error) {
            console.error('Error actualizando posición X:', error)
            this.onError(error)
        }
    }
    
    // ✅ ACTUALIZAR ANIMACIÓN
    actualizarAnimacion(activa, velocidad = 1) {
        try {
            this.gestorVisualizacion.actualizarAnimacion(activa, velocidad)
        } catch (error) {
            console.error('Error actualizando animación:', error)
            this.onError(error)
        }
    }
    
    // ✅ MANEJAR HOVER
    manejarHover(evento, canvas, tipo = 'cartesiano') {
        try {
            if (tipo === 'cartesiano') {
                this.renderizadorCartesiano.manejarHover(evento, canvas, this.transformador, this.estado.obtenerFuncionActual())
            } else {
                this.gestorVisualizacion.manejarHover(evento, canvas, this.transformador)
            }
        } catch (error) {
            console.error('Error manejando hover:', error)
            this.onError(error)
        }
    }
    
    // ✅ DESACTIVAR HOVER
    desactivarHover() {
        try {
            this.renderizadorCartesiano.desactivarHover()
        } catch (error) {
            console.error('Error desactivando hover:', error)
            this.onError(error)
        }
    }
    
    // ✅ RENDERIZAR
    async renderizar() {
        try {
            await this.gestorVisualizacion.renderizar()
        } catch (error) {
            console.error('Error renderizando:', error)
            this.onError(error)
        }
    }
    
    // ✅ RENDERIZAR CÁLCULOS
    renderizarCalculos(container) {
        try {
            const calculos = this.estado.obtenerCalculos()
            const logros = this.estado.obtenerLogrosDesbloqueados()
            const tiempo = this.estado.obtenerTiempoSesion()
            
            if (container) {
                container.innerHTML = this.generarHTMLCalculos(calculos, logros, tiempo)
            }
        } catch (error) {
            console.error('Error renderizando cálculos:', error)
            this.onError(error)
        }
    }
    
    // ✅ GENERAR HTML DE CÁLCULOS
    generarHTMLCalculos(calculos, logros, tiempo) {
        return `
            <div class="calculos-ptfc">
                <h3>Resultados del Teorema</h3>
                <div class="valores">
                    <div class="valor">
                        <label>f(x):</label>
                        <span>${calculos.valorFuncion.toFixed(4)}</span>
                    </div>
                    <div class="valor">
                        <label>F(x):</label>
                        <span>${calculos.integralAcumulada.toFixed(4)}</span>
                    </div>
                    <div class="valor">
                        <label>F'(x):</label>
                        <span>${calculos.derivadaIntegral.toFixed(4)}</span>
                    </div>
                    <div class="valor">
                        <label>Diferencia:</label>
                        <span>${calculos.diferenciaVerificacion.toFixed(6)}</span>
                    </div>
                </div>
                <div class="verificacion ${calculos.verificacionExitosa ? 'exitoso' : 'error'}">
                    ${calculos.verificacionExitosa ? '✅ Teorema Verificado' : '❌ Teorema No Verificado'}
                </div>
                <div class="logros">
                    <h4>Logros Desbloqueados (${logros.length})</h4>
                    ${logros.map(logro => `<div class="logro">${logro.icono} ${logro.nombre}</div>`).join('')}
                </div>
                <div class="tiempo">
                    <span>Tiempo de sesión: ${this.formatearTiempo(tiempo)}</span>
                </div>
            </div>
        `
    }
    
    // ✅ FORMATEAR TIEMPO
    formatearTiempo(milisegundos) {
        const segundos = Math.floor(milisegundos / 1000)
        const minutos = Math.floor(segundos / 60)
        const segundosRestantes = segundos % 60
        
        if (minutos > 0) {
            return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`
        }
        return `${segundosRestantes}s`
    }
    
    // ✅ OBTENER ESTADO
    obtenerEstado() {
        return this.estado
    }
    
    // ✅ OBTENER CONFIGURACIÓN
    obtenerConfiguracion() {
        return this.configuracion
    }
    
    // ✅ OBTENER CÁLCULOS
    obtenerCalculos() {
        return this.estado.obtenerCalculos()
    }
    
    // ✅ OBTENER LOGROS
    obtenerLogros() {
        return this.gestorLogros.obtenerLogrosDesbloqueadosPorEscenario('ptfc')
    }
    
    // ✅ OBTENER TIEMPO
    obtenerTiempo() {
        return {
            sesion: this.estado.obtenerTiempoSesion(),
            exploracion: this.estado.obtenerTiempoExploracion()
        }
    }
    
    // ✅ OBTENER FUNCIONES DISPONIBLES
    obtenerFuncionesDisponibles() {
        return this.calculadora.obtenerFuncionesDisponibles()
    }
    
    // ✅ OBTENER CONFIGURACIÓN DE LOGROS
    obtenerConfiguracionLogros() {
        return this.configuracion.obtenerConfiguracionLogros()
    }
    
    // ✅ REINICIAR
    reiniciar() {
        try {
            this.estado.reiniciar()
            this.gestorVisualizacion.reiniciar()
        } catch (error) {
            console.error('Error reiniciando:', error)
            this.onError(error)
        }
    }
    
    // ✅ LIMPIAR
    limpiar() {
        try {
            if (this.canvasPuente) {
                const ctx = this.canvasPuente.getContext('2d')
                ctx.clearRect(0, 0, this.canvasPuente.width, this.canvasPuente.height)
            }
            
            if (this.canvasCartesiano) {
                const ctx = this.canvasCartesiano.getContext('2d')
                ctx.clearRect(0, 0, this.canvasCartesiano.width, this.canvasCartesiano.height)
            }
        } catch (error) {
            console.error('Error limpiando:', error)
            this.onError(error)
        }
    }
    
    // ✅ CONFIGURAR CALLBACKS
    configurarCallbacks(callbacks) {
        if (callbacks.onEstadoCambiado) {
            this.onEstadoCambiado = callbacks.onEstadoCambiado
        }
        if (callbacks.onLogroDesbloqueado) {
            this.onLogroDesbloqueado = callbacks.onLogroDesbloqueado
        }
        if (callbacks.onError) {
            this.onError = callbacks.onError
        }
    }
    
    // ✅ VERIFICAR LOGROS
    verificarLogros() {
        try {
            const calculos = this.estado.obtenerCalculos()
            const limites = this.estado.obtenerLimites()
            const posicionX = this.estado.obtenerPosicionX()
            const tiempo = this.gestorTiempo.obtenerTiempoSesion()
            
            const datos = {
                posicionX,
                limiteA: limites.a,
                limiteB: limites.b,
                verificacionTeorema: calculos.verificacionExitosa,
                diferenciaVerificacion: calculos.diferenciaVerificacion,
                integralAcumulada: calculos.integralAcumulada,
                funcionesExploradas: 1, // TODO: Implementar contador
                verificacionesExitosas: calculos.verificacionExitosa ? 1 : 0,
                tiempoExploracion: tiempo
            }
            
            const logrosDesbloqueados = this.gestorLogros.verificarLogros(datos)
            
            if (logrosDesbloqueados.length > 0) {
                logrosDesbloqueados.forEach(logro => {
                    this.estado.agregarLogroDesbloqueado(logro)
                    this.gestorTiempo.registrarLogro(logro)
                    this.onLogroDesbloqueado(logro)
                })
            }
        } catch (error) {
            console.error('Error verificando logros:', error)
            this.onError(error)
        }
    }
    
    // ✅ OBTENER INFORMACIÓN COMPLETA
    obtenerInformacionCompleta() {
        return {
            estado: this.estado,
            configuracion: this.configuracion,
            calculos: this.obtenerCalculos(),
            logros: this.obtenerLogros(),
            tiempo: this.obtenerTiempo(),
            funciones: this.obtenerFuncionesDisponibles()
        }
    }
}
