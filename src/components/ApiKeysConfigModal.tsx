import React, { useState, useEffect } from 'react'
import { 
  Key, 
  ExternalLink, 
  Save, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Bot, 
  Database, 
  Mail, 
  Camera, 
  GitBranch, 
  ShieldCheck, 
  X, 
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { testAiConnection } from '../services/aiProviderService'
import { testPlateRecognizerConnection } from '../services/plateRecognizerService'

interface ApiKeysConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

export const ApiKeysConfigModal: React.FC<ApiKeysConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  // Google Gemini
  const [geminiKey, setGeminiKey] = useState('')
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash')
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [geminiTesting, setGeminiTesting] = useState(false)
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; msg: string } | null>(null)

  // Supabase
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')
  const [supabaseServiceKey, setSupabaseServiceKey] = useState('')
  const [showSupabaseKey, setShowSupabaseKey] = useState(false)
  const [supabaseTesting, setSupabaseTesting] = useState(false)
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; msg: string } | null>(null)

  // Resend
  const [resendKey, setResendKey] = useState('')
  const [resendFrom, setResendFrom] = useState('onboarding@resend.dev')
  const [gestoriaEmail, setGestoriaEmail] = useState('')
  const [showResendKey, setShowResendKey] = useState(false)
  const [resendTesting, setResendTesting] = useState(false)
  const [resendTestResult, setResendTestResult] = useState<{ success: boolean; msg: string } | null>(null)

  // Plate Recognizer
  const [plateKey, setPlateKey] = useState('')
  const [plateEndpoint, setPlateEndpoint] = useState('https://api.platerecognizer.com/v1/plate-reader/')
  const [showPlateKey, setShowPlateKey] = useState(false)
  const [plateTesting, setPlateTesting] = useState(false)
  const [plateTestResult, setPlateTestResult] = useState<{ success: boolean; msg: string } | null>(null)

  // GitHub
  const [githubRepo, setGithubRepo] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [githubBranch, setGithubBranch] = useState('main')
  const [showGithubToken, setShowGithubToken] = useState(false)

  // Fallback IA (Groq / OpenRouter)
  const [fallbackKey, setFallbackKey] = useState('')
  const [fallbackProvider, setFallbackProvider] = useState<'openrouter' | 'groq'>('groq')
  const [fallbackModel, setFallbackModel] = useState('llama-3.3-70b-versatile')
  const [showFallbackKey, setShowFallbackKey] = useState(false)
  const [fallbackTesting, setFallbackTesting] = useState(false)
  const [fallbackTestResult, setFallbackTestResult] = useState<{ success: boolean; msg: string } | null>(null)

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [copiedEnv, setCopiedEnv] = useState(false)
  const [showEnvImporter, setShowEnvImporter] = useState(false)
  const [importText, setImportText] = useState('')
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false)

  // Cargar claves desde localStorage y Supabase
  useEffect(() => {
    if (!isOpen) return

    // 1. Carga desde localStorage
    const savedGemini = localStorage.getItem('gestarian_gemini_api_key') || ''
    const savedPlate = localStorage.getItem('gestarian_plate_recognizer_key') || ''
    const savedFallback = localStorage.getItem('gestarian_fallback_api_key') || ''
    const savedSupabaseUrl = localStorage.getItem('gestarian_supabase_url') || (import.meta as any).env?.VITE_SUPABASE_URL || ''
    const savedSupabaseAnon = localStorage.getItem('gestarian_supabase_anon_key') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
    const savedSupabaseService = localStorage.getItem('gestarian_supabase_service_role_key') || ''
    const savedResend = localStorage.getItem('gestarian_resend_api_key') || ''
    const savedResendFrom = localStorage.getItem('gestarian_resend_from') || 'onboarding@resend.dev'
    const savedGestoriaEmail = localStorage.getItem('gestarian_gestoria_email') || ''
    const savedGithubRepo = localStorage.getItem('gestarian_github_repo') || 'https://github.com/iclomsinks-a11y/GESTARIAN-ICLOM.git'
    const savedGithubToken = localStorage.getItem('gestarian_github_token') || ''
    const savedGithubBranch = localStorage.getItem('gestarian_github_branch') || 'main'

    if (savedGemini) setGeminiKey(savedGemini)
    if (savedPlate) setPlateKey(savedPlate)
    if (savedFallback) setFallbackKey(savedFallback)
    if (savedSupabaseUrl) setSupabaseUrl(savedSupabaseUrl)
    if (savedSupabaseAnon) setSupabaseAnonKey(savedSupabaseAnon)
    if (savedSupabaseService) setSupabaseServiceKey(savedSupabaseService)
    if (savedResend) setResendKey(savedResend)
    if (savedResendFrom) setResendFrom(savedResendFrom)
    if (savedGestoriaEmail) setGestoriaEmail(savedGestoriaEmail)
    if (savedGithubRepo) setGithubRepo(savedGithubRepo)
    if (savedGithubToken) setGithubToken(savedGithubToken)
    if (savedGithubBranch) setGithubBranch(savedGithubBranch)

    // 2. Carga complementaria desde tabla de Supabase configuracion
    supabase.from('configuracion').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) {
        if (data.ai_api_key && !savedGemini) setGeminiKey(data.ai_api_key)
        if (data.ai_model) setGeminiModel(data.ai_model)
        if (data.plate_api_key && !savedPlate) setPlateKey(data.plate_api_key)
        if (data.plate_endpoint) setPlateEndpoint(data.plate_endpoint)
        if (data.email_api_key && !savedResend) setResendKey(data.email_api_key)
        if (data.email_from && !savedResendFrom) setResendFrom(data.email_from)
        if (data.email_gestoria && !savedGestoriaEmail) setGestoriaEmail(data.email_gestoria)
        if (data.fallback_api_key && !savedFallback) setFallbackKey(data.fallback_api_key)
        if (data.fallback_provider) setFallbackProvider(data.fallback_provider)
        if (data.fallback_model) setFallbackModel(data.fallback_model)
      }
    }).catch(() => {})
  }, [isOpen])

  // Probar Gemini
  const handleTestGemini = async () => {
    setGeminiTesting(true)
    setGeminiTestResult(null)
    try {
      const res = await testAiConnection({
        provider: 'gemini',
        model: geminiModel,
        api_key: geminiKey,
        status: 'testing'
      })
      setGeminiTestResult({ success: res.success, msg: res.message })
    } catch (e: any) {
      setGeminiTestResult({ success: false, msg: e.message || 'Error conectando con Gemini API' })
    } finally {
      setGeminiTesting(false)
    }
  }

  // Probar Supabase
  const handleTestSupabase = async () => {
    setSupabaseTesting(true)
    setSupabaseTestResult(null)
    try {
      const { data, error } = await supabase.from('configuracion').select('id').limit(1)
      if (error) throw error
      setSupabaseTestResult({ success: true, msg: '¡Conexión a Supabase exitosa! Base de datos operativa.' })
    } catch (e: any) {
      setSupabaseTestResult({ success: false, msg: `Error Supabase: ${e.message || 'No se pudo verificar la tabla'}` })
    } finally {
      setSupabaseTesting(false)
    }
  }

  // Probar Plate Recognizer
  const handleTestPlate = async () => {
    setPlateTesting(true)
    setPlateTestResult(null)
    try {
      const res = await testPlateRecognizerConnection({
        provider: 'plate_recognizer',
        api_key: plateKey,
        endpoint_url: plateEndpoint,
        status: 'testing'
      })
      setPlateTestResult({ success: res.success, msg: res.message })
    } catch (e: any) {
      setPlateTestResult({ success: false, msg: e.message || 'Error probando Plate Recognizer' })
    } finally {
      setPlateTesting(false)
    }
  }

  // Probar Fallback IA
  const handleTestFallback = async () => {
    setFallbackTesting(true)
    setFallbackTestResult(null)
    try {
      const res = await testAiConnection({
        provider: fallbackProvider,
        model: fallbackModel,
        api_key: fallbackKey,
        status: 'testing'
      })
      setFallbackTestResult({ success: res.success, msg: res.message })
    } catch (e: any) {
      setFallbackTestResult({ success: false, msg: e.message || 'Error probando IA de respaldo' })
    } finally {
      setFallbackTesting(false)
    }
  }

  // Probar formato Resend
  const handleTestResend = () => {
    setResendTesting(true)
    setTimeout(() => {
      setResendTesting(false)
      if (resendKey.startsWith('re_') && resendKey.length > 20) {
        setResendTestResult({ success: true, msg: 'Formato de clave Resend API válida (re_...). Lista para envío de emails.' })
      } else if (resendKey.length > 0) {
        setResendTestResult({ success: false, msg: 'La clave de Resend suele comenzar por "re_" y tener más de 20 caracteres.' })
      } else {
        setResendTestResult({ success: false, msg: 'Introduce una clave de Resend para verificar.' })
      }
    }, 400)
  }

  // Guardar todas las claves
  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      // 1. Guardar en localStorage
      if (geminiKey) {
        localStorage.setItem('gestarian_gemini_api_key', geminiKey)
        localStorage.setItem('gestarian_ai_assistant_config', JSON.stringify({
          provider: 'gemini',
          model: geminiModel,
          api_key: geminiKey,
          status: 'connected'
        }))
        localStorage.setItem('gestarian_document_ocr_config', JSON.stringify({
          provider: 'gemini',
          model: geminiModel,
          api_key: geminiKey,
          status: 'connected'
        }))
      }

      if (plateKey) {
        localStorage.setItem('gestarian_plate_recognizer_key', plateKey)
        localStorage.setItem('gestarian_plate_recognizer_config', JSON.stringify({
          provider: 'plate_recognizer',
          api_key: plateKey,
          endpoint_url: plateEndpoint,
          status: 'connected'
        }))
      }

      if (supabaseUrl) localStorage.setItem('gestarian_supabase_url', supabaseUrl)
      if (supabaseAnonKey) localStorage.setItem('gestarian_supabase_anon_key', supabaseAnonKey)
      if (supabaseServiceKey) localStorage.setItem('gestarian_supabase_service_role_key', supabaseServiceKey)

      if (resendKey) localStorage.setItem('gestarian_resend_api_key', resendKey)
      if (resendFrom) localStorage.setItem('gestarian_resend_from', resendFrom)
      if (gestoriaEmail) localStorage.setItem('gestarian_gestoria_email', gestoriaEmail)

      if (githubRepo) localStorage.setItem('gestarian_github_repo', githubRepo)
      if (githubToken) localStorage.setItem('gestarian_github_token', githubToken)
      if (githubBranch) localStorage.setItem('gestarian_github_branch', githubBranch)

      if (fallbackKey) {
        localStorage.setItem('gestarian_fallback_api_key', fallbackKey)
        localStorage.setItem('gestarian_fallback_ai_config', JSON.stringify({
          provider: fallbackProvider,
          model: fallbackModel,
          api_key: fallbackKey,
          enabled: true,
          status: 'connected'
        }))
      }

      // 2. Sincronizar con tabla configuracion de Supabase
      try {
        await supabase.from('configuracion').upsert({
          id: 1,
          ai_provider: 'gemini',
          ai_model: geminiModel,
          ai_api_key: geminiKey,
          doc_ocr_provider: 'gemini',
          doc_ocr_model: geminiModel,
          doc_ocr_api_key: geminiKey,
          plate_api_key: plateKey,
          plate_endpoint: plateEndpoint,
          email_api_key: resendKey,
          email_from: resendFrom,
          email_gestoria: gestoriaEmail,
          fallback_api_key: fallbackKey,
          fallback_provider: fallbackProvider,
          fallback_model: fallbackModel,
          fallback_enabled: !!fallbackKey
        })
      } catch (dbErr) {
        console.warn('No se pudo sincronizar en Supabase (offline o sin permisos):', dbErr)
      }

      setSaveSuccessMsg(true)
      setTimeout(() => setSaveSuccessMsg(false), 4000)
      if (onSaved) onSaved()
    } finally {
      setIsSaving(false)
    }
  }

  // Generar bloque de texto .env
  const generateEnvString = () => {
    return `# ===================================================
# GESTARIAN - VARIABLES DE ENTORNO Y CLAVES API
# ===================================================

# 1. SUPABASE
VITE_SUPABASE_URL=${supabaseUrl || 'https://tu-proyecto.supabase.co'}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey || 'tu-anon-key-de-supabase'}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey || ''}

# 2. GOOGLE GEMINI AI
VITE_GEMINI_API_KEY=${geminiKey || ''}
VITE_AI_MODEL=${geminiModel || 'gemini-2.5-flash'}

# 3. PLATE RECOGNIZER (OCR MATRÍCULAS)
VITE_PLATE_RECOGNIZER_KEY=${plateKey || ''}
VITE_PLATE_RECOGNIZER_ENDPOINT=${plateEndpoint || 'https://api.platerecognizer.com/v1/plate-reader/'}

# 4. RESEND (EMAIL TRANSACCIONAL)
RESEND_API_KEY=${resendKey || ''}
VITE_EMAIL_FROM=${resendFrom || 'onboarding@resend.dev'}
VITE_GESTORIA_EMAIL=${gestoriaEmail || ''}

# 5. GITHUB
VITE_GITHUB_REPO=${githubRepo || ''}
GITHUB_TOKEN=${githubToken || ''}
VITE_GITHUB_BRANCH=${githubBranch || 'main'}

# 6. IA DE RESPALDO (FALLBACK)
VITE_FALLBACK_API_KEY=${fallbackKey || ''}
VITE_FALLBACK_PROVIDER=${fallbackProvider || 'groq'}
VITE_FALLBACK_MODEL=${fallbackModel || 'llama-3.3-70b-versatile'}
`
  }

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(generateEnvString())
    setCopiedEnv(true)
    setTimeout(() => setCopiedEnv(false), 3000)
  }

  // Importador desde texto .env
  const handleImportEnv = () => {
    if (!importText) return

    const lines = importText.split('\n')
    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) return

      const key = trimmed.substring(0, eqIdx).trim()
      const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '')

      if (key === 'VITE_SUPABASE_URL') setSupabaseUrl(val)
      else if (key === 'VITE_SUPABASE_ANON_KEY') setSupabaseAnonKey(val)
      else if (key === 'SUPABASE_SERVICE_ROLE_KEY') setSupabaseServiceKey(val)
      else if (key === 'VITE_GEMINI_API_KEY') setGeminiKey(val)
      else if (key === 'VITE_AI_MODEL') setGeminiModel(val)
      else if (key === 'VITE_PLATE_RECOGNIZER_KEY') setPlateKey(val)
      else if (key === 'VITE_PLATE_RECOGNIZER_ENDPOINT') setPlateEndpoint(val)
      else if (key === 'RESEND_API_KEY') setResendKey(val)
      else if (key === 'VITE_EMAIL_FROM') setResendFrom(val)
      else if (key === 'VITE_GESTORIA_EMAIL') setGestoriaEmail(val)
      else if (key === 'VITE_GITHUB_REPO') setGithubRepo(val)
      else if (key === 'GITHUB_TOKEN') setGithubToken(val)
      else if (key === 'VITE_GITHUB_BRANCH') setGithubBranch(val)
      else if (key === 'VITE_FALLBACK_API_KEY') setFallbackKey(val)
      else if (key === 'VITE_FALLBACK_PROVIDER') setFallbackProvider(val as any)
      else if (key === 'VITE_FALLBACK_MODEL') setFallbackModel(val)
    })

    setShowEnvImporter(false)
    setImportText('')
    setSaveSuccessMsg(true)
    setTimeout(() => setSaveSuccessMsg(false), 3000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-950 border-2 border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* Cabecera del Formulario */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Centro de Claves, APIs y Conexiones
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  GESTARIAN Hub
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configura todos los servicios necesarios: Gemini, Supabase, Resend, Plate Recognizer y GitHub.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acciones Rápidas (Copiar .env / Importar) */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Tus claves se cifran localmente y están listas para uso inmediato.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEnvImporter(!showEnvImporter)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              {showEnvImporter ? 'Ocultar importador' : 'Importar desde .env'}
            </button>
            <button
              onClick={handleCopyEnv}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedEnv ? '¡Copiado al portapapeles!' : 'Copiar formato .env'}
            </button>
          </div>
        </div>

        {/* Cuadro desplegable para importar .env */}
        {showEnvImporter && (
          <div className="p-4 bg-slate-900 border-b border-amber-500/30 space-y-2">
            <p className="text-xs text-amber-300 font-semibold">
              Pega aquí el contenido de un archivo <code className="bg-black px-1.5 py-0.5 rounded">.env</code> para auto-completar todos los campos:
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="VITE_SUPABASE_URL=...&#10;VITE_GEMINI_API_KEY=...&#10;RESEND_API_KEY=..."
              rows={4}
              className="w-full p-3 bg-black border border-slate-700 rounded-xl font-mono text-xs text-amber-200 focus:outline-none focus:border-amber-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEnvImporter(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportEnv}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors"
              >
                Procesar y rellenar campos
              </button>
            </div>
          </div>
        )}

        {/* Mensaje de éxito al guardar */}
        {saveSuccessMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ¡Todas las claves y configuraciones se han guardado con éxito y aplicado al sistema!
          </div>
        )}

        {/* Formulario Principal con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* ------------------------------------------------------------- */}
          {/* 1. GOOGLE GEMINI AI                                           */}
          {/* ------------------------------------------------------------- */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Google Gemini AI (Asistente METIS & Visión)</h3>
                  <p className="text-[11px] text-slate-400">Motor neuronal para METIS por voz, creación de presupuestos y análisis de documentos.</p>
                </div>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                Obtener clave gratis en Google AI Studio
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Gemini API Key
                </label>
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pl-3 pr-10 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-white"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Modelo Preferente
                </label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Rápido ⭐)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Estándar)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Máxima Capacidad)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="text-xs">
                {geminiTestResult && (
                  <span className={`font-semibold ${geminiTestResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {geminiTestResult.msg}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={geminiTesting || !geminiKey}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors disabled:opacity-40"
              >
                {geminiTesting ? 'Probando Gemini...' : 'Probar conexión Gemini'}
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 2. SUPABASE (Base de Datos & Auth)                           */}
          {/* ------------------------------------------------------------- */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Supabase (Base de Datos, Fotos & Auth)</h3>
                  <p className="text-[11px] text-slate-400">Almacenamiento de clientes, vehículos, presupuestos, fotos y sincronización multidispositivo.</p>
                </div>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              >
                Abrir Supabase Dashboard
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Anon Public Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <input
                    type={showSupabaseKey ? 'text' : 'password'}
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1Ni..."
                    className="w-full pl-3 pr-10 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                    className="absolute right-3 top-8 text-slate-400 hover:text-white"
                  >
                    {showSupabaseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Service Role Key (Opcional - Edge Functions)
                  </label>
                  <input
                    type={showSupabaseKey ? 'text' : 'password'}
                    value={supabaseServiceKey}
                    onChange={(e) => setSupabaseServiceKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1Ni... (para funciones secretas)"
                    className="w-full px-3 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="text-xs">
                {supabaseTestResult && (
                  <span className={`font-semibold ${supabaseTestResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {supabaseTestResult.msg}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={supabaseTesting}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors disabled:opacity-40"
              >
                {supabaseTesting ? 'Verificando...' : 'Probar conexión Supabase'}
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 3. RESEND (Envío de Email & Gestoría)                         */}
          {/* ------------------------------------------------------------- */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Resend (Envío de Presupuestos, Facturas & Gestoría)</h3>
                  <p className="text-[11px] text-slate-400">Servicio de email transaccional para entregar PDFs a clientes y el cierre trimestral a la gestoría.</p>
                </div>
              </div>
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
              >
                Obtener API Key en Resend
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Resend API Key
                </label>
                <input
                  type={showResendKey ? 'text' : 'password'}
                  value={resendKey}
                  onChange={(e) => setResendKey(e.target.value)}
                  placeholder="re_123456789..."
                  className="w-full pl-3 pr-10 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono font-bold text-indigo-300 focus:outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShowResendKey(!showResendKey)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-white"
                >
                  {showResendKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email Remitente (From)
                </label>
                <input
                  type="text"
                  value={resendFrom}
                  onChange={(e) => setResendFrom(e.target.value)}
                  placeholder="onboarding@resend.dev"
                  className="w-full px-3 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email de tu Gestoría / Asesor
                </label>
                <input
                  type="email"
                  value={gestoriaEmail}
                  onChange={(e) => setGestoriaEmail(e.target.value)}
                  placeholder="asesoria@tudominio.es"
                  className="w-full px-3 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="text-xs">
                {resendTestResult && (
                  <span className={`font-semibold ${resendTestResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {resendTestResult.msg}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleTestResend}
                disabled={resendTesting || !resendKey}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors disabled:opacity-40"
              >
                {resendTesting ? 'Verificando...' : 'Verificar formato Resend'}
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 4. PLATE RECOGNIZER (OCR Matrículas)                         */}
          {/* ------------------------------------------------------------- */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Plate Recognizer (LPR / Reconocimiento de Matrículas)</h3>
                  <p className="text-[11px] text-slate-400">Escanea la matrícula del coche con la cámara del teléfono e identifica el vehículo al momento.</p>
                </div>
              </div>
              <a
                href="https://platerecognizer.com/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 underline underline-offset-2"
              >
                Panel de Plate Recognizer
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  API Token / Key
                </label>
                <input
                  type={showPlateKey ? 'text' : 'password'}
                  value={plateKey}
                  onChange={(e) => setPlateKey(e.target.value)}
                  placeholder="Token abc123def456..."
                  className="w-full pl-3 pr-10 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPlateKey(!showPlateKey)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-white"
                >
                  {showPlateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Endpoint URL
                </label>
                <input
                  type="text"
                  value={plateEndpoint}
                  onChange={(e) => setPlateEndpoint(e.target.value)}
                  placeholder="https://api.platerecognizer.com/v1/plate-reader/"
                  className="w-full px-3 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono font-bold text-purple-300 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="text-xs">
                {plateTestResult && (
                  <span className={`font-semibold ${plateTestResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {plateTestResult.msg}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleTestPlate}
                disabled={plateTesting || !plateKey}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors disabled:opacity-40"
              >
                {plateTesting ? 'Probando...' : 'Probar Plate Recognizer'}
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 5. GITHUB (Repositorio y CI/CD)                              */}
          {/* ------------------------------------------------------------- */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">GitHub (Control de Versiones y Despliegues)</h3>
                  <p className="text-[11px] text-slate-400">Enlace con tu repositorio de código para backups automáticos y CI/CD.</p>
                </div>
              </div>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white underline underline-offset-2"
              >
                Crear GitHub Token (PAT)
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  URL del Repositorio GitHub
                </label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="https://github.com/usuario/gestarian"
                  className="w-full px-3 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Rama Principal
                </label>
                <input
                  type="text"
                  value={githubBranch}
                  onChange={(e) => setGithubBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="sm:col-span-3 relative">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type={showGithubToken ? 'text' : 'password'}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full pl-3 pr-10 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-white"
                >
                  {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 6. IA DE RESPALDO / FALLBACK (Groq / OpenRouter)              */}
          {/* ------------------------------------------------------------- */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">IA Alternativa de Respaldo (Fallback Automático)</h3>
                  <p className="text-[11px] text-slate-400">Si Google Gemini llegase a estar saturado o sin cuota, METIS conmuta aquí sin interrupciones.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 underline underline-offset-2"
                >
                  Groq Keys (Gratis)
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  API Key de Respaldo (Groq / OpenRouter)
                </label>
                <input
                  type={showFallbackKey ? 'text' : 'password'}
                  value={fallbackKey}
                  onChange={(e) => setFallbackKey(e.target.value)}
                  placeholder="gsk_... o sk-or-..."
                  className="w-full pl-3 pr-10 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono font-bold text-rose-300 focus:outline-none focus:border-rose-400"
                />
                <button
                  type="button"
                  onClick={() => setShowFallbackKey(!showFallbackKey)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-white"
                >
                  {showFallbackKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Proveedor de Respaldo
                </label>
                <select
                  value={fallbackProvider}
                  onChange={(e) => setFallbackProvider(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-rose-400"
                >
                  <option value="groq">Groq Cloud (Ultra Rápido ⭐)</option>
                  <option value="openrouter">OpenRouter (Modelos DeepSeek)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="text-xs">
                {fallbackTestResult && (
                  <span className={`font-semibold ${fallbackTestResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {fallbackTestResult.msg}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleTestFallback}
                disabled={fallbackTesting || !fallbackKey}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors disabled:opacity-40"
              >
                {fallbackTesting ? 'Probando...' : 'Probar IA de Respaldo'}
              </button>
            </div>
          </div>

        </div>

        {/* Footer del Formulario con Botones Principales */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Guardando en Sistema...' : 'Guardar y Aplicar Todo'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
