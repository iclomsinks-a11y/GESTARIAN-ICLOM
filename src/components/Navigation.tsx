import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, X, Camera, Power, Minimize2, Smartphone, Monitor, ChevronLeft, ChevronRight, Plus, UserPlus,
  LayoutGrid, Calendar, Wrench, Users, FileText, Scale, Truck, AlertTriangle, Settings, FolderOpen, Inbox, FileCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { NAV_ITEMS, FOOTER_NAV } from '../lib/navigation'
import { useTheme } from '../lib/theme'
import { useUIState } from '../lib/uiStateContext'
import { useMobileMode } from '../lib/mobileMode'
import { MetisVoiceCall } from './MetisVoiceCall'
import { KittScannerLine } from './KittScannerLine'
import { can, getPerfil } from '../services/authService'
import { supabase } from '../lib/supabase'

// Paleta de colores vibrantes para el menú
const MENU_COLORS = [
  '#06b6d4', // Cyan
  '#a855f7', // Purple
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#84cc16', // Lime
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#d946ef', // Fuchsia
  '#eab308', // Yellow
]

/* ── Floating exit-fullscreen button (always visible while in fullscreen) ── */
export function FullscreenExitButton() {
  const { isFullscreen, exitFullscreen } = useUIState()
  const { playSound } = useTheme()
  const [showHint, setShowHint] = useState(false)

  if (!isFullscreen) return null

  const handleExit = () => {
    playSound('click')
    exitFullscreen()
    // Si no había elemento en fullscreen (caso F11 del navegador, que JS no puede
    // cancelar), avisamos de la única forma de salir: la tecla F11.
    if (!document.fullscreenElement) {
      setShowHint(true)
      window.setTimeout(() => setShowHint(false), 4500)
    }
  }

  return (
    <>
      {showHint && (
        <div className="fixed top-12 right-2 z-[70] bg-black/90 text-white text-xs px-3 py-2 rounded-lg border border-white/25 shadow-xl pointer-events-none">
          Pulsa <kbd className="font-bold text-[#40e0d0]">F11</kbd> (o <kbd className="font-bold text-[#40e0d0]">Esc</kbd>) para salir de pantalla completa
        </div>
      )}
      <button
        onClick={handleExit}
        className="fixed top-2 right-2 z-[70] w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white border border-white/30 hover:bg-black/90 hover:border-[#40e0d0]/60 shadow-lg transition-all backdrop-blur-md active:scale-95"
        aria-label="Salir de pantalla completa"
        title="Salir de pantalla completa (Esc / F11)"
      >
        <Minimize2 className="w-5 h-5" />
      </button>
    </>
  )
}

/* 📱 Power button (mobile/tablet portrait, all pages, top left) 📱 */
export function PowerButton() {
  return (
    <button
      onClick={() => window.close()}
      className="gestarian-power-btn w-10 h-10 flex items-center justify-center lg:hidden fixed top-4 left-4 z-50 rounded-full border border-gray-600 bg-bg-900/80 backdrop-blur"
      title="Salir de la aplicación"
    >
      <Power className="w-5 h-5 text-red-500" />
    </button>
  )
}

