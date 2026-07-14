import { Bot, GraduationCap, Info } from 'lucide-react'

export default function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  const isAi = msg.role === 'ai'

  if (!isUser && !isAi) {
    // system note
    return (
      <div className="animate-fade-in flex items-start gap-2 rounded-lg border border-line bg-panel-2/60 px-3 py-2 text-[12px] text-sub">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
        <div className="min-w-0 flex-1">
          <span dangerouslySetInnerHTML={{ __html: msg.content }} />
          <span className="ml-2 font-mono text-[10px] text-sub/60">{msg.timestamp}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`animate-fade-in flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${
          isUser
            ? 'bg-brand text-white'
            : 'bg-accent-soft text-accent ring-1 ring-accent/30'
        }`}
        aria-hidden="true"
      >
        {isUser ? <GraduationCap className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`flex min-w-0 max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="mb-1 flex items-center gap-2 text-[11px] text-sub">
          <span className="font-semibold text-ink">{isUser ? 'Tú' : 'StudyRag AI'}</span>
          <span className="font-mono text-[10px]">{msg.timestamp}</span>
        </div>
        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-tr-sm bg-brand text-white'
              : 'rounded-tl-sm border border-line bg-panel text-ink'
          }`}
          dangerouslySetInnerHTML={{ __html: msg.content }}
        />
      </div>
    </div>
  )
}
