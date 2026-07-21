import { useCallback, useEffect, useRef, useState } from 'react'
import ChatWindow from './components/ChatWindow.jsx'
import HistoryModal from './components/HistoryModal.jsx'
import { useAuth } from './contexts/AuthContext.jsx'
import {
  askQuestion,
  checkHealth,
  getAvailableModels,
  getFlashcards,
  getQuiz,
  getStatus,
  getSummary,
  uploadDocument,
} from './api.js'
import { LogOut, GraduationCap } from 'lucide-react'

function time() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function esc(s) {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

function getInitialTheme() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('studyrag-theme')
    if (saved === 'light' || saved === 'dark') return saved
  }
  return 'dark'
}

export default function StudyApp() {
  const { user, logout } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [docName, setDocName] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)
  const [model, setModel] = useState('gemini-2.0-flash')
  const [availableModels, setAvailableModels] = useState({})
  const fileRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('studyrag-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const addMsg = useCallback((content, role = 'system') => {
    setMessages((p) => [...p, { id: Date.now() + Math.random(), timestamp: time(), role, content }])
  }, [])

  useEffect(() => {
    checkHealth().then((ok) => {
      if (ok) {
        getStatus()
          .then((s) => {
            if (s.document?.filename) setDocName(s.document.filename)
          })
          .catch(() => {})
        getAvailableModels()
          .then((m) => setAvailableModels(m.models))
          .catch(() => {})
      }
    })
  }, [])

  async function handleUpload(files) {
    const f = files[0]
    if (!f) return
    setBusy(true)
    addMsg(`Subiendo <strong>${esc(f.name)}</strong>...`, 'system')
    try {
      const data = await uploadDocument(f)
      setDocName(f.name)
      addMsg(`${esc(data.message)} — ${data.chunks} fragmentos indexados.`, 'system')
    } catch (err) {
      addMsg(`Error: ${esc(err.message)}`, 'system')
    }
    setBusy(false)
  }

  async function execCommand(cmd) {
    setBusy(true)
    try {
      switch (cmd) {
        case 'help':
          addMsg(
            '<strong>:summary</strong> resumen · <strong>:flashcards</strong> tarjetas · <strong>:quiz</strong> examen · <strong>:status</strong> estado',
            'system',
          )
          break
        case 'status': {
          const s = await getStatus()
          addMsg(
            `API Key: ${s.api_key_configured ? 'configurada' : 'no configurada'} · Documento: ${s.document?.filename || 'ninguno'}`,
            'system',
          )
          break
        }
        case 'summary': {
          addMsg('Generando resumen...', 'system')
          const data = await getSummary(model)
          addMsg(esc(data.summary), 'ai')
          break
        }
        case 'flashcards': {
          addMsg('Generando flashcards...', 'system')
          const data = await getFlashcards(5, model)
          data.flashcards.forEach((c, i) => {
            addMsg(
              `<strong>#${i + 1} · ${esc(c.front)}</strong><br>${esc(c.back)}`,
              'ai',
            )
          })
          break
        }
        case 'quiz': {
          addMsg('Generando examen...', 'system')
          const data = await getQuiz(5, 'mixed', model)
          data.quiz.forEach((q, i) => {
            let html = `<strong>${i + 1}. ${esc(q.question)}</strong><br>`
            if (q.options) q.options.forEach((o) => (html += `${esc(o)}<br>`))
            html += `<span style="color:var(--good)">Respuesta: ${esc(q.answer)}</span><br>`
            html += `<em>${esc(q.explanation)}</em>`
            addMsg(html, 'ai')
          })
          break
        }
        default:
          addMsg(`Comando desconocido: <strong>:${esc(cmd)}</strong>. Usa <strong>:help</strong>.`, 'system')
      }
    } catch (err) {
      addMsg(`Error: ${esc(err.message)}`, 'system')
    }
    setBusy(false)
  }

  async function handleSend(text) {
    const q = (text ?? input).trim()
    if (!q || busy) return
    if (text === undefined) setInput('')

    if (q.startsWith(':')) {
      addMsg(esc(q), 'user')
      await execCommand(q.slice(1).split(/\s+/)[0].toLowerCase())
      return
    }

    setBusy(true)
    addMsg(esc(q), 'user')
    try {
      const data = await askQuestion(q, model)
      addMsg(esc(data.answer), 'ai')
    } catch (err) {
      addMsg(`Error: ${esc(err.message)}`, 'system')
    }
    setBusy(false)
  }

  return (
    <main
      className="bg-grid flex min-h-screen flex-col items-center justify-center p-4 sm:p-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        handleUpload(e.dataTransfer.files)
      }}
    >
      <div className="flex h-[820px] max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
        {/* user bar */}
        <div className="flex items-center gap-2 border-b border-line bg-panel-2/50 px-4 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-brand">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          <span className="text-[12px] font-medium text-ink truncate">{user?.name || user?.email}</span>
          <button
            onClick={logout}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-[11px] font-medium text-sub transition-colors hover:border-bad/50 hover:text-bad"
            title="Cerrar sesion"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>

        <ChatWindow
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          busy={busy}
          docName={docName}
          onUpload={() => fileRef.current?.click()}
          onOpenHistory={() => setShowHistory(true)}
          onCommand={(cmd) => handleSend(cmd)}
          theme={theme}
          onToggleTheme={toggleTheme}
          model={model}
          setModel={setModel}
          availableModels={availableModels}
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.pptx,.txt,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files)}
      />

      {showHistory && (
        <HistoryModal onClose={() => setShowHistory(false)} onNewChat={() => setMessages([])} />
      )}
    </main>
  )
}
