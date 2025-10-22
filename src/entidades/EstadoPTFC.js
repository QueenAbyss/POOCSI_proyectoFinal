/**
 * ENTIDAD: EstadoPTFC
 * RESPONSABILIDAD: Solo almacenar y gestionar datos del Primer Teorema Fundamental del Cálculo
 * SRP: Solo datos, no lógica de negocio ni presentación
 */
export class EstadoPTFC {
    constructor() {
        // ✅ DATOS DE FUNCIÓN
        this.funcionSeleccionada = 'cuadratica'
        this.funcionActual = null
        this.dominio = { inicio: -2, fin: 6 }
        
        // ✅ DATOS DE LÍMITES
        this.limiteA = 0
        this.limiteB = 4
        this.posicionX = 2
        
        // ✅ DATOS DE CÁLCULOS
        this.valorFuncion = 0
        this.integralAcumulada = 0
        this.derivadaIntegral = 0
        this.verificacionTeorema = false
        this.diferenciaVerificacion = 0
        
        // ✅ DATOS DE ANIMACIÓN
        this.animacionActiva = false
        this.velocidadAnimacion = 1
        this.posicionAnimacion = 0
        
        // ✅ DATOS DE TIEMPO
        this.tiempoInicio = Date.now()
        this.tiempoSesion = 0
        this.tiempoExploracion = 0
        
        // ✅ DATOS DE LOGROS
        this.logrosDesbloqueados = []
        this.progresoLogros = 0
        
        // ✅ DATOS DE VALIDACIÓN
        this.estadoValidacion = {
            esValida: true,
            errores: [],
            advertencias: []
        }
    }
    
    // ✅ GETTERS Y SETTERS PARA FUNCIÓN
    obtenerFuncionSeleccionada() {
        return this.funcionSeleccionada
    }
    
    establecerFuncionSeleccionada(funcion) {
        this.funcionSeleccionada = funcion
    }
    
    obtenerFuncionActual() {
        return this.funcionActual
    }
    
    establecerFuncionActual(funcion) {
        this.funcionActual = funcion
    }
    
    // ✅ GETTERS Y SETTERS PARA LÍMITES
    obtenerLimites() {
        return { a: this.limiteA, b: this.limiteB }
    }
    
    establecerLimites(a, b) {
        this.limiteA = a
        this.limiteB = b
    }
    
    obtenerPosicionX() {
        return this.posicionX
    }
    
    establecerPosicionX(x) {
        this.posicionX = Math.max(this.limiteA, Math.min(this.limiteB, x))
    }
    
    // ✅ GETTERS Y SETTERS PARA CÁLCULOS
    obtenerCalculos() {
        return {
            valorFuncion: this.valorFuncion,
            integralAcumulada: this.integralAcumulada,
            derivadaIntegral: this.derivadaIntegral,
            verificacionTeorema: this.verificacionTeorema,
            diferenciaVerificacion: this.diferenciaVerificacion
        }
    }
    
    establecerCalculos(calculos) {
        this.valorFuncion = calculos.valorFuncion
        this.integralAcumulada = calculos.integralAcumulada
        this.derivadaIntegral = calculos.derivadaIntegral
        this.verificacionTeorema = calculos.verificacionTeorema
        this.diferenciaVerificacion = calculos.diferenciaVerificacion
    }
    
    // ✅ GETTERS Y SETTERS PARA ANIMACIÓN
    obtenerEstadoAnimacion() {
        return {
            activa: this.animacionActiva,
            velocidad: this.velocidadAnimacion,
            posicion: this.posicionAnimacion
        }
    }
    
    establecerEstadoAnimacion(estado) {
        this.animacionActiva = estado.activa
        this.velocidadAnimacion = estado.velocidad
        this.posicionAnimacion = estado.posicion
    }
    
    // ✅ GETTERS Y SETTERS PARA TIEMPO
    obtenerTiempoSesion() {
        return Date.now() - this.tiempoInicio
    }
    
    obtenerTiempoExploracion() {
        return this.tiempoExploracion
    }
    
    actualizarTiempoExploracion() {
        this.tiempoExploracion = Date.now() - this.tiempoInicio
    }
    
    // ✅ GETTERS Y SETTERS PARA LOGROS
    obtenerLogrosDesbloqueados() {
        return this.logrosDesbloqueados
    }
    
    agregarLogroDesbloqueado(logro) {
        if (!this.logrosDesbloqueados.find(l => l.id === logro.id)) {
            this.logrosDesbloqueados.push(logro)
        }
    }
    
    obtenerProgresoLogros() {
        return this.progresoLogros
    }
    
    establecerProgresoLogros(progreso) {
        this.progresoLogros = progreso
    }
    
    // ✅ GETTERS Y SETTERS PARA VALIDACIÓN
    obtenerEstadoValidacion() {
        return this.estadoValidacion
    }
    
    establecerEstadoValidacion(validacion) {
        this.estadoValidacion = validacion
    }
    
    // ✅ VALIDACIÓN DE LÍMITES
    validarLimites() {
        const errores = []
        
        if (this.limiteA >= this.limiteB) {
            errores.push('El límite inferior debe ser menor que el superior')
        }
        
        if (this.posicionX < this.limiteA || this.posicionX > this.limiteB) {
            errores.push('La posición x debe estar entre los límites')
        }
        
        const esValida = errores.length === 0
        
        this.estadoValidacion = {
            esValida,
            errores,
            advertencias: []
        }
        
        return esValida
    }
    
    // ✅ REINICIAR ESTADO
    reiniciar() {
        this.posicionX = this.limiteA
        this.animacionActiva = false
        this.posicionAnimacion = 0
        this.tiempoInicio = Date.now()
        this.tiempoExploracion = 0
        this.establecerCalculos({
            valorFuncion: 0,
            integralAcumulada: 0,
            derivadaIntegral: 0,
            verificacionTeorema: false,
            diferenciaVerificacion: 0
        })
    }
}
