import { Clock, Download, Eye, BookOpen } from 'lucide-react'

export default function SessionCard({ session }) {
  const isArchived = session.status === 'archived'
  const badge = isArchived
    ? 'text-accent bg-accent-soft ring-accent/30'
    : 'text-good bg-good/10 ring-good/30'
  const badgeText = isArchived ? 'Archivado' : 'Completado'

  return (
    <div className="group rounded-xl border border-line bg-panel p-3.5 transition-all hover:border-brand/50 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-mono text-[11px] text-sub">{session.id}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${badge}`}
            >
              {badgeText}
            </span>
          </div>
          <div className="mt-0.5 truncate text-[13px] font-semibold leading-snug text-ink">
            {session.topic}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
        <span className="flex items-center gap-1.5 text-[11px] text-sub">
          <Clock className="h-3.5 w-3.5" />
          {session.duration} min de estudio
        </span>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-brand transition-colors hover:bg-brand-soft">
            <Eye className="h-3.5 w-3.5" /> Ver
          </button>
          <button className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-sub transition-colors hover:bg-panel-2 hover:text-ink">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
        </div>
      </div>
    </div>
  )
}
