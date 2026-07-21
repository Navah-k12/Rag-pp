import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { GraduationCap, Mail, Lock, User, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <div className="bg-grid flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lg">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-extrabold text-ink">StudyRag</h1>
          <p className="mt-1 text-[13px] text-sub">Crea tu cuenta para empezar</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-2xl"
        >
          {error && (
            <div className="rounded-lg bg-bad/10 px-3 py-2 text-[12.5px] font-medium text-bad">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-ink">Nombre</label>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <User className="h-4 w-4 text-sub" />
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="flex-1 bg-transparent text-[13px] text-ink caret-brand outline-none placeholder:text-sub/50"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-ink">Email</label>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <Mail className="h-4 w-4 text-sub" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 bg-transparent text-[13px] text-ink caret-brand outline-none placeholder:text-sub/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-ink">Contrasena</label>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <Lock className="h-4 w-4 text-sub" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                className="flex-1 bg-transparent text-[13px] text-ink caret-brand outline-none placeholder:text-sub/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-4 text-center text-[12.5px] text-sub">
          Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  )
}
