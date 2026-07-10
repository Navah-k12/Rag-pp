import { useState, useRef, useEffect, useCallback } from 'react'
import {
  checkHealth, getStatus, uploadDocument,
  askQuestion, getSummary, getFlashcards, getQuiz,
} from './api'
import ChatWindow from './components/ChatWindow'
import HistoryModal from './components/HistoryModal'

function time() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function esc(s) {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [docName, setDocName] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const fileRef = useRef(null)
  const histRef = useRef([])
  const histIdx = useRef(-1)

  const addMsg = useCallback((content, role = 'system') => {
    setMessages(p => [...p, {
      id: Date.now() + Math.random(),
      timestamp: time(),
      role,
      content,
    }])
  }, [])

  useEffect(() => {
    checkHealth().then(ok => {
      if (ok) {
        getStatus().then(s => {
          if (s.document?.filename) setDocName(s.document.filename)
        }).catch(() => {})
      }
    })
  }, [])

  async function handleUpload(files) {
    const f = files[0]
    if (!f) return
    setBusy(true)
    addMsg(`📎 Subiendo <span class="text-yellow">${esc(f.name)}</span>`, 'system')
    try {
      const data = await uploadDocument(f)
      setDocName(f.name)
      addMsg(`✔ ${data.message} — ${data.chunks} fragmentos`, 'system')
    } catch (err) {
      addMsg(`✖ ${esc(err.message)}`, 'system')
    }
    setBusy(false)
  }

  async function execCommand(cmd) {
    setBusy(true)
    try {
      let data
      const errMsg = (cmd) => `Comando desconocido: <span class="text-yellow">:${cmd}</span>. Usa <span class="text-yellow">:help</span>`
      switch (cmd) {
        case 'help':
          addMsg(
            '<span class="text-yellow">:help</span> — esta ayuda<br>' +
            '<span class="text-yellow">:summary</span> — resumen del documento<br>' +
            '<span class="text-yellow">:flashcards</span> — genera flashcards<br>' +
            '<span class="text-yellow">:quiz</span> — genera examen<br>' +
            '<span class="text-yellow">:status</span> — estado del servidor',
            'system'
          )
          break
        case 'status': {
          const s = await getStatus()
          addMsg(
            `API Key: ${s.api_key_configured ? '✅' : '❌'}<br>` +
            `Documento: ${s.document?.filename || 'Ninguno'}`,
            'system'
          )
          break
        }
        case 'summary':
          addMsg('Generando resumen...', 'system')
          data = await getSummary()
          addMsg(data.summary, 'ai')
          break
        case 'flashcards':
          addMsg('Generando flashcards...', 'system')
          data = await getFlashcards(5)
          data.flashcards.forEach((c, i) => {
            addMsg(`<span class="text-yellow">#${i + 1}: ${esc(c.front)}</span><br><span class="text-dim">${esc(c.back)}</span>`, 'ai')
          })
          break
        case 'quiz':
          addMsg('Generando examen...', 'system')
          data = await getQuiz(5, 'mixed')
          data.quiz.forEach((q, i) => {
            let html = `<span class="text-yellow">${i + 1}. ${esc(q.question)}</span><br>`
            if (q.options) q.options.forEach(o => { html += `&nbsp;${esc(o)}<br>` })
            html += `&nbsp;<span class="text-green">✔ ${esc(q.answer)}</span><br>`
            html += `&nbsp;<span class="text-dim italic">${esc(q.explanation)}</span>`
            addMsg(html, 'ai')
          })
          break
        default:
          addMsg(errMsg(cmd), 'system')
      }
    } catch (err) {
      addMsg(`✖ ${esc(err.message)}`, 'system')
    }
    setBusy(false)
  }

  async function handleSend(text) {
    const q = (text || input).trim()
    if (!q || busy) return
    if (!text) setInput('')
    histRef.current.push(q)
    histIdx.current = -1

    if (q.startsWith(':')) {
      addMsg(`<span class="text-dim">❯</span> ${esc(q)}`, 'system')
      await execCommand(q.slice(1).split(/\s+/)[0].toLowerCase())
      return
    }

    setBusy(true)
    addMsg(esc(q), 'user')
    try {
      const data = await askQuestion(q)
      addMsg(data.answer, 'ai')
    } catch (err) {
      addMsg(`✖ ${esc(err.message)}`, 'system')
    }
    setBusy(false)
  }

  return (
    <div
      className="min-h-screen bg-dots flex flex-col items-center justify-center p-4 font-mono"
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
    >
      <div className="text-center text-[13px] text-text/40 tracking-[0.3em] uppercase mb-2 select-none">StudyRag</div>

      <div className="w-[1200px] max-w-full h-[780px] max-h-[95vh] rounded-xl overflow-hidden border border-border bg-bg shadow-lg flex flex-col">
        <ChatWindow
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={() => handleSend(input)}
          busy={busy}
          docName={docName}
          onUpload={() => fileRef.current?.click()}
          onOpenHistory={() => setShowHistory(true)}
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.pptx,.txt,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={e => e.target.files[0] && handleUpload(e.target.files)}
      />

      {showHistory && (
        <HistoryModal
          onClose={() => setShowHistory(false)}
          onNewChat={() => setMessages([])}
        />
      )}
    </div>
  )
}