/* ── Desktop header (PC / tablet landscape, auto-show on mouse-near-top) ── */
export function DesktopHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { playSound, themeSettings } = useTheme()
  const { setHeaderHover, exitFullscreen } = useUIState()
  const { mobileMode, toggleMobileMode } = useMobileMode()
  const isInicio = location.pathname === '/'

  if (mobileMode && !window.matchMedia('(min-width: 1024px)').matches) return null

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.permiso || can(item.permiso))
  const routes = visibleNavItems.filter((n) => n.path !== '/').map((n) => n.path)
  const currentIdx = routes.indexOf(location.pathname)
  const prev = currentIdx > 0 ? routes[currentIdx - 1] : null
  const next = currentIdx >= 0 && currentIdx < routes.length - 1 ? routes[currentIdx + 1] : null

  const [logoColor, setLogoColor] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('configuracion').select('logo_color').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data?.logo_color) setLogoColor(data.logo_color)
    })
  }, [])

  return (
    <header
      onMouseEnter={() => setHeaderHover(true)}
      onMouseLeave={() => setHeaderHover(false)}
      className="hidden md:flex gestarian-header-bar visible gestarian-panel fixed top-0 left-0 right-0 z-50 items-center gap-2 px-4 py-2.5 border-b border-bg-700"
    >
      {!isInicio && (
        <button
          onClick={() => { playSound('click'); navigate('/') }}
          className="shrink-0 transition-transform active:scale-95"
          aria-label="Inicio"
          title="Ir a Inicio"
        >
          <img
            src={logoColor || themeSettings.logo_url || "/images/logos/logo.jpg"}
            alt={themeSettings.commercial_name || "GESTARIAN"}
            className="w-8 h-8 rounded-lg object-contain bg-slate-900/60 p-0.5 border border-white/20 shadow-sm"
          />
        </button>
      )}

      <button
        onClick={() => { if (prev) { playSound('click'); navigate(prev) } }}
        disabled={!prev}
        className="gestarian-nav-btn w-9 h-9 flex items-center justify-center disabled:opacity-30 shrink-0"
        aria-label="Retroceder"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 flex items-center gap-1 overflow-x-auto mx-2">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => { playSound('click'); navigate(item.path) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-[#40e0d0]/20 text-[#40e0d0] border border-[#40e0d0]/40'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => { playSound('click'); window.location.href = '/' }}
        className="gestarian-power-btn w-9 h-9 flex items-center justify-center shrink-0"
        aria-label="Salir"
      >
        <Power className="w-4 h-4" />
      </button>

      <button
        onClick={() => { playSound('click'); exitFullscreen() }}
        className="gestarian-nav-btn w-9 h-9 flex items-center justify-center shrink-0"
        aria-label="Salir de pantalla completa"
      >
        <Minimize2 className="w-4 h-4" />
      </button>

      <button
        onClick={() => { playSound('click'); toggleMobileMode() }}
        className={`gestarian-nav-btn w-9 h-9 flex items-center justify-center shrink-0 ${mobileMode ? 'text-[#40e0d0]' : ''}`}
        aria-label={mobileMode ? "Vista Escritorio" : "Vista Móvil"}
      >
        {mobileMode ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
      </button>

      <button
        onClick={() => { if (next) { playSound('click'); navigate(next) } }}
        disabled={!next}
        className="gestarian-nav-btn w-9 h-9 flex items-center justify-center disabled:opacity-30 shrink-0"
        aria-label="Avanzar"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </header>
  )
}

