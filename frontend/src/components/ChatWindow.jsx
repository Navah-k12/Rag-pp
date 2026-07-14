import { useEffect, useRef, useState } from 'react'
import {
  FileText,
  History,
  Upload,
  Moon,
  Sun,
  Send,
  Sparkles,
  Lightbulb,
  StickyNote,
  GraduationCap,
} from 'lucide-react'
import ChatMessage from './ChatMessage.jsx'
import { askQuestion } from '../api.js'

function esc(s) {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

function time() {
  return new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const COMMANDS = [
  { cmd: ':summary', label: 'Resumen', icon: FileText },
  { cmd: ':flashcards', label: 'Flashcards', icon: Sparkles },
  { cmd: ':quiz', label: 'Examen', icon: GraduationCap },
]

export default function ChatWindow({
  messages,
  input,
  setInput,
  onSend,
  busy,
  docName,
  onUpload,
  onOpenHistory,
  onCommand,
  theme,
  onToggleTheme,
}) {
  const chatRef = useRef(null)
  const doubtsRef = useRef(null)

  const [doubtMsgs, setDoubtMsgs] = useState([])
  const [doubtBusy, setDoubtBusy] = useState(false)
  const [doubtInput, setDoubtInput] = useState('')

  useEffect(() => {
    chatRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  useEffect(() => {
    doubtsRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' })
  }, [doubtMsgs])

  function handleKey(e) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  async function handleDoubtSend() {
    const q = doubtInput.trim()
    if (!q || doubtBusy) return
    setDoubtInput('')
    setDoubtBusy(true)
    setDoubtMsgs((p) => [...p, { id: Date.now() + Math.random(), timestamp: time(), role: 'user', content: esc(q) }])
    try {
      const data = await askQuestion(q)
      setDoubtMsgs((p) => [...p, { id: Date.now() + Math.random(), timestamp: time(), role: 'ai', content: data.answer }])
    } catch (err) {
      setDoubtMsgs((p) => [...p, { id: Date.now() + Math.random(), timestamp: time(), role: 'system', content: esc(err.message) }])
    }
    setDoubtBusy(false)
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-line bg-panel px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[15px] font-extrabold leading-none text-ink">
            StudyRag
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
              RAG
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-sub">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
            </span>
            Asistente de estudio con IA
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onUpload}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-brand/50 hover:text-brand"
            title="Subir documento"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Subir</span>
          </button>
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-brand/50 hover:text-brand"
            title="Historial"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historial</span>
          </button>
          <button
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel text-ink transition-colors hover:border-accent/60 hover:text-accent"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>

      {/* body */}
      <div className="flex flex-1 overflow-hidden">
        {/* chat column */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* doc bar */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line bg-panel-2/50 px-4 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-sub">
              Conversación
            </span>
            {docName ? (
              <span className="flex max-w-[60%] items-center gap-1.5 truncate rounded-full bg-good/10 px-2.5 py-1 text-[11px] font-medium text-good">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{docName}</span>
              </span>
            ) : (
              <span className="text-[11px] text-sub/70">Sin documento</span>
            )}
          </div>

          {/* messages */}
          <div ref={chatRef} className="bg-grid flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div className="text-[15px] font-bold text-ink">Empieza a estudiar</div>
                <p className="max-w-xs text-[12.5px] leading-relaxed text-sub">
                  Sube un documento (PDF, PPTX, TXT o imagen) y pregúntale lo que quieras.
                  StudyRag responde usando tu material.
                </p>
                <button
                  onClick={onUpload}
                  className="mt-1 flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:brightness-110"
                >
                  <Upload className="h-4 w-4" /> Subir documento
                </button>
              </div>
            ) : (
              messages.map((m) => <ChatMessage key={m.id} msg={m} />)
            )}
            {busy && (
              <div className="animate-fade-in flex items-center gap-2 text-[12px] text-sub">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand" />
                </span>
                Pensando...
              </div>
            )}
          </div>

          {/* command chips */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line bg-panel px-4 pt-2.5">
            <span className="text-[11px] font-medium text-sub">Atajos:</span>
            {COMMANDS.map(({ cmd, label, icon: Icon }) => (
              <button
                key={cmd}
                onClick={() => onCommand?.(cmd)}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-full border border-line bg-panel-2 px-2.5 py-1 text-[11.5px] font-medium text-ink transition-colors hover:border-brand/50 hover:text-brand disabled:opacity-50"
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* input */}
          <div className="flex shrink-0 items-end gap-2 bg-panel px-4 pb-4 pt-2.5">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={docName ? 'Escribe tu pregunta...' : 'Sube un documento primero...'}
                disabled={busy}
                className="flex-1 bg-transparent text-[13px] text-ink caret-brand outline-none placeholder:text-sub/60"
                autoFocus
              />
            </div>
            <button
              onClick={onSend}
              disabled={busy || !input.trim()}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-brand text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Enviar"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </section>

        {/* sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-panel-2/40 p-4 lg:flex">
          {/* quick doubts */}
          <div className="flex min-h-0 flex-col">
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              <Lightbulb className="h-4 w-4 text-accent" /> Dudas rápidas
            </div>
            <div
              ref={doubtsRef}
              className="mb-2 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-line bg-panel p-2.5"
            >
              {doubtMsgs.length === 0 ? (
                <p className="text-[11.5px] leading-relaxed text-sub/70">
                  Anota dudas cortas sin perder el hilo del chat principal.
                </p>
              ) : (
                doubtMsgs.map((m) => (
                  <div key={m.id} className="animate-fade-in text-[11.5px] leading-snug">
                    <span
                      className={`font-semibold ${
                        m.role === 'user' ? 'text-brand' : m.role === 'ai' ? 'text-accent' : 'text-sub'
                      }`}
                    >
                      {m.role === 'user' ? 'Tú' : m.role === 'ai' ? 'AI' : 'sys'}
                    </span>{' '}
                    <span className="text-ink/80" dangerouslySetInnerHTML={{ __html: m.content }} />
                  </div>
                ))
              )}
              {doubtBusy && <p className="text-[11px] italic text-sub">Pensando...</p>}
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1.5 focus-within:border-brand">
              <input
                type="text"
                value={doubtInput}
                onChange={(e) => setDoubtInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return
                  if (e.key === 'Enter') handleDoubtSend()
                }}
                placeholder="Pregunta rápida..."
                disabled={doubtBusy}
                className="flex-1 bg-transparent text-[11.5px] text-ink caret-brand outline-none placeholder:text-sub/50"
              />
              <button
                onClick={handleDoubtSend}
                disabled={doubtBusy || !doubtInput.trim()}
                className="text-brand disabled:opacity-40"
                aria-label="Enviar duda"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* notes */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              <StickyNote className="h-4 w-4 text-brand" /> Notas
            </div>
            <ul className="space-y-2 text-[11.5px] leading-relaxed">
              {[
                'Actualizar la librería de embeddings.',
                'Revisar logs por errores.',
                'Repasar los últimos commits.',
              ].map((n, i) => (
                <li
                  key={i}
                  className="rounded-lg border-l-2 border-accent bg-panel px-2.5 py-1.5 text-ink/80"
                >
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
