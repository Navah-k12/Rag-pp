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

export async function uploadDocument(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API}/upload`, { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function askQuestion(question) {
  const res = await fetch(`${API}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function getSummary() {
  const res = await fetch(`${API}/summarize`, { method: 'POST' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function getFlashcards(count = 5) {
  const res = await fetch(`${API}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export async function getQuiz(count = 5, type = 'multiple_choice') {
  const res = await fetch(`${API}/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, type }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}
