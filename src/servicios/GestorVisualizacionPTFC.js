/**
 * SERVICIO: GestorVisualizacionPTFC
 * RESPONSABILIDAD: Solo coordinación de visualización del Primer Teorema Fundamental del Cálculo
 * SRP: Solo coordinación, no implementación de lógica ni presentación
 */
export class GestorVisualizacionPTFC {
    constructor() {
        this.estado = null
        this.configuracion = null
        this.calculadora = null
        this.verificador = null
        this.renderizadorPuente = null
        this.renderizadorCartesiano = null
        this.gestorLogros = null
        
        // ✅ CONTROL DE RENDERIZADO
        this.isRendering = false
        this.renderQueue = false
        this.lastRenderTime = 0
        this.targetFPS = 30
        this.frameDelay = 1000 / this.targetFPS
        
        // ✅ DEBOUNCING
        this.debounceTimeout = null
        this.debounceDelay = 100
        
        // ✅ REFERENCIAS
        this.canvasPuente = null
        this.canvasCartesiano = null
        this.transformador = null
        this.containerTooltip = null
        
        // ✅ CALLBACKS
        this.onEstadoCambiado = () => {}
        this.onLogroDesbloqueado = () => {}
    }
    
    // ✅ INICIALIZAR GESTOR
    inicializar(estado, configuracion, calculadora, verificador, renderizadorPuente, renderizadorCartesiano, gestorLogros) {
        this.estado = estado
        this.configuracion = configuracion
        this.calculadora = calculadora
        this.verificador = verificador
        this.renderizadorPuente = renderizadorPuente
        this.renderizadorCartesiano = renderizadorCartesiano
        this.gestorLogros = gestorLogros
    }
    
    // ✅ CONFIGURAR REFERENCIAS
    configurarReferencias(canvasPuente, canvasCartesiano, transformador, containerTooltip = null) {
        this.canvasPuente = canvasPuente
        this.canvasCartesiano = canvasCartesiano
        this.transformador = transformador
        this.containerTooltip = containerTooltip
    }
    
    // ✅ ACTUALIZAR FUNCIÓN
    actualizarFuncion(nombreFuncion) {
        if (!this.estado) return
        
        this.estado.establecerFuncionSeleccionada(nombreFuncion)
        const funciones = this.calculadora.obtenerFuncionesDisponibles()
        const funcion = funciones[nombreFuncion]
        
        if (funcion) {
            this.estado.establecerFuncionActual(funcion)
            this.estado.establecerLimites(funcion.dominio.inicio, funcion.dominio.fin)
            this.estado.establecerPosicionX(funcion.dominio.inicio)
        }
        
        this.recalcularYRenderizar()
    }
    
    // ✅ ACTUALIZAR LÍMITES
    actualizarLimites(a, b) {
        if (!this.estado) return
        
        this.estado.establecerLimites(a, b)
        
        if (this.estado.validarLimites()) {
            this.recalcularYRenderizar()
        }
    }
    
    // ✅ ACTUALIZAR POSICIÓN X
    actualizarPosicionX(x) {
        if (!this.estado) return
        
        this.estado.establecerPosicionX(x)
        // ✅ RENDERIZADO INMEDIATO PARA POSICIÓN X
        this.renderizarInmediato()
    }
    
    // ✅ ACTUALIZAR ANIMACIÓN
    actualizarAnimacion(activa, velocidad = 1) {
        if (!this.estado) return
        
        this.estado.establecerEstadoAnimacion({
            activa,
            velocidad,
            posicion: this.estado.obtenerEstadoAnimacion().posicion
        })
        
        if (activa) {
            this.iniciarAnimacion()
        } else {
            this.detenerAnimacion()
        }
    }
    