/* ── Mobile/Tablet Portrait footer: Camera, Menu, Mic ── */
export function MobileFooter() {
  const { playSound } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [shouldHide, setShouldHide] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Estados de apertura de Metis para la línea de escáner KITT
  const [metisAssistantOpen, setMetisAssistantOpen] = useState(false)
  const [metisVoiceActive, setMetisVoiceActive] = useState(false)

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setShouldHide(!!detail?.hide)
    }

    const handleAssistantStatus = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && typeof detail.open === 'boolean') {
        setMetisAssistantOpen(detail.open)
      }
    }

    const handleVoiceStatus = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && typeof detail.isActive === 'boolean') {
        setMetisVoiceActive(detail.isActive)
      }
    }

    window.addEventListener('gestarian-toggle-footer', handleToggle)
    window.addEventListener('metis-assistant-status', handleAssistantStatus)
    window.addEventListener('metis-voice-status', handleVoiceStatus)
    return () => {
      window.removeEventListener('gestarian-toggle-footer', handleToggle)
      window.removeEventListener('metis-assistant-status', handleAssistantStatus)
      window.removeEventListener('metis-voice-status', handleVoiceStatus)
    }
  }, [])

  if (shouldHide) {
    return null
  }

  // Clics directos sin animaciones ni retrasos molestos en los iconos del footer
  const handleFooterAction = (action: () => void) => {
    if ('vibrate' in navigator) navigator.vibrate(30)
    playSound('click')
    action()
  }

  const handleNavClick = (path: string, state?: any) => {
    if ('vibrate' in navigator) navigator.vibrate(40)
    playSound('click')
    setMenuOpen(false)
    navigate(path, state ? { state } : undefined)
  }

  const isA4Document = ['/presupuestos', '/presupuesto-hibrido'].includes(location.pathname)
  if (isA4Document) return null

  const isInicio = location.pathname === '/'
  const isClientePortal = location.pathname.startsWith('/cliente')
  const perfil = getPerfil()
  const activeUser = (localStorage.getItem('gestarian_test_user') || perfil?.email || '').toLowerCase().trim()
  const isDev = perfil?.esDeveloper || localStorage.getItem('gestarian_dev_mode') === 'true' || activeUser === 'iclomsinks@gmail.com'

  // El footer completo con los 4 iconos solo se muestra en modo desarrollador (o para iclomsinks@gmail.com).
  // En modo usuario normal, solo ven en el footer los iconos de Cámara y Menú.
  const showAiControls = !isClientePortal && isDev

  // Modo del escáner KITT bajo el footer:
  // - Si voz bidireccional activa -> modo 'bidirectional' (KITT Rojo con puntos cuadrados)
  // - Si asistente METIS abierto -> modo 'metis-ai' (Turquesa con centro claro y estela)
  // - Si ninguno está abierto -> 'off'
  const scannerMode: 'off' | 'metis-ai' | 'bidirectional' = metisVoiceActive
    ? 'bidirectional'
    : (metisAssistantOpen ? 'metis-ai' : 'off')

  return (
    <>
      {location.pathname !== '/' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/90 via-black/[0.65] to-transparent z-30 pointer-events-none" />
      )}
      
      {/* Contenedor del footer: iconos + línea del coche fantástico justo debajo */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
        <nav className={`pointer-events-auto w-full flex items-center ${showAiControls ? 'justify-between' : 'justify-center gap-8'} px-6`}>
          {/* Botón Cámara estático */}
          <button
            onClick={() => handleFooterAction(() => navigate('/presupuesto-hibrido', { state: { startCamera: true } }))}
            className="w-16 h-16 rounded-full bg-transparent text-[#40e0d0] shadow-[0_0_10px_rgba(64,224,208,0.9),inset_0_0_5px_rgba(64,224,208,0.9)] border-[1px] border-white flex items-center justify-center transition-transform active:scale-95 flex-shrink-0"
            style={{ filter: 'drop-shadow(0 0 5px rgb(64, 224, 157))' }}
            aria-label="Cámara"
          >
            <Camera className="w-7 h-7" strokeWidth={1} color="white" />
          </button>

          {/* Botón Menú estático */}
          <button
            onClick={() => handleFooterAction(() => setMenuOpen(!menuOpen))}
            className="w-16 h-16 rounded-full bg-transparent text-[#d3d3d3] shadow-[0_0_10px_rgba(211,211,211,0.9),inset_0_0_5px_rgba(211,211,211,0.9)] border-[1px] border-white flex items-center justify-center transition-transform active:scale-95 flex-shrink-0"
            style={{ filter: 'drop-shadow(0 0 5px #f15b04e7)' }}
            aria-label="Menú"
          >
            {menuOpen ? <X className="w-7 h-7" strokeWidth={1} color="white" /> : <Menu className="w-7 h-7" strokeWidth={1} color="white" />}
          </button>

          {showAiControls && (
            <>
              {/* Botón METIS AI estático (sin animaciones) */}
              <button
                onClick={() => handleFooterAction(() => window.dispatchEvent(new Event('metis-toggle-panel')))}
                className={`w-16 h-16 rounded-full bg-transparent text-white border-[1px] flex items-center justify-center transition-transform active:scale-95 flex-shrink-0 relative ${
                  metisAssistantOpen
                    ? 'border-[#40e0d0] shadow-[0_0_12px_rgba(64,224,208,0.9),inset_0_0_5px_rgba(64,224,208,0.7)]'
                    : 'border-white/50 shadow-[0_0_5px_rgba(168,85,247,1)]'
                }`}
                style={{ backgroundColor: 'rgba(0,0,0,0)' }}
                aria-label="Asistente METIS"
              >
                <span className="font-thin text-[32px] text-transparent tracking-widest drop-shadow-[0_0_5px_rgba(168,85,247,1)]" style={{ WebkitTextStroke: '1px white' }}>AI</span>
                {/* Indicador de estado estático sin animación ping */}
                <span className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-black ${metisAssistantOpen ? 'bg-[#40e0d0]' : 'bg-emerald-400'}`} />
              </button>

              {/* Botón Conversación Bidireccional estático */}
              <MetisVoiceCall />
            </>
          )}
        </nav>

        {/* Línea del coche fantástico KITT bajo los iconos del footer ocupando el 80% de ancho */}
        {scannerMode !== 'off' && (
          <div className="w-full flex justify-center pointer-events-auto mt-2">
            <KittScannerLine mode={scannerMode} />
          </div>
        )}
      </div>

      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-bg-950 flex flex-col justify-between overflow-hidden"
          style={{
            backgroundImage: 'url(/images/backgrounds/background_portrait.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            ['--bento-gap' as any]: '8px',
          }}
        >
          {/* Overlay oscuro semitransparente sobre la imagen (reducido al 30%) */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-none" />

          {/* Botón cerrar */}
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95 shadow-md"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Bento grid — ocupando la totalidad del display adaptándose al espacio disponible con separación exterior x2 */}
          <div
            className="relative z-10 w-full h-full flex flex-col box-border"
            style={{
              padding: 'calc(var(--bento-gap) * 2)',
            }}
          >
            <div
              className="w-full h-full max-w-none grid"
              style={{
                gridTemplateColumns: 'repeat(12, 1fr)',
                gridTemplateRows: 'repeat(7, 1fr)',
                gap: 'var(--bento-gap)',
              }}
            >
              <style>{`
                @keyframes flyFromLeft {
                  0% { opacity: 0; transform: translate3d(-140px, -60px, 0) scale(0.6) rotate(-8deg); }
                  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
                }
                @keyframes flyFromRight {
                  0% { opacity: 0; transform: translate3d(140px, 60px, 0) scale(0.6) rotate(8deg); }
                  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
                }
                @keyframes flyFromTop {
                  0% { opacity: 0; transform: translate3d(0, -180px, 0) scale(0.5); }
                  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
                }
                @keyframes flyFromBottom {
                  0% { opacity: 0; transform: translate3d(0, 180px, 0) scale(0.5); }
                  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
                }
                @keyframes flyFromTopRight {
                  0% { opacity: 0; transform: translate3d(160px, -120px, 0) scale(0.5) rotate(12deg); }
                  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
                }
                @keyframes flyFromBottomLeft {
                  0% { opacity: 0; transform: translate3d(-160px, 120px, 0) scale(0.5) rotate(-12deg); }
                  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
                }
                @keyframes bentoTap {
                  0% { transform: scale(1); }
                  40% { transform: scale(0.93); }
                  100% { transform: scale(1); }
                }
                .bento-btn {
                  position: relative;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  text-align: center;
                  gap: 3px;
                  border-radius: 12px;
                  border-width: 1px;
                  border-style: solid;
                  overflow: hidden;
                  cursor: pointer;
                  -webkit-tap-highlight-color: transparent;
                  transition: border-color 0.2s ease, box-shadow 0.2s ease;
                  padding: 4px 2px;
                  width: 100%;
                  height: 100%;
                  min-height: 0;
                  animation-duration: 1.0s;
                  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                  animation-fill-mode: backwards;
                  backdrop-filter: blur(12px);
                }
                .bento-btn span {
                  color: #e2e8f0;
                  font-weight: 800;
                  font-size: clamp(1rem, 3.8vw, 1.25rem);
                  line-height: 1.15;
                  text-align: center;
                  letter-spacing: -0.01em;
                  width: 100%;
                  display: block;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  padding: 0 4px;
                }
                .bento-btn .bento-plus {
                  color: #e2e8f0;
                  font-weight: 900;
                  font-size: 2.1rem;
                  line-height: 1;
                  text-align: center;
                }
                .bento-btn:active {
                  animation: bentoTap 0.22s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .bento-btn.active-page {
                  border-width: 2.5px;
                  box-shadow: 0 0 20px rgba(255,255,255,0.3);
                }
              `}</style>

              {/* FILA 1: INICIO (span 6) & CONFIGURACIÓN (span 6) */}
              {(() => {
                const color = '#06b6d4'
                const isActive = location.pathname === '/'
                return (
                  <button key="bento-inicio" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromLeft', animationDelay: '0.03s' }}
                    onClick={() => handleNavClick('/')}>
                    <LayoutGrid className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>Inicio</span>
                  </button>
                )
              })()}

              {(() => {
                const color = '#d97706'
                const isActive = location.pathname === '/configuracion'
                return (
                  <button key="bento-configuracion" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromRight', animationDelay: '0.05s' }}
                    onClick={() => handleNavClick('/configuracion')}>
                    <Settings className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>Configuración</span>
                  </button>
                )
              })()}

              {/* FILA 2: CLIENTES (span 4) & CITAS (span 4) & TALLER (span 4) */}
              {(() => {
                const color = '#2563eb'
                const isActive = location.pathname === '/clientes'
                return (
                  <button key="bento-clientes" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 4', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromLeft', animationDelay: '0.08s' }}
                    onClick={() => handleNavClick('/clientes')}>
                    <Users className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>Clientes</span>
                  </button>
                )
              })()}

              {(() => {
                const color = '#b45309'
                const isActive = location.pathname === '/citas'
                return (
                  <button key="bento-citas" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 4', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromTop', animationDelay: '0.10s' }}
                    onClick={() => handleNavClick('/citas')}>
                    <Calendar className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>Citas</span>
                  </button>
                )
              })()}

              {(() => {
                const color = '#e11d48'
                const isActive = location.pathname === '/reparaciones'
                return (
                  <button key="bento-taller" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 4', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromRight', animationDelay: '0.12s' }}
                    onClick={() => handleNavClick('/reparaciones')}>
                    <Wrench className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>TALLER</span>
                  </button>
                )
              })()}

              {/* FILA 3: FACTURAS RECIBIDAS (span 6) & FACTURAS EMITIDAS (span 6) */}
              {(() => {
                const color = '#c2410c'
                const isActive = location.pathname === '/facturas-recibidas' || (location.pathname === '/facturas' && (location.state as any)?.tab === 'recibidas')
                return (
                  <button key="bento-facturas-recibidas" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromLeft', animationDelay: '0.15s' }}
                    onClick={() => handleNavClick('/facturas', { tab: 'recibidas' })}>
                    <FileText className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span title="Facturas Recibidas">Facturas Recibidas</span>
                  </button>
                )
              })()}

              {(() => {
                const color = '#d97706'
                const isActive = location.pathname === '/facturas' && (location.state as any)?.tab !== 'recibidas'
                return (
                  <button key="bento-facturas-emitidas" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromRight', animationDelay: '0.17s' }}
                    onClick={() => handleNavClick('/facturas', { tab: 'emitidas' })}>
                    <FileCheck className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span title="Facturas Emitidas">Facturas Emitidas</span>
                  </button>
                )
              })()}

              {/* FILA 4: PROVEEDORES (span 6) & BALANCES (span 6) */}
              {(() => {
                const color = '#6366f1'
                const isActive = location.pathname === '/proveedores'
                return (
                  <button key="bento-proveedores" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromLeft', animationDelay: '0.20s' }}
                    onClick={() => handleNavClick('/proveedores')}>
                    <Truck className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>Proveedores</span>
                  </button>
                )
              })()}

              {(() => {
                const color = '#10b981'
                const isActive = location.pathname === '/balances'
                return (
                  <button key="bento-balances" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromRight', animationDelay: '0.22s' }}
                    onClick={() => handleNavClick('/balances')}>
                    <Scale className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>Balances</span>
                  </button>
                )
              })()}

              {/* FILA 5: INCIDENCIAS (span 6) & PRESUPUESTOS (span 6) */}
              {(() => {
                const color = '#0d9488'
                const isActive = location.pathname === '/incidencias'
                return (
                  <button key="bento-incidencias" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromLeft', animationDelay: '0.25s' }}
                    onClick={() => handleNavClick('/incidencias')}>
                    <AlertTriangle className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>Incidencias</span>
                  </button>
                )
              })()}

              {(() => {
                const color = '#0891b2'
                const isActive = location.pathname === '/presupuestos'
                return (
                  <button key="bento-presupuestos" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromRight', animationDelay: '0.27s' }}
                    onClick={() => handleNavClick('/presupuestos')}>
                    <FileText className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>Presupuestos</span>
                  </button>
                )
              })()}

              {/* FILA 6: SOLICITUDES (span 6) & EXPEDIENTES (span 6) */}
              {(() => {
                const color = '#8b5cf6'
                const isActive = location.pathname === '/solicitudes'
                return (
                  <button key="bento-solicitudes" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromLeft', animationDelay: '0.30s' }}
                    onClick={() => handleNavClick('/solicitudes')}>
                    <Inbox className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>Solicitudes</span>
                  </button>
                )
              })()}

              {(() => {
                const color = '#a855f7'
                const isActive = location.pathname === '/expedientes'
                return (
                  <button key="bento-expedientes" className={`bento-btn ${isActive ? 'active-page' : ''}`}
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, animationName: 'flyFromRight', animationDelay: '0.32s' }}
                    onClick={() => handleNavClick('/expedientes')}>
                    <FolderOpen className="w-6 h-6 shrink-0" style={{ color }} strokeWidth={1.8} />
                    <span>Expedientes</span>
                  </button>
                )
              })()}

              {/* FILA 7: + PRESUPUESTO (span 6) & + CLIENTE (span 6) */}
              {(() => {
                const color = '#06b6d4'
                return (
                  <button key="nuevo-presupuesto" className="bento-btn"
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, boxShadow: `0 0 15px ${color}, inset 0 0 10px ${color}`, animationName: 'flyFromLeft', animationDelay: '0.35s' }}
                    onClick={() => { playSound('click'); setMenuOpen(false); navigate('/presupuestos', { state: { openForm: true } }) }}>
                    <span className="bento-plus" style={{ color }}>+</span>
                    <span>Presupuesto</span>
                  </button>
                )
              })()}

              {(() => {
                const color = '#10b981'
                return (
                  <button key="nuevo-cliente" className="bento-btn"
                    style={{ gridColumn: 'span 6', backgroundColor: `${color}4D`, borderColor: color, boxShadow: `0 0 15px ${color}, inset 0 0 10px ${color}`, animationName: 'flyFromRight', animationDelay: '0.37s' }}
                    onClick={() => { playSound('click'); setMenuOpen(false); navigate('/clientes', { state: { openNewModal: true } }) }}>
                    <span className="bento-plus" style={{ color }}>+</span>
                    <span>Cliente</span>
                  </button>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── PC / Tablet Landscape footer: 3x1 text buttons, auto-show, gray bg when not Inicio ── */
export function DesktopFooter() {
  const { playSound } = useTheme()
  const location = useLocation()
  const { footerVisible, setFooterHover } = useUIState()
  const { mobileMode } = useMobileMode()
  const isInicio = location.pathname === '/'
  const isA4Document = ['/facturas', '/presupuestos', '/presupuesto-hibrido'].includes(location.pathname)

  if (mobileMode || isA4Document) return null

  const visibleFooterNav = FOOTER_NAV.filter((item) => !item.permiso || can(item.permiso))

  return (
    <div
      onMouseEnter={() => setFooterHover(true)}
      onMouseLeave={() => setFooterHover(false)}
      className={`hidden lg:flex gestarian-footer-bar ${footerVisible ? 'visible' : ''} fixed bottom-0 left-0 right-0 z-40 items-center justify-center gap-2 py-3 ${isInicio ? '' : 'gestarian-footer-gray'}`}
    >
      {visibleFooterNav.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          onClick={() => playSound('click')}
          className={({ isActive }) =>
            `gestarian-footer-text-btn ${isActive ? 'active' : ''}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}
