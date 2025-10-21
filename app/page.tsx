"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/Sidebar"
import { GestorEstadisticas } from "@/src/servicios/GestorEstadisticas"
import { BookOpen, Clock, Target, ArrowRight } from "lucide-react"

export default function Home() {
  const [estadisticas, setEstadisticas] = useState({ escenariosDisponibles: 0, temasCubiertos: 0, tiempoEstimado: 0 })
  const [escenarios, setEscenarios] = useState<any[]>([])

  useEffect(() => {
    const gestor = new GestorEstadisticas()
    setEstadisticas(gestor.obtenerEstadisticas())
    setEscenarios(gestor.obtenerEscenarios())
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido Principal */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">¡Bienvenido al Bosque Mágico de Integrales! ✨</h1>
          <p className="text-gray-600 mb-4">
            Explora los diferentes escenarios y aprende sobre integrales de manera interactiva
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Estudiante activo</span>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">🌱</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Escenarios Disponibles</p>
              <p className="text-3xl font-bold text-gray-800">{estadisticas.escenariosDisponibles}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Temas Cubiertos</p>
              <p className="text-3xl font-bold text-gray-800">{estadisticas.temasCubiertos}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tiempo Estimado</p>
              <p className="text-3xl font-bold text-gray-800">{estadisticas.tiempoEstimado} min</p>
            </div>
          </div>
        </div>

        {/* Tarjetas de Escenarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {escenarios.map((escenario) => (
            <Link key={escenario.id} href={`/escenario-${escenario.id}`}>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-16 h-16 ${escenario.color} rounded-2xl flex items-center justify-center text-3xl`}
                    >
                      {escenario.icono}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{escenario.titulo}</h3>
                      <p className="text-sm text-gray-600">{escenario.descripcion}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {escenario.temas.map((tema: string) => (
                      <span key={tema} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {tema}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            escenario.nivel === "Básico"
                              ? "bg-green-500"
                              : escenario.nivel === "Intermedio"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                        {escenario.nivel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {escenario.duracion} min
                      </span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors group-hover:gap-3">
                      Comenzar
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sección: ¿Cómo usar IntegraLearn? */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">¿Cómo usar IntegraLearn?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">1. Selecciona un Escenario</h3>
              <p className="text-sm text-gray-600">Elige el tema que quieres aprender o comienza tu aventura mágica</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">2. Modo Guiado o Libre</h3>
              <p className="text-sm text-gray-600">Aprende paso a paso o explora libremente según tu preferencia</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">3. Interactúa y Aprende</h3>
              <p className="text-sm text-gray-600">Manipula las simulaciones y recibe retroalimentación inmediata</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
