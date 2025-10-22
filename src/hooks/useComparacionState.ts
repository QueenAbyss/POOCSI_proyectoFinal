import { useRef, useState, useCallback, useEffect } from 'react'
import { EscenarioComparacion } from '../escenarios/EscenarioComparacion'

export function useComparacionState() {
    const escenarioComparacion = useRef<EscenarioComparacion | null>(null)
    const [estado, setEstado] = useState<any>(null)

    // Inicializar escenario automáticamente
    useEffect(() => {
        if (!escenarioComparacion.current) {
            escenarioComparacion.current = new EscenarioComparacion()
            setEstado(escenarioComparacion.current.estado)
        }
    }, [])

    const inicializarEscenario = useCallback(() => {
        if (!escenarioComparacion.current) {
            escenarioComparacion.current = new EscenarioComparacion()
            setEstado(escenarioComparacion.current.estado)
        }
        return escenarioComparacion.current
    }, [])

    const actualizarEstado = useCallback(() => {
        if (escenarioComparacion.current) {
            setEstado(escenarioComparacion.current.estado)
        }
    }, [])

    return {
        escenarioComparacion,
        estado,
        inicializarEscenario,
        actualizarEstado
    }
}
