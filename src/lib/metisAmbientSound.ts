/**
 * Generador de Sonido Ambiental de Espera para METIS Conversación Bidireccional
 * Utiliza Web Audio API pura (sin necesidad de archivos externos ni descargas).
 * Genera una atmósfera sutil, agradable y futurista (estilo KITT / escáner relajante)
 * que acompaña la espera mientras el micrófono y el altavoz no están transmitiendo voz.
 */

class MetisAmbientSound {
  private ctx: AudioContext | null = null
  private osc1: OscillatorNode | null = null
  private osc2: OscillatorNode | null = null
  private lfo: OscillatorNode | null = null
  private filter: BiquadFilterNode | null = null
  private gainNode: GainNode | null = null
  private isPlaying: boolean = false
  private targetVolume: number = 0.045 // Volumen sutil y agradable para no molestar

  private init() {
    if (this.ctx && this.ctx.state !== 'closed') return

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return

    this.ctx = new AudioCtx()

    // Filtro paso-bajo cálido para eliminar frecuencias agudas agresivas
    this.filter = this.ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.setValueAtTime(320, this.ctx.currentTime)
    this.filter.Q.setValueAtTime(2.5, this.ctx.currentTime)

    // Control de ganancia principal con entrada en 0
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime)

    // Oscilador 1: Tono fundamental suave (110Hz - La2)
    this.osc1 = this.ctx.createOscillator()
    this.osc1.type = 'sine'
    this.osc1.frequency.setValueAtTime(110, this.ctx.currentTime)

    // Oscilador 2: Quinto armónico sutil con leve desafinación para sensación de espacio (165Hz)
    this.osc2 = this.ctx.createOscillator()
    this.osc2.type = 'triangle'
    this.osc2.frequency.setValueAtTime(165.2, this.ctx.currentTime)

    // LFO: Modulación sutil de frecuencia de corte (onda respiración lenta 0.25 Hz)
    this.lfo = this.ctx.createOscillator()
    this.lfo.frequency.setValueAtTime(0.28, this.ctx.currentTime)
    const lfoGain = this.ctx.createGain()
    lfoGain.gain.setValueAtTime(80, this.ctx.currentTime)

    this.lfo.connect(lfoGain)
    if (this.filter) {
      lfoGain.connect(this.filter.frequency)
    }

    // Conexiones
    this.osc1.connect(this.filter)
    this.osc2.connect(this.filter)
    this.filter.connect(this.gainNode)
    this.gainNode.connect(this.ctx.destination)

    this.osc1.start()
    this.osc2.start()
    this.lfo.start()
  }

  /**
   * Inicia o desmuta el sonido ambiental con un fade-in suave
   */
  public start() {
    try {
      this.init()
      if (!this.ctx || !this.gainNode) return

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }

      const now = this.ctx.currentTime
      this.gainNode.gain.cancelScheduledValues(now)
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now)
      this.gainNode.gain.linearRampToValueAtTime(this.targetVolume, now + 0.4)
      this.isPlaying = true
    } catch (e) {
      console.warn('Error iniciando sonido ambiental METIS:', e)
    }
  }

  /**
   * Pausa o atenúa el sonido ambiental con fade-out rápido (cuando habla el usuario o METIS)
   */
  public pause() {
    try {
      if (!this.ctx || !this.gainNode || !this.isPlaying) return

      const now = this.ctx.currentTime
      this.gainNode.gain.cancelScheduledValues(now)
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now)
      this.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.15)
    } catch (e) {
      console.warn('Error pausando sonido ambiental METIS:', e)
    }
  }

  /**
   * Detiene por completo y limpia los osciladores
   */
  public stop() {
    try {
      if (!this.ctx || !this.gainNode) return

      const now = this.ctx.currentTime
      this.gainNode.gain.cancelScheduledValues(now)
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now)
      this.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.1)

      setTimeout(() => {
        try {
          if (this.osc1) { this.osc1.stop(); this.osc1.disconnect(); this.osc1 = null }
          if (this.osc2) { this.osc2.stop(); this.osc2.disconnect(); this.osc2 = null }
          if (this.lfo) { this.lfo.stop(); this.lfo.disconnect(); this.lfo = null }
          if (this.ctx && this.ctx.state !== 'closed') {
            this.ctx.close().catch(() => {})
            this.ctx = null
          }
          this.isPlaying = false
        } catch (_) {}
      }, 150)
    } catch (e) {
      console.warn('Error deteniendo sonido ambiental METIS:', e)
    }
  }
}

export const metisAmbientSound = new MetisAmbientSound()
