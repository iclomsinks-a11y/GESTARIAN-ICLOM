import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Inbox, Calendar, FileText, CheckCircle2, Clock,
  ArrowRight, Phone, Mail, Car, AlertCircle, RefreshCw, Eye
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../lib/ToastContext'

interface SolicitudPresupuesto {
  id: string
  numero?: string
  cliente_id?: string
  vehiculo_id?: string
  cliente_nombre?: string
  cliente_telefono?: string
  cliente_email?: string
  vehiculo_matricula?: string
  vehiculo_modelo?: string
  descripcion?: string
  observaciones?: string
  total?: number
  estado?: string
  fecha?: string
  created_at?: string
  fotos?: string[]
}

interface SolicitudCita {
  id: string
  cliente_id?: string
  vehiculo_id?: string
  cliente_nombre?: string
  cliente_telefono?: string
  vehiculo_matricula?: string
  fecha: string
  hora?: string
  motivo?: string
  estado?: string
  created_at?: string
}

export function SolicitudesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [filterType, setFilterType] = useState<'todas' | 'presupuestos' | 'citas'>('todas')
  const [loading, setLoading] = useState(true)
  const [solicitudesPresupuestos, setSolicitudesPresupuestos] = useState<SolicitudPresupuesto[]>([])
  const [solicitudesCitas, setSolicitudesCitas] = useState<SolicitudCita[]>([])
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  const cargarSolicitudes = async () => {
    setLoading(true)
    try {
      // 1. Presupuestos solicitados (estado 'solicitado', 'pendiente' con [SOLICITUD CLIENTE])
      const { data: pData, error: pErr } = await supabase
        .from('presupuestos')
        .select(`
          id, numero, cliente_id, vehiculo_id, total, estado, fecha, observaciones, descripcion, created_at,
          clientes:cliente_id (nombre, telefono, email),
          vehiculos:vehiculo_id (matricula, marca, modelo)
        `)
        .order('created_at', { ascending: false })
        .limit(40)

      if (!pErr && pData) {
        // Filtrar aquellos que provienen de solicitudes del cliente o están en estado inicial
        const filtrados: SolicitudPresupuesto[] = pData
          .filter((p: any) => 
            p.estado === 'solicitado' || 
            p.estado === 'pendiente' || 
            (p.observaciones && p.observaciones.includes('[SOLICITUD CLIENTE]'))
          )
          .map((p: any) => ({
            id: p.id,
            numero: p.numero,
            cliente_id: p.cliente_id,
            vehiculo_id: p.vehiculo_id,
            cliente_nombre: p.clientes?.nombre || 'Cliente web',
            cliente_telefono: p.clientes?.telefono || '',
            cliente_email: p.clientes?.email || '',
            vehiculo_matricula: p.vehiculos?.matricula || '',
            vehiculo_modelo: `${p.vehiculos?.marca || ''} ${p.vehiculos?.modelo || ''}`.trim(),
            descripcion: p.descripcion || '',
            observaciones: p.observaciones || '',
            total: p.total || 0,
            estado: p.estado || 'pendiente',
            fecha: p.fecha || p.created_at,
            created_at: p.created_at
          }))
        setSolicitudesPresupuestos(filtrados)
      }

      // 2. Citas solicitadas
      const { data: cData, error: cErr } = await supabase
        .from('citas')
        .select(`
          id, cliente_id, vehiculo_id, fecha, hora, motivo, estado, created_at,
          clientes:cliente_id (nombre, telefono),
          vehiculos:vehiculo_id (matricula)
        `)
        .order('fecha', { ascending: true })
        .limit(40)

      if (!cErr && cData) {
        const filtradas: SolicitudCita[] = cData
          .filter((c: any) => c.estado === 'solicitada' || c.estado === 'pendiente')
          .map((c: any) => ({
            id: c.id,
            cliente_id: c.cliente_id,
            vehiculo_id: c.vehiculo_id,
            cliente_nombre: c.clientes?.nombre || 'Cliente web',
            cliente_telefono: c.clientes?.telefono || '',
            vehiculo_matricula: c.vehiculos?.matricula || '',
            fecha: c.fecha,
            hora: c.hora,
            motivo: c.motivo || 'Revisión / Reparación',
            estado: c.estado || 'solicitada',
            created_at: c.created_at
          }))
        setSolicitudesCitas(filtradas)
      }
    } catch (err: any) {
      console.error('Error cargando solicitudes:', err)
      showToast('Error cargando bandeja de solicitudes', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarSolicitudes()
  }, [])

  const totalSolicitudes = solicitudesPresupuestos.length + solicitudesCitas.length

  const handleConfirmarCita = async (citaId: string) => {
    try {
      const { error } = await supabase
        .from('citas')
        .update({ estado: 'confirmada' })
        .eq('id', citaId)

      if (error) throw error
      showToast('Cita confirmada correctamente', 'success')
      cargarSolicitudes()
    } catch (err: any) {
      showToast('Error al confirmar cita: ' + err.message, 'error')
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600/30 border border-violet-500/50 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              SOLICITUDES
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                {totalSolicitudes} pendientes
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Peticiones de presupuesto y citas enviadas por clientes desde el portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cargarSolicitudes}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setFilterType('todas')}
          className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all ${
            filterType === 'todas'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          TODAS ({totalSolicitudes})
        </button>
        <button
          onClick={() => setFilterType('presupuestos')}
          className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all ${
            filterType === 'presupuestos'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          PRESUPUESTOS ({solicitudesPresupuestos.length})
        </button>
        <button
          onClick={() => setFilterType('citas')}
          className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all ${
            filterType === 'citas'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          CITAS ({solicitudesCitas.length})
        </button>
      </div>

      {/* Lista de Solicitudes */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-violet-400" />
          <span>Cargando solicitudes recibidas...</span>
        </div>
      ) : totalSolicitudes === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-white/5 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-white">Bandeja al día</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No hay solicitudes de presupuesto ni citas pendientes de respuesta por parte del taller.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Presupuestos */}
          {(filterType === 'todas' || filterType === 'presupuestos') && solicitudesPresupuestos.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-500/60 transition-all shadow-lg space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Solicitud de Presupuesto
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {item.numero || `#${item.id.slice(0, 8)}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('es-ES') : 'Reciente'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Cliente</span>
                  <p className="text-base font-bold text-white">{item.cliente_nombre}</p>
                  {item.cliente_telefono && (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      <a href={`tel:${item.cliente_telefono}`} className="hover:underline">{item.cliente_telefono}</a>
                    </div>
                  )}
                  {item.cliente_email && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{item.cliente_email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Vehículo</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Car className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-white font-mono">{item.vehiculo_matricula || 'Sin matrícula'}</p>
                      <p className="text-xs text-slate-400">{item.vehiculo_modelo || 'Modelo N/D'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Detalle / Notas</span>
                  <p className="text-xs text-slate-300 line-clamp-3 bg-black/30 p-2 rounded-lg border border-white/5 mt-1 font-mono">
                    {item.observaciones || item.descripcion || 'Sin descripción adicional'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-2 border-t border-white/5">
                <button
                  onClick={() => navigate('/presupuestos', { state: { presupuestoId: item.id } })}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>CONFECCIONAR PRESUPUESTO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Citas */}
          {(filterType === 'todas' || filterType === 'citas') && solicitudesCitas.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-lg space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Solicitud de Cita
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Propuesta: {item.fecha} {item.hora ? `a las ${item.hora} h` : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Cliente</span>
                  <p className="text-base font-bold text-white">{item.cliente_nombre}</p>
                  {item.cliente_telefono && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      <a href={`tel:${item.cliente_telefono}`} className="hover:underline">{item.cliente_telefono}</a>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Vehículo</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Car className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-sm font-black text-white font-mono">{item.vehiculo_matricula || 'Sin matrícula'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Motivo de la Cita</span>
                  <p className="text-xs text-slate-300 bg-black/30 p-2 rounded-lg border border-white/5 mt-1 font-mono">
                    {item.motivo}
                  </p>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-2 border-t border-white/5">
                <button
                  onClick={() => navigate('/citas')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Ver en Calendario
                </button>
                <button
                  onClick={() => handleConfirmarCita(item.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONFIRMAR CITA</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
