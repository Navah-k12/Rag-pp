export default function ChatMessage({ msg, isLast }) {
  const statusColor = msg.role === 'user' ? 'text-green-bright' : 'text-purple-bright'
  const statusBadge = msg.role === 'user'
    ? '<span class="text-purple border border-purple/30 rounded px-1.5 py-0.5 text-[10px] ml-2">[QUEUED]</span>'
    : ''

  return (
    <div className="animate-fade-in mb-3 pb-3 border-b border-border/40 last:border-b-0">
      <div className="flex items-start gap-2">
        <span className={`shrink-0 text-xs ${statusColor} font-medium`}>
          [{msg.timestamp}]
        </span>
        <span className={`text-xs font-semibold ${statusColor}`}>
          {msg.role === 'user' ? 'User:' : 'AI:'}
        </span>
        <span
          className="text-xs text-text/90 leading-relaxed whitespace-pre-wrap break-words flex-1"
          dangerouslySetInnerHTML={{ __html: msg.content }}
        />
        {msg.role === 'user' && (
          <span dangerouslySetInnerHTML={{ __html: statusBadge }} />
        )}
      </div>
    </div>
  )
}
