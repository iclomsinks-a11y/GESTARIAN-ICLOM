import React, { useState, useEffect } from 'react'
import { Key, X, Save, Check, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ApiKeysConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

export const ApiKeysConfigModal: React.FC<ApiKeysConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  // Claves y Modelos (Cada uno: Línea 1 = Modelo, Línea 2 = Clave)
  const [geminiKey, setGeminiKey] = useState('')
  const [plateKey, setPlateKey] = useState('')
  const [resendKey, setResendKey] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [webDomain, setWebDomain] = useState('https://www.gestarian.com')
  const [firebaseToken, setFirebaseToken] = useState('')
  const [githubToken, setGithubToken] = useState('')

  // Control visibilidad contraseñas
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Cargar valores iniciales desde localStorage y Supabase
  useEffect(() => {
    if (!isOpen) return

    setGeminiKey(localStorage.getItem('gestarian_gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '')
    setPlateKey(localStorage.getItem('gestarian_plate_recognizer_key') || (import.meta as any).env?.VITE_PLATE_RECOGNIZER_KEY || '')
    setResendKey(localStorage.getItem('gestarian_resend_api_key') || (import.meta as any).env?.RESEND_API_KEY || '')
    setSupabaseKey(localStorage.getItem('gestarian_supabase_anon_key') || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '')
    setWebDomain(localStorage.getItem('gestarian_web_domain') || 'https://www.gestarian.com')
    setFirebaseToken(localStorage.getItem('gestarian_firebase_token') || '')
    setGithubToken(localStorage.getItem('gestarian_github_token') || '')

    // Eliminar configuración de Fallback de localStorage
    localStorage.removeItem('gestarian_fallback_api_key')
    localStorage.removeItem('gestarian_fallback_ai_config')

    supabase.from('configuracion').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) {
        if (data.ai_api_key && !localStorage.getItem('gestarian_gemini_api_key')) setGeminiKey(data.ai_api_key)
        if (data.resend_api_key && !localStorage.getItem('gestarian_resend_api_key')) setResendKey(data.resend_api_key)
      }
    })
  }, [isOpen])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 1. Guardar en localStorage
      localStorage.setItem('gestarian_gemini_api_key', geminiKey.trim())
      localStorage.setItem('gestarian_plate_recognizer_key', plateKey.trim())
      localStorage.setItem('gestarian_resend_api_key', resendKey.trim())
      localStorage.setItem('gestarian_supabase_anon_key', supabaseKey.trim())
      
      const cleanDomain = (webDomain.trim() || 'https://www.gestarian.com').replace(/\/$/, '')
      localStorage.setItem('gestarian_web_domain', cleanDomain)
      localStorage.setItem('gestarian_firebase_token', firebaseToken.trim())
      localStorage.setItem('gestarian_github_token', githubToken.trim())

      // Eliminar Fallback permanentemente
      localStorage.removeItem('gestarian_fallback_api_key')
      localStorage.removeItem('gestarian_fallback_ai_config')

      // 2. Persistir en la tabla configuracion de Supabase
      await supabase.from('configuracion').update({
        ai_api_key: geminiKey.trim() || null,
        resend_api_key: resendKey.trim() || null,
        updated_at: new Date().toISOString()
      }).eq('id', 1)

      setSavedSuccess(true)
      setTimeout(() => {
        setSavedSuccess(false)
        if (onSaved) onSaved()
        onClose()
      }, 900)
    } catch (e) {
      console.error('Error guardando claves:', e)
      alert('Se guardaron las claves localmente.')
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  // Lista estricta: Cada modelo consta SOLO de dos líneas (1. Modelo, 2. Clave)
  const modelosConfig = [
    {
      id: 'gemini',
      modelo: 'Google Gemini (IA Asistente & Metis)',
      valor: geminiKey,
      setter: setGeminiKey,
      placeholder: 'AIzaSy...'
    },
    {
      id: 'plate',
      modelo: 'Plate Recognizer (OCR Matrículas)',
      valor: plateKey,
      setter: setPlateKey,
      placeholder: 'Token Plate Recognizer'
    },
    {
      id: 'resend',
      modelo: 'Resend (Envío de Email Transaccional)',
      valor: resendKey,
      setter: setResendKey,
      placeholder: 're_...'
    },
    {
      id: 'supabase',
      modelo: 'Supabase (Base de Datos y Almacenamiento)',
      valor: supabaseKey,
      setter: setSupabaseKey,
      placeholder: 'eyJhbGciOi...'
    },
    {
      id: 'web_domain',
      modelo: 'Dominio Web Gestarian (Enlaces Email y WhatsApp)',
      valor: webDomain,
      setter: setWebDomain,
      placeholder: 'https://www.gestarian.com'
    },
    {
      id: 'firebase',
      modelo: 'Firebase Token / Clave Web (gestarian.com)',
      valor: firebaseToken,
      setter: setFirebaseToken,
      placeholder: 'Token de Firebase para www.gestarian.com'
    },
    {
      id: 'github',
      modelo: 'GitHub (Token de Acceso y Despliegue)',
      valor: githubToken,
      setter: setGithubToken,
      placeholder: 'ghp_...'
    }
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-950/95 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] rounded-3xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-500/20 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Modelos y Claves API</h3>
              <p className="text-xs text-slate-400">Configuración directa de conexión por modelo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Modelos (Solo 2 líneas por modelo: Modelo arriba, Clave abajo) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {modelosConfig.map((item) => {
            const isPasswordType = item.id !== 'web_domain'
            const isVisible = showKeys[item.id] ?? !isPasswordType
            return (
              <div key={item.id} className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                {/* LÍNEA 1: EL MODELO */}
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wide block truncate">
                  {item.modelo}
                </label>

                {/* LÍNEA 2: LA CLAVE */}
                <div className="relative">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={item.valor}
                    onChange={(e) => item.setter(e.target.value)}
                    placeholder={item.placeholder}
                    className="w-full pl-3 pr-10 py-2.5 bg-black/60 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                  {isPasswordType && (
                    <button
                      type="button"
                      onClick={() => toggleShowKey(item.id)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                      title={isVisible ? 'Ocultar' : 'Mostrar'}
                    >
                      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Pie con un solo botón de Guardar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Guardado</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Claves'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
