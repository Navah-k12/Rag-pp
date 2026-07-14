import { useRef, useEffect, useState } from 'react'
import { Square, History, Upload, Bot } from 'lucide-react'
import ChatMessage from './ChatMessage'
import Quiz from './Quiz'
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
  messages, input, setInput, onSend, busy, docName, onUpload, onOpenHistory,
  model, setModel, availableModels,
  quizState, onQuizSubmit, onQuizRetry,
}) {
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  const doubtsRef = useRef(null)

  const [doubtMsgs, setDoubtMsgs] = useState([])
  const [doubtBusy, setDoubtBusy] = useState(false)

  useEffect(() => {
    chatRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, quizState])

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
      const data = await askQuestion(q, model)
      setDoubtMsgs(p => [...p, { id: Date.now() + Math.random(), timestamp: time(), role: 'ai', content: data.answer }])
    } catch (err) {
      setDoubtMsgs(p => [...p, { id: Date.now() + Math.random(), timestamp: time(), role: 'system', content: `✖ ${esc(err.message)}` }])
    }
    setDoubtBusy(false)
  }

  return (
    <div className="flex flex-col h-full w-full">
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
        <div className="flex-1" />
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 px-2 py-1 rounded border border-border/50 text-dim hover:text-green hover:border-green/40 transition-colors"
          title="Subir documento (PDF, PPTX, TXT, imágenes)"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="text-[11px] tracking-wide">Upload</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 border-r border-border/50">
          <div className="text-center text-[10px] text-dim uppercase tracking-widest py-1.5 border-b border-border/30 bg-surface/30 shrink-0">
            chat rag
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-1">
            {messages.length === 0 && !quizState ? (
              <div className="flex flex-col items-center justify-center h-full text-dim/50 text-xs space-y-3">
                <span className="text-2xl opacity-30">~</span>
                <span>Sube un documento para empezar</span>
                <button
                  onClick={onUpload}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border/60 hover:border-green/50 hover:text-green transition-colors text-dim"
                >
                  <Upload className="w-4 h-4" />
                  <span>Seleccionar archivo</span>
                </button>
                <span className="text-[10px]">o arrastra un PDF, PPTX, TXT o imagen aquí</span>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <ChatMessage key={m.id} msg={m} isLast={i === messages.length - 1 && !quizState} />
                ))}
                {quizState && (
                  <div className="animate-fade-in mb-3 pb-3 border-b border-border/40">
                    <Quiz
                      questions={quizState.questions}
                      results={quizState.results}
                      onSubmit={onQuizSubmit}
                      onRetry={onQuizRetry}
                    />
                  </div>
                )}
              </>
            )}
            {busy && (
              <div className="animate-fade-in text-dim text-[10px] italic">Procesando...</div>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 border-t border-border/50 bg-surface/50 shrink-0">
            {docName ? (
              <>
                <span className="text-[10px] text-dim">📄 {docName}</span>
                <div className="flex-1" />
                <button onClick={onUpload} className="text-[10px] text-dim hover:text-green transition-colors">
                  Cambiar
                </button>
              </>
            ) : (
              <>
                <span className="text-[10px] text-yellow/70">⚠ Sin documento</span>
                <div className="flex-1" />
                <button
                  onClick={onUpload}
                  className="flex items-center gap-1 text-[10px] text-yellow hover:text-green transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  Subir archivo
                </button>
              </>
            )}
          </div>

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
          </div>
        </div>

        <div className="w-56 shrink-0 flex flex-col bg-surface/20 overflow-y-auto p-3 gap-3">
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

          <div>
            <div className="flex items-center gap-1 text-[11px] text-dim font-medium mb-1.5">
              <Bot className="w-3 h-3" /> Modelo IA
            </div>
            <div className="space-y-1">
              {Object.entries(availableModels).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setModel(key)}
                  className={`w-full text-left px-2 py-1.5 rounded border text-[10px] transition-colors ${
                    model === key
                      ? 'border-green/50 bg-green/10 text-green-bright'
                      : 'border-border/30 text-dim hover:border-border/60 hover:text-text/70'
                  }`}
                >
                  <div className="font-medium">{info.name}</div>
                  <div className="text-[9px] opacity-60">{info.provider}</div>
                </button>
              ))}
            </div>
          </div>

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

      <div className="flex items-center justify-between px-3 py-1 bg-[#0a0e14] border-t border-border shrink-0 text-[10px] text-dim/70 select-none">
        <span>--- esc Interrupt</span>
        <span className="text-center">Tab switch agent &nbsp; ctrl+p commands</span>
        <span>~/OpenCode 1.0.343</span>
      </div>
    </div>
  )
}
