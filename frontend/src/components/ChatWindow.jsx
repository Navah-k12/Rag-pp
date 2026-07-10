import { useRef, useEffect, useState, useCallback } from 'react'
import { Square, History } from 'lucide-react'
import ChatMessage from './ChatMessage'
import { askQuestion } from '../api'

function esc(s) {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

function time() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function ChatWindow({
  messages, input, setInput, onSend, busy, docName, onUpload, onOpenHistory
}) {
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const doubtsRef = useRef(null)

  // Quick Doubts: independent from main chat
  const [doubtMsgs, setDoubtMsgs] = useState([])
  const [doubtBusy, setDoubtBusy] = useState(false)

  useEffect(() => {
    chatRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    doubtsRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' })
  }, [doubtMsgs])

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
    if ((e.key === 'c' || e.key === 'C') && e.ctrlKey) setInput('')
  }

  async function handleDoubtSend(inputEl) {
    const q = inputEl.value.trim()
    if (!q || doubtBusy) return
    inputEl.value = ''
    setDoubtBusy(true)
    const id = Date.now() + Math.random()
    setDoubtMsgs(p => [...p, { id, timestamp: time(), role: 'user', content: esc(q) }])
    try {
      const data = await askQuestion(q)
      setDoubtMsgs(p => [...p, { id: Date.now() + Math.random(), timestamp: time(), role: 'ai', content: data.answer }])
    } catch (err) {
      setDoubtMsgs(p => [...p, { id: Date.now() + Math.random(), timestamp: time(), role: 'system', content: `✖ ${esc(err.message)}` }])
    }
    setDoubtBusy(false)
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* window header with history button */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface border-b border-border shrink-0 select-none">
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 text-dim hover:text-text transition-colors"
          title="Historial de chats"
        >
          <History className="w-3.5 h-3.5" />
          <Square className="w-3 h-3 text-dim" />
          <span className="text-[11px] tracking-wide">Terminal RAG Chat Interface</span>
        </button>
      </div>

      {/* content: chat + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* chat area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border/50">
          <div className="text-center text-[10px] text-dim uppercase tracking-widest py-1.5 border-b border-border/30 bg-surface/30 shrink-0">
            chat rag
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-dim/50 text-xs space-y-2">
                <span className="text-2xl opacity-30">~</span>
                <span>Sube un documento para empezar</span>
                <span className="text-[10px]">Arrastra un archivo o haz clic en el botón de subir</span>
              </div>
            ) : (
              messages.map((m, i) => (
                <ChatMessage key={m.id} msg={m} isLast={i === messages.length - 1} />
              ))
            )}
            {busy && (
              <div className="animate-fade-in text-dim text-[10px] italic">Procesando...</div>
            )}
          </div>

          {/* input line */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border bg-surface shrink-0">
            <span className="text-green font-bold text-sm">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={docName ? 'Escribe tu pregunta...' : 'Sube un documento primero...'}
              disabled={busy}
              className="flex-1 bg-transparent border-none outline-none text-[12px] text-text font-mono placeholder:text-dim/30 caret-green"
              autoFocus
            />
            <span className="w-2 h-4 bg-green/70 animate-blink" />
          </div>
        </div>

        {/* right sidebar */}
        <div className="w-56 shrink-0 flex flex-col bg-surface/20 overflow-y-auto p-3 gap-3">
          {/* Quick Doubts - independent chat */}
          <div>
            <div className="flex items-center gap-1 text-[11px] text-dim font-medium mb-1.5">
              <span className="text-green">▼</span> Quick Doubts
            </div>
            <div
              ref={doubtsRef}
              className="border border-dashed border-border/50 rounded-lg max-h-32 overflow-y-auto p-2 space-y-1.5 text-[10px]"
            >
              {doubtMsgs.length === 0 ? (
                <span className="text-dim/30">Sin dudas pendientes</span>
              ) : (
                doubtMsgs.map((m) => (
                  <div key={m.id} className="animate-fade-in">
                    <span className={m.role === 'user' ? 'text-green-bright' : m.role === 'ai' ? 'text-purple-bright' : 'text-dim'}>
                      <span className="text-dim">[{m.timestamp}]</span> {m.role === 'user' ? 'Tú:' : m.role === 'ai' ? 'AI:' : ''}
                    </span>
                    <span className="text-text/80" dangerouslySetInnerHTML={{ __html: m.content }} />
                  </div>
                ))
              )}
              {doubtBusy && <span className="text-dim italic">Pensando...</span>}
            </div>
          </div>

          {/* Quick Question */}
          <div>
            <div className="text-[11px] text-dim font-medium mb-1.5">Quick question...</div>
            <div className="flex items-center gap-1">
              <span className="text-green text-xs">&gt;</span>
              <input
                type="text"
                placeholder="Pregunta rápida..."
                onKeyDown={e => {
                  if (e.key === 'Enter') handleDoubtSend(e.target)
                }}
                disabled={doubtBusy}
                className="flex-1 bg-transparent border-none outline-none text-[11px] text-text font-mono placeholder:text-dim/20 caret-green"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-1 text-[11px] text-dim font-medium mb-1.5">
              <span className="text-green">▼</span> Notas
            </div>
            <div className="text-[11px] text-green/70 leading-relaxed space-y-1">
              <p>Reminder: Update embeddings library.</p>
              <p>Check logs for errors.</p>
              <p>Review recent commits.</p>
            </div>
          </div>
        </div>
      </div>

      {/* status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#0a0e14] border-t border-border shrink-0 text-[10px] text-dim/70 select-none">
        <span>--- esc Interrupt</span>
        <span className="text-center">Tab switch agent &nbsp; ctrl+p commands</span>
        <span>~/OpenCode 1.0.343</span>
      </div>
    </div>
  )
}
