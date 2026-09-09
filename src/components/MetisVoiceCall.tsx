import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Mic, Volume2, Loader2, Sparkles, PhoneOff } from 'lucide-react';
import { processMetisMessage } from '../lib/metisAiEngine';
import { transcribeAudio } from '../services/aiProviderService';
import { speakSpanish, stopSpanishSpeech } from '../services/voiceService';
import { metisAmbientSound } from '../lib/metisAmbientSound';

export const MetisVoiceCall: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [showModal, setShowModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Emitir evento global de estado de voz para sincronizar la línea de escáner KITT
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('metis-voice-status', {
      detail: { isActive, status, showModal }
    }));
  }, [isActive, status, showModal]);

  // Gestión inteligente del sonido ambiental durante la espera en la llamada
  useEffect(() => {
    if (isActive) {
      if (status === 'listening' || status === 'idle') {
        metisAmbientSound.start();
      } else {
        metisAmbientSound.pause();
      }
    } else {
      metisAmbientSound.stop();
    }
  }, [isActive, status]);

  const stopAudioTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, []);

  const stopCall = useCallback(() => {
    setIsActive(false);
    setStatus('idle');
    metisAmbientSound.stop();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    stopSpanishSpeech();
    stopAudioTracks();
  }, [stopAudioTracks]);

  useEffect(() => {
    return () => {
      stopCall();
    };
  }, [stopCall]);

  const processAudioBlob = async (blob: Blob) => {
    if (!isActiveRef.current) return;
    setStatus('processing');
    metisAmbientSound.pause();
    try {
      const transcript = await transcribeAudio(blob);
      if (!transcript || transcript.length < 2) {
        if (isActiveRef.current) startListening();
        return;
      }
      
      const promptBreve = transcript + " [INSTRUCCIÓN INVISIBLE: Eres METIS. Responde de forma muy directa y oral en 1 o 2 frases máximo.]";
      const response = await processMetisMessage(promptBreve);
      
      if (isActiveRef.current) {
        speakResponse(response.text);
      }
    } catch (e) {
      console.error("Error transcribiendo / procesando audio en MetisVoiceCall", e);
      if (isActiveRef.current) speakResponse("Ha habido un error de conexión al transcribir. Repítelo por favor.");
    }
  };

  const startListening = async () => {
    if (!isActiveRef.current) return;
    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;
      }

      const stream = streamRef.current;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        if (!isActiveRef.current) return;
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudioBlob(blob);
      };

      // VAD (Voice Activity Detection) simplificado para móviles
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyserRef.current = analyser;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 512;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let isSpeaking = false;
        
        vadIntervalRef.current = setInterval(() => {
          if (!isActiveRef.current || status !== 'listening') return;
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const avg = sum / dataArray.length;

          // Si el usuario habla, pausar sonido ambiental
          if (avg > 15) {
            isSpeaking = true;
            metisAmbientSound.pause();
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          } else {
            if (isSpeaking && !silenceTimerRef.current) {
              // 2.5 segundos de silencio tras hablar -> Cortar y enviar
              silenceTimerRef.current = setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                  mediaRecorderRef.current.stop();
                }
              }, 2500);
            } else if (!isSpeaking) {
              // En silencio de espera: reanudar sonido ambiental
              metisAmbientSound.start();
            }
          }
        }, 100);
      }

      mediaRecorder.start();
      setStatus('listening');
      metisAmbientSound.start();

    } catch (e: any) {
      console.error("Error accediendo al micrófono (MediaRecorder)", e);
      setStatus('idle');
      metisAmbientSound.stop();
      const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.protocol === 'https:';
      if (!isSecure) {
        alert('Para usar el micrófono en el móvil, el navegador requiere HTTPS (Contexto Seguro). Usa "npm run dev:mobile" (con HTTPS) o accede por https://');
      } else {
        alert('Permiso de micrófono denegado en el navegador móvil. Revisa los permisos de la página.');
      }
      stopCall();
    }
  };

  const speakResponse = (text: string) => {
    setStatus('speaking');
    metisAmbientSound.pause();

    const onTTSFinished = () => {
      if (isActiveRef.current) {
        setStatus('listening');
        setTimeout(() => startListening(), 300);
      }
    };

    speakSpanish(text, {
      rate: 1.05,
      pitch: 1.0,
      volume: 1.0,
      onEnd: onTTSFinished,
      onError: onTTSFinished
    });
  };

  const toggleCall = () => {
    if (isActive) {
      stopCall();
      setShowModal(false);
    } else {
      setIsActive(true);
      setShowModal(true);
      setStatus('listening');
      stopSpanishSpeech();
      setTimeout(() => startListening(), 100);
    }
  };

  return (
    <>
      {/* Botón estático sin animaciones continuas */}
      <button
        onClick={toggleCall}
        className={`w-16 h-16 rounded-full bg-transparent border flex items-center justify-center transition-all flex-shrink-0 relative group overflow-hidden ${
          isActive 
            ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9),inset_0_0_6px_rgba(239,68,68,0.6)]' 
            : 'border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]'
        }`}
        title="METIS Conversación Bidireccional"
        aria-label="METIS Conversación Bidireccional"
      >
        <div className="relative z-10 flex items-center justify-center w-full h-full bg-transparent">
          {isActive ? (
            <Radio className="w-7 h-7 text-red-500" strokeWidth={1.5} />
          ) : (
            <Radio className="w-7 h-7 text-[#d3d3d3] group-hover:text-white transition-colors" strokeWidth={1} />
          )}
        </div>

        {/* Indicador de estado activo estático */}
        {isActive && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
        )}
      </button>

      {/* Modal flotante al estilo llamada */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
            
            {/* Efectos de fondo */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors ${
                status === 'listening' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 
                status === 'speaking' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 
                status === 'processing' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 
                'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {status === 'listening' ? <Mic className="w-12 h-12 text-red-400" /> : 
                 status === 'speaking' ? <Volume2 className="w-12 h-12 text-emerald-400" /> :
                 status === 'processing' ? <Loader2 className="w-12 h-12 text-amber-400 animate-spin" /> :
                 <Sparkles className="w-12 h-12" />}
              </div>

              <h3 className="text-2xl font-black text-white mb-2">METIS AI</h3>
              
              <p className="text-slate-400 font-medium mb-12 h-6 flex items-center justify-center text-center text-sm">
                {status === 'listening' ? 'Escuchando al taller (K.I.T.T. Activo)...' : 
                 status === 'speaking' ? 'METIS está hablando...' : 
                 status === 'processing' ? 'Procesando consulta...' : 
                 'Conectando...'}
              </p>

              <button 
                onClick={toggleCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30 transition-all active:scale-95"
                title="Finalizar llamada"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
