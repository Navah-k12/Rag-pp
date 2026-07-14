const API = 'http://localhost:8000'

export async function checkHealth() {
  const res = await fetch(`${API}/`)
  return res.ok
}

export async function getStatus() {
  const res = await fetch(`${API}/status`)
  if (!res.ok) throw new Error('Error al obtener estado')
  return res.json()
}

export async function getAvailableModels() {
  const res = await fetch(`${API}/models`)
  if (!res.ok) throw new Error('Error al obtener modelos')
  return res.json()
}

export async function uploadDocument(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API}/upload`, { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function askQuestion(question, model = 'gemini-2.0-flash') {
  const res = await fetch(`${API}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, model }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function getSummary(model = 'gemini-2.0-flash') {
  const res = await fetch(`${API}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function getFlashcards(count = 5, model = 'gemini-2.0-flash') {
  const res = await fetch(`${API}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, model }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function getQuiz(count = 5, type = 'multiple_choice', model = 'gemini-2.0-flash') {
  const res = await fetch(`${API}/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, type, model }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function checkQuizAnswers(answers, model = 'gemini-2.0-flash') {
  const res = await fetch(`${API}/quiz/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, model }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function getQuizAdvanced(count = 7, model = 'gemini-2.0-flash') {
  const res = await fetch(`${API}/quiz/advanced`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, model }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function checkQuizAdvancedAnswers(answers, model = 'gemini-2.0-flash') {
  const res = await fetch(`${API}/quiz/advanced/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, model }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}
