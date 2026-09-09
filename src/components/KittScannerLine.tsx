import React, { useEffect, useState } from 'react'

export type KittScannerMode = 'off' | 'metis-ai' | 'bidirectional'

interface KittScannerLineProps {
  mode: KittScannerMode
  className?: string
}

export const KittScannerLine: React.FC<KittScannerLineProps> = ({ mode, className = '' }) => {
  const [activeLed, setActiveLed] = useState<number>(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const totalLeds = 16

  // Animación paso a paso de los LEDs cuadrados estilo KITT para el modo bidireccional
  useEffect(() => {
    if (mode !== 'bidirectional') return

    const interval = setInterval(() => {
      setActiveLed((prev) => {
        let next = prev + direction
        if (next >= totalLeds - 1) {
          setDirection(-1)
          next = totalLeds - 1
        } else if (next <= 0) {
          setDirection(1)
          next = 0
        }
        return next
      })
    }, 70) // Velocidad clásica del coche fantástico KITT

    return () => clearInterval(interval)
  }, [mode, direction])

  if (mode === 'off') return null

  return (
    <div
      className={`w-[80%] max-w-xl mx-auto flex flex-col items-center justify-center select-none pointer-events-none transition-all duration-300 ${className}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes sweepTurquoise {
          0% {
            left: 0%;
            transform: translateX(0%);
          }
          50% {
            left: 100%;
            transform: translateX(-100%);
          }
          100% {
            left: 0%;
            transform: translateX(0%);
          }
        }
      `}</style>

      {/* Carcasa estilizada del escáner bajo el footer */}
      <div className="w-full h-3.5 bg-black/90 rounded-md border border-white/20 shadow-[0_0_12px_rgba(0,0,0,0.8),inset_0_0_8px_rgba(0,0,0,0.9)] p-0.5 flex items-center overflow-hidden relative backdrop-blur-md">
        
        {/* ============================================================ */}
        {/* MODO 1: METIS AI (Línea Turquesa con centro claro y rastro)   */}
        {/* ============================================================ */}
        {mode === 'metis-ai' && (
          <div className="relative w-full h-full overflow-hidden">
            {/* Resplandor ambiental de fondo turquesa */}
            <div className="absolute inset-0 bg-[#40e0d0]/10" />

            {/* Cabeza del escáner turquesa con centro más claro y rastro difuminado */}
            <div
              className="absolute top-0 bottom-0 w-24 rounded-full"
              style={{
                animation: 'sweepTurquoise 2.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                background: 'linear-gradient(90deg, transparent 0%, rgba(64,224,208,0.4) 30%, #ffffff 50%, rgba(64,224,208,0.4) 70%, transparent 100%)',
                boxShadow: '0 0 16px #40e0d0, 0 0 8px #ffffff',
                filter: 'drop-shadow(0 0 6px #40e0d0)',
              }}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* MODO 2: CONVERSACIÓN BIDIRECCIONAL (KITT El Coche Fantástico) */}
        {/* Puntos / Bloques cuadrados de color rojo con decaimiento      */}
        {/* ============================================================ */}
        {mode === 'bidirectional' && (
          <div className="w-full h-full flex items-center justify-between gap-1 px-1">
            {Array.from({ length: totalLeds }).map((_, idx) => {
              const distance = Math.abs(idx - activeLed)
              
              // Intensidad y decaimiento del fósforo rojo
              let opacity = 0.12
              let bg = '#3f0000'
              let shadow = 'none'

              if (distance === 0) {
                // Cabeza activa central del KITT (punto cuadrado brillante con núcleo naranja-blanco)
                opacity = 1
                bg = '#ffffff'
                shadow = '0 0 12px #ff0000, 0 0 20px #ff2222, 0 0 4px #ffedd5'
              } else if (distance === 1) {
                // Primer punto adyacente (rojo vivo intenso)
                opacity = 0.9
                bg = '#ff1a1a'
                shadow = '0 0 10px #ff0000, 0 0 15px #dc2626'
              } else if (distance === 2) {
                // Segundo punto adyacente (rojo medio)
                opacity = 0.6
                bg = '#b91c1c'
                shadow = '0 0 6px #ef4444'
              } else if (distance === 3) {
                // Estela tenue de fósforo
                opacity = 0.3
                bg = '#7f1d1d'
                shadow = '0 0 3px #991b1b'
              }

              return (
                <div
                  key={idx}
                  className="flex-1 h-2 rounded-[2px] transition-all duration-75"
                  style={{
                    backgroundColor: bg,
                    opacity: opacity,
                    boxShadow: shadow,
                    border: distance <= 1 ? '1px solid #ffaaaa' : '1px solid rgba(255,0,0,0.15)',
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Subtítulo de estado sutil debajo de la línea */}
      <div className="text-[10px] font-mono tracking-widest uppercase mt-0.5 text-center flex items-center gap-1">
        {mode === 'metis-ai' && (
          <span className="text-[#40e0d0] drop-shadow-[0_0_5px_rgba(64,224,208,0.8)] font-bold">
            • METIS IA ACTIVA •
          </span>
        )}
        {mode === 'bidirectional' && (
          <span className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)] font-bold">
            • CONVERSACIÓN BIDIRECCIONAL K.I.T.T. •
          </span>
        )}
      </div>
    </div>
  )
}
