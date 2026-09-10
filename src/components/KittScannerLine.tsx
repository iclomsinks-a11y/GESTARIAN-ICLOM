import React from 'react'

export type KittScannerMode = 'off' | 'metis-ai' | 'bidirectional'

interface KittScannerLineProps {
  mode: KittScannerMode
  className?: string
}

export const KittScannerLine: React.FC<KittScannerLineProps> = ({ mode, className = '' }) => {
  if (mode === 'off') return null

  return (
    <div
      className={`w-[80%] max-w-xl mx-auto flex flex-col items-center justify-center select-none pointer-events-none transition-all duration-300 ${className}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes kittCometRed {
          0% {
            left: 0%;
            transform: translateX(0%);
            background: linear-gradient(to right, transparent 0%, rgba(220, 38, 38, 0.04) 15%, rgba(239, 68, 68, 0.3) 40%, rgba(239, 68, 68, 0.75) 75%, #ff4d4d 90%, #ffffff 100%);
            box-shadow: 0 0 18px #ef4444, 4px 0 12px #ffffff;
            filter: drop-shadow(0 0 8px #ef4444);
          }
          49.9% {
            left: 100%;
            transform: translateX(-100%);
            background: linear-gradient(to right, transparent 0%, rgba(220, 38, 38, 0.04) 15%, rgba(239, 68, 68, 0.3) 40%, rgba(239, 68, 68, 0.75) 75%, #ff4d4d 90%, #ffffff 100%);
            box-shadow: 0 0 18px #ef4444, 4px 0 12px #ffffff;
            filter: drop-shadow(0 0 8px #ef4444);
          }
          50% {
            left: 100%;
            transform: translateX(-100%);
            background: linear-gradient(to left, transparent 0%, rgba(220, 38, 38, 0.04) 15%, rgba(239, 68, 68, 0.3) 40%, rgba(239, 68, 68, 0.75) 75%, #ff4d4d 90%, #ffffff 100%);
            box-shadow: 0 0 18px #ef4444, -4px 0 12px #ffffff;
            filter: drop-shadow(0 0 8px #ef4444);
          }
          99.9% {
            left: 0%;
            transform: translateX(0%);
            background: linear-gradient(to left, transparent 0%, rgba(220, 38, 38, 0.04) 15%, rgba(239, 68, 68, 0.3) 40%, rgba(239, 68, 68, 0.75) 75%, #ff4d4d 90%, #ffffff 100%);
            box-shadow: 0 0 18px #ef4444, -4px 0 12px #ffffff;
            filter: drop-shadow(0 0 8px #ef4444);
          }
          100% {
            left: 0%;
            transform: translateX(0%);
            background: linear-gradient(to right, transparent 0%, rgba(220, 38, 38, 0.04) 15%, rgba(239, 68, 68, 0.3) 40%, rgba(239, 68, 68, 0.75) 75%, #ff4d4d 90%, #ffffff 100%);
            box-shadow: 0 0 18px #ef4444, 4px 0 12px #ffffff;
            filter: drop-shadow(0 0 8px #ef4444);
          }
        }

        @keyframes kittCometTurquoise {
          0% {
            left: 0%;
            transform: translateX(0%);
            background: linear-gradient(to right, transparent 0%, rgba(64, 224, 208, 0.04) 15%, rgba(6, 182, 212, 0.3) 40%, rgba(6, 182, 212, 0.75) 75%, #38bdf8 90%, #ffffff 100%);
            box-shadow: 0 0 18px #40e0d0, 4px 0 12px #ffffff;
            filter: drop-shadow(0 0 8px #40e0d0);
          }
          49.9% {
            left: 100%;
            transform: translateX(-100%);
            background: linear-gradient(to right, transparent 0%, rgba(64, 224, 208, 0.04) 15%, rgba(6, 182, 212, 0.3) 40%, rgba(6, 182, 212, 0.75) 75%, #38bdf8 90%, #ffffff 100%);
            box-shadow: 0 0 18px #40e0d0, 4px 0 12px #ffffff;
            filter: drop-shadow(0 0 8px #40e0d0);
          }
          50% {
            left: 100%;
            transform: translateX(-100%);
            background: linear-gradient(to left, transparent 0%, rgba(64, 224, 208, 0.04) 15%, rgba(6, 182, 212, 0.3) 40%, rgba(6, 182, 212, 0.75) 75%, #38bdf8 90%, #ffffff 100%);
            box-shadow: 0 0 18px #40e0d0, -4px 0 12px #ffffff;
            filter: drop-shadow(0 0 8px #40e0d0);
          }
          99.9% {
            left: 0%;
            transform: translateX(0%);
            background: linear-gradient(to left, transparent 0%, rgba(64, 224, 208, 0.04) 15%, rgba(6, 182, 212, 0.3) 40%, rgba(6, 182, 212, 0.75) 75%, #38bdf8 90%, #ffffff 100%);
            box-shadow: 0 0 18px #40e0d0, -4px 0 12px #ffffff;
            filter: drop-shadow(0 0 8px #40e0d0);
          }
          100% {
            left: 0%;
            transform: translateX(0%);
            background: linear-gradient(to right, transparent 0%, rgba(64, 224, 208, 0.04) 15%, rgba(6, 182, 212, 0.3) 40%, rgba(6, 182, 212, 0.75) 75%, #38bdf8 90%, #ffffff 100%);
            box-shadow: 0 0 18px #40e0d0, 4px 0 12px #ffffff;
            filter: drop-shadow(0 0 8px #40e0d0);
          }
        }
      `}</style>

      {/* Carcasa estilizada del escáner bajo el footer con grille KITT */}
      <div className="w-full h-4 bg-black/95 rounded-md border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.9),inset_0_0_8px_rgba(0,0,0,0.95)] p-0.5 flex items-center overflow-hidden relative backdrop-blur-md">
        
        {/* Grille frontal de segmentos tipo KITT */}
        <div className="absolute inset-0 flex justify-between pointer-events-none z-10 px-0.5">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-[1.5px] h-full bg-black/50" />
          ))}
        </div>

        {/* ============================================================ */}
        {/* MODO 1: METIS AI (Cometa Turquesa / Celeste)                 */}
        {/* ============================================================ */}
        {mode === 'metis-ai' && (
          <div className="relative w-full h-full overflow-hidden">
            {/* Resplandor ambiental de fondo */}
            <div className="absolute inset-0 bg-[#40e0d0]/10" />

            {/* Haz tipo cometa: cabeza brillante al frente y rastro de luz difuminado */}
            <div
              className="absolute top-0 bottom-0 w-[38%] rounded-full"
              style={{
                animation: 'kittCometTurquoise 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
              }}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* MODO 2: CONVERSACIÓN BIDIRECCIONAL (Cometa Rojo K.I.T.T.)     */}
        {/* ============================================================ */}
        {mode === 'bidirectional' && (
          <div className="relative w-full h-full overflow-hidden">
            {/* Resplandor ambiental de fondo rojo */}
            <div className="absolute inset-0 bg-red-950/30" />

            {/* Haz tipo cometa: cabeza blanca/roja al frente y rastro de luz difuminado */}
            <div
              className="absolute top-0 bottom-0 w-[38%] rounded-full"
              style={{
                animation: 'kittCometRed 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
              }}
            />
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