    // ✅ RECALCULAR Y RENDERIZAR
    async recalcularYRenderizar() {
        if (this.isRendering) {
            this.renderQueue = true
            return
        }
        
        // ✅ DEBOUNCING
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout)
        }
        
        this.debounceTimeout = setTimeout(async () => {
            this.isRendering = true
            
            try {
                await this.ejecutarCalculos()
                await this.renderizar()
                this.verificarLogros()
                this.onEstadoCambiado()
            } catch (error) {
                console.error('Error en recalcularYRenderizar:', error)
            } finally {
                this.isRendering = false
                
                if (this.renderQueue) {
                    this.renderQueue = false
                    this.recalcularYRenderizar()
                }
            }
        }, this.debounceDelay)
    }
    
    // ✅ EJECUTAR CÁLCULOS
    async ejecutarCalculos() {
        if (!this.estado || !this.calculadora) return
        
        const funcion = this.estado.obtenerFuncionActual()
        const limites = this.estado.obtenerLimites()
        const posicionX = this.estado.obtenerPosicionX()
        
        if (!funcion) return
        
        // Calcular teorema completo
        const resultados = this.calculadora.calcularTeoremaCompleto(
            funcion,
            limites.a,
            posicionX
        )
        
        // Actualizar estado
        this.estado.establecerCalculos(resultados)
        
        // Actualizar tiempo de exploración
        this.estado.actualizarTiempoExploracion()
    }
    
    // ✅ RENDERIZADO INMEDIATO (SIN DEBOUNCING)
    async renderizarInmediato() {
        if (this.isRendering) return
        
        this.isRendering = true
        try {
            await this.renderizar()
        } catch (error) {
            console.error('Error en renderizado inmediato:', error)
        } finally {
            this.isRendering = false
        }
    }
    
    // ✅ RENDERIZAR
    async renderizar() {
        console.log('🎨 GestorVisualizacionPTFC: Iniciando renderizado...')
        if (!this.renderizadorPuente || !this.renderizadorCartesiano) {
            console.warn('⚠️ Renderizadores no disponibles')
            return
        }
        
        // ✅ EJECUTAR CÁLCULOS ANTES DE RENDERIZAR
        await this.ejecutarCalculos()
        
        const estado = this.estado.obtenerCalculos()
        const configuracion = this.configuracion.obtenerColores()
        console.log('📊 Estado:', estado)
        console.log('🎨 Configuración:', configuracion)
        
        // Renderizar puente mágico
        if (this.canvasPuente) {
            console.log('🌉 Renderizando puente mágico...')
            await this.renderizadorPuente.renderizar(
                this.canvasPuente,
                this.estado,
                this.transformador,
                configuracion
            )
            console.log('✅ Puente mágico renderizado')
        } else {
            console.warn('⚠️ Canvas puente no disponible')
        }
        
        // Renderizar gráfica cartesiana
        if (this.canvasCartesiano) {
            console.log('📈 Renderizando gráfica cartesiana...')
            await this.renderizadorCartesiano.renderizar(
                this.canvasCartesiano,
                this.estado,
                this.transformador,
                configuracion
            )
            console.log('✅ Gráfica cartesiana renderizada')
        } else {
            console.warn('⚠️ Canvas cartesiano no disponible')
        }
    }
    
    // ✅ INICIAR ANIMACIÓN
    iniciarAnimacion() {
        if (!this.estado) return
        
        const limites = this.estado.obtenerLimites()
        const velocidad = this.estado.obtenerEstadoAnimacion().velocidad
        
        const animar = () => {
            if (!this.estado.obtenerEstadoAnimacion().activa) return
            
            const posicionActual = this.estado.obtenerPosicionX()
            const nuevaPosicion = posicionActual + (limites.b - limites.a) * velocidad * 0.01
            
            if (nuevaPosicion >= limites.b) {
                this.estado.establecerPosicionX(limites.b)
                this.detenerAnimacion()
            } else {
                this.estado.establecerPosicionX(nuevaPosicion)
                // ✅ RENDERIZADO INMEDIATO PARA ANIMACIÓN
                this.renderizarInmediato()
                requestAnimationFrame(animar)
            }
        }
        
        requestAnimationFrame(animar)
    }
    
    // ✅ DETENER ANIMACIÓN
    detenerAnimacion() {
        if (!this.estado) return
        
        this.estado.establecerEstadoAnimacion({
            activa: false,
            velocidad: this.estado.obtenerEstadoAnimacion().velocidad,
            posicion: this.estado.obtenerEstadoAnimacion().posicion
        })
    }
    
    // ✅ VERIFICAR LOGROS
    verificarLogros() {
        if (!this.gestorLogros || !this.estado) return
        
        const datos = {
            posicionX: this.estado.obtenerPosicionX(),
            limiteA: this.estado.obtenerLimites().a,
            limiteB: this.estado.obtenerLimites().b,
            verificacionTeorema: this.estado.obtenerCalculos().verificacionTeorema,
            funcionesExploradas: 1 // TODO: Implementar contador
        }
        
        const logrosDesbloqueados = this.gestorLogros.verificarLogros(datos)
        
        if (logrosDesbloqueados.length > 0) {
            logrosDesbloqueados.forEach(logro => {
                this.estado.agregarLogroDesbloqueado(logro)
                this.onLogroDesbloqueado(logro)
            })
        }
    }
    
    // ✅ MANEJAR HOVER
    manejarHover(evento, canvas, transformador) {
        if (!canvas || !transformador || !this.estado) return
        
        const rect = canvas.getBoundingClientRect()
        const x = evento.clientX - rect.left
        const y = evento.clientY - rect.top
        
        // Convertir coordenadas del canvas a coordenadas matemáticas
        const coordenadasMatematicas = transformador.canvasAMatematicas(x, y)
        const xMatematico = coordenadasMatematicas.x
        
        // Actualizar posición si está dentro de los límites
        const limites = this.estado.obtenerLimites()
        if (xMatematico >= limites.a && xMatematico <= limites.b) {
            this.actualizarPosicionX(xMatematico)
        }
    }
    
    // ✅ OBTENER ESTADO ACTUAL
    obtenerEstado() {
        return this.estado
    }
    
    // ✅ OBTENER CONFIGURACIÓN
    obtenerConfiguracion() {
        return this.configuracion
    }
    
    // ✅ OBTENER CÁLCULOS
    obtenerCalculos() {
        return this.estado ? this.estado.obtenerCalculos() : null
    }
    
    // ✅ OBTENER LOGROS
    obtenerLogros() {
        return this.estado ? this.estado.obtenerLogrosDesbloqueados() : []
    }
    
    // ✅ OBTENER TIEMPO
    obtenerTiempo() {
        return this.estado ? {
            sesion: this.estado.obtenerTiempoSesion(),
            exploracion: this.estado.obtenerTiempoExploracion()
        } : null
    }
    
    // ✅ REINICIAR
    reiniciar() {
        if (this.estado) {
            this.estado.reiniciar()
            this.recalcularYRenderizar()
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
    }
}
