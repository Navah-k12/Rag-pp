export default function SessionCard({ session }) {
  const isArchived = session.status === 'archived'
  const badgeColor = isArchived ? 'text-purple-bright border-purple-bright/30' : 'text-green border-green/30'
  const badgeText = isArchived ? '[ARCHIVED]' : '[COMPLETED]'

  return (
    <div className="border border-border rounded-lg p-3 bg-[#0d1117]/60 hover:border-dim/50 transition-colors">
      <div className="text-xs text-text font-medium leading-relaxed">
        <span className="text-dim">[SESSION ID: {session.id}]</span> TEMA: "{session.topic}"
      </div>
      <div className="text-[11px] text-dim mt-1">
        | DURACIÓN: {session.duration} min
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className={`text-[10px] border rounded px-1.5 py-0.5 ${badgeColor}`}>
          {badgeText}
        </span>
        <button className="text-[11px] text-green hover:text-green-bright transition-colors">[Ver]</button>
        <button className="text-[11px] text-green hover:text-green-bright transition-colors">[Exportar]</button>
      </div>
    </div>
  )
}
