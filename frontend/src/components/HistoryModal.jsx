import { X, Terminal, Square } from 'lucide-react'
import SessionCard from './SessionCard'

const SAMPLE_SESSIONS = [
  { id: '#RAG_0942', topic: 'Optimización de consultas SQL', duration: 15, status: 'completed' },
  { id: '#RAG_0941', topic: 'Arquitectura de microservicios', duration: 23, status: 'completed' },
  { id: '#RAG_0940', topic: 'Configuración de ChromaDB', duration: 12, status: 'completed' },
  { id: '#RAG_0939', topic: 'Pipeline de embeddings', duration: 18, status: 'completed' },
  { id: '#RAG_0938', topic: 'Despliegue con Docker', duration: 30, status: 'archived' },
  { id: '#RAG_0937', topic: 'Autenticación JWT', duration: 20, status: 'archived' },
]

export default function HistoryModal({ onClose, onNewChat }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-[800px] max-w-[95vw] h-[600px] max-h-[90vh] bg-bg border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-border shrink-0">
          <Square className="w-4 h-4 text-dim" />
          <span className="text-[12px] text-dim tracking-wide flex-1">Terminal Chat History Log</span>
          <button onClick={onClose} className="text-dim hover:text-text transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* nav */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-surface/40 shrink-0">
          <Terminal className="w-4 h-4 text-green" />
          <span className="text-[13px] text-text font-medium">StudyRag</span>
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="ml-auto text-[11px] text-green hover:text-green-bright transition-colors"
          >
            + Nuevo Chat
          </button>
        </div>

        {/* three columns */}
        <div className="flex flex-1 overflow-hidden">
          {/* left: NOTAS RECIENTES */}
          <div className="w-1/5 min-w-0 border-r border-border/50 p-4 overflow-y-auto">
            <div className="text-[10px] text-dim uppercase tracking-widest mb-3 text-center">NOTAS RECIENTES</div>
            <div className="space-y-2 blur-content select-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-3 bg-dim/10 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
              ))}
            </div>
          </div>

          {/* center: HISTORIAL DE CHATS */}
          <div className="flex-1 min-w-0 p-4 overflow-y-auto">
            <div className="text-[10px] text-dim uppercase tracking-widest mb-3 text-center">HISTORIAL DE CHATS</div>
            <div className="space-y-2 pr-1">
              {SAMPLE_SESSIONS.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          </div>

          {/* right: DUDAS PENDIENTES */}
          <div className="w-1/5 min-w-0 border-l border-border/50 p-4 overflow-y-auto">
            <div className="text-[10px] text-dim uppercase tracking-widest mb-3 text-center">DUDAS PENDIENTES</div>
            <div className="space-y-3 blur-content select-none">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-2.5 bg-dim/10 rounded w-full" />
                  <div className="h-2.5 bg-dim/10 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
