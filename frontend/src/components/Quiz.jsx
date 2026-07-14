import { useState } from 'react'

export default function Quiz({ questions, results, onSubmit, onRetry }) {
  const [selected, setSelected] = useState({})
  const [textAnswers, setTextAnswers] = useState({})

  if (!questions || questions.length === 0) return null

  function handleSelect(index, option) {
    if (results) return
    setSelected(p => ({ ...p, [index]: option }))
  }

  function handleTextChange(index, value) {
    if (results) return
    setTextAnswers(p => ({ ...p, [index]: value }))
  }

  function handleSubmit() {
    const answers = questions.map((q, i) => {
      if (q.type === 'open') {
        return { index: i, type: 'open', text_answer: textAnswers[i] || '' }
      }
      return { index: i, type: q.type || 'closed', selected: selected[i] || '' }
    })
    onSubmit(answers)
  }

  const allAnswered = questions.every((q, i) => {
    if (q.type === 'open') return (textAnswers[i] || '').trim().length > 0
    return selected[i]
  })

  if (results) {
    return (
      <div className="space-y-3">
        {results.results.map((r) => (
          <div
            key={r.index}
            className={`border rounded-lg p-3 text-[11px] ${
              r.score_value >= 0.75
                ? 'border-green/40 bg-green/5'
                : r.score_value >= 0.5
                ? 'border-yellow/40 bg-yellow/5'
                : 'border-red/40 bg-red/5'
            }`}
          >
            <div className="flex items-start gap-2 mb-1">
              <span className={
                r.score_value >= 0.75 ? 'text-green' :
                r.score_value >= 0.5 ? 'text-yellow' : 'text-red'
              }>
                {r.score_value >= 0.75 ? '✔' : r.score_value >= 0.5 ? '◐' : '✘'}
              </span>
              <span className="text-text font-medium">
                {r.question}
                <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded border ${
                  r.type === 'open'
                    ? 'border-purple/40 text-purple-bright'
                    : 'border-blue/40 text-blue-bright'
                }`}>
                  {r.type === 'open' ? 'Abierta' : 'Cerrada'}
                </span>
              </span>
            </div>

            {r.type === 'closed' ? (
              !r.is_correct && (
                <div className="ml-5 space-y-0.5">
                  <div className="text-red/80">Tu respuesta: {r.selected}</div>
                  <div className="text-green/80">Correcta: {r.correct_answer}</div>
                </div>
              )
            ) : (
              <div className="ml-5 space-y-0.5">
                <div className="text-text/70">Tu respuesta: <span className="italic">"{r.text_answer}"</span></div>
                <div className="text-green/80">Respuesta esperada: {r.correct_answer}</div>
                <div className="text-purple-bright/80">Puntuación: {Math.round(r.score_value * 100)}%</div>
              </div>
            )}

            <div className="ml-5 mt-1 text-dim italic">{r.explanation}</div>
          </div>
        ))}

        <div className="border border-purple/30 bg-purple/5 rounded-lg p-3 text-center">
          <div className="text-[13px] text-purple-bright font-medium">
            {results.score}/{results.total} puntos — {results.percentage}%
          </div>
          <div className="text-[11px] text-text/80 mt-1">{results.message}</div>
        </div>

        <button
          onClick={onRetry}
          className="w-full py-2 rounded border border-green/40 text-green text-[11px] hover:bg-green/10 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const isOpen = q.type === 'open'
        return (
          <div key={i} className="border border-border/50 rounded-lg p-3">
            <div className="text-[11px] text-text font-medium mb-2">
              <span className="text-yellow">{i + 1}.</span> {q.question}
              <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded border ${
                isOpen
                  ? 'border-purple/40 text-purple-bright'
                  : 'border-blue/40 text-blue-bright'
              }`}>
                {isOpen ? 'Abierta' : 'Cerrada'}
              </span>
            </div>

            {isOpen ? (
              <textarea
                value={textAnswers[i] || ''}
                onChange={e => handleTextChange(i, e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                rows={3}
                className="w-full bg-surface/50 border border-border/30 rounded px-2 py-1.5 text-[10px] text-text font-mono placeholder:text-dim/30 outline-none focus:border-green/40 resize-none"
              />
            ) : (
              <div className="space-y-1">
                {(q.options || []).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(i, opt)}
                    className={`w-full text-left px-2 py-1.5 rounded border text-[10px] transition-colors ${
                      selected[i] === opt
                        ? 'border-green/50 bg-green/10 text-green-bright'
                        : 'border-border/30 text-dim hover:border-border/60 hover:text-text/70'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered}
        className={`w-full py-2 rounded border text-[11px] transition-colors ${
          allAnswered
            ? 'border-green/40 text-green hover:bg-green/10'
            : 'border-border/30 text-dim/40 cursor-not-allowed'
        }`}
      >
        Entregar respuestas
      </button>
    </div>
  )
}
