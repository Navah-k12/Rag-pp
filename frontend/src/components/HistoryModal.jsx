import { Plus, X, History, StickyNote, HelpCircle } from 'lucide-react'
import SessionCard from './SessionCard.jsx'

const SAMPLE_SESSIONS = [
  { id: '#RAG-0942', topic: 'Optimización de consultas SQL', duration: 15, status: 'completed' },
  { id: '#RAG-0941', topic: 'Arquitectura de microservicios', duration: 23, status: 'completed' },
  { id: '#RAG-0940', topic: 'Configuración de ChromaDB', duration: 12, status: 'completed' },
  { id: '#RAG-0939', topic: 'Pipeline de embeddings', duration: 18, status: 'completed' },
  { id: '#RAG-0938', topic: 'Despliegue con Docker', duration: 30, status: 'archived' },
  { id: '#RAG-0937', topic: 'Autenticación con JWT', duration: 20, status: 'archived' },
]

const NOTES = [
  'Repasar el pipeline de embeddings antes del examen.',
  'ChromaDB: revisar configuración de persistencia.',
  'Dudas sobre chunking de documentos largos.',
  'Comparar coste de modelos de embedding.',
]

const DOUBTS = [
  '¿Cómo se calcula la similitud coseno?',
  '¿Cuándo conviene reindexar?',
  '¿Qué tamaño de chunk es óptimo?',
]

export default function HistoryModal({ onClose, onNewChat }) {
  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[620px] max-h-[92vh] w-[900px] max-w-[96vw] flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-line bg-panel-2 px-5 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <History className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-ink">Historial de estudio</div>
            <div className="text-[11px] text-sub">Tus sesiones anteriores con StudyRag</div>
          </div>
          <button
            onClick={() => {
              onNewChat()
              onClose()
            }}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Nueva sesión
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sub transition-colors hover:bg-panel hover:text-ink"
            aria-label="Cerrar historial"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* body */}
        <div className="flex flex-1 overflow-hidden">
          {/* notes */}
          <aside className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r border-line bg-panel-2/40 p-4 md:flex">
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-sub">
              <StickyNote className="h-3.5 w-3.5 text-accent" /> Notas recientes
            </div>
            <ul className="space-y-2.5">
              {NOTES.map((n, i) => (
                <li
                  key={i}
                  className="rounded-lg border-l-2 border-accent bg-panel px-2.5 py-2 text-[12px] leading-snug text-ink/80"
                >
                  {n}
                </li>
              ))}
            </ul>
          </aside>

          {/* sessions */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-sub">
              Sesiones de chat
            </div>
            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              {SAMPLE_SESSIONS.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          </div>

          {/* doubts */}
          <aside className="hidden w-56 shrink-0 flex-col overflow-y-auto border-l border-line bg-panel-2/40 p-4 lg:flex">
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-sub">
              <HelpCircle className="h-3.5 w-3.5 text-brand" /> Dudas pendientes
            </div>
            <ul className="space-y-2.5">
              {DOUBTS.map((d, i) => (
                <li
                  key={i}
                  className="rounded-lg bg-brand-soft px-2.5 py-2 text-[12px] leading-snug text-ink/80"
                >
                  {d}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}
