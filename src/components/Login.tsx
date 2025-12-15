import { useState } from 'react'

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin' && password === 'password') {
      localStorage.setItem('loan-auth', 'true')
      onLogin()
    } else {
      setError('Ongeldige gebruikersnaam of wachtwoord')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-indigo-600 font-semibold">Inloggen</p>
          <h1 className="text-2xl font-bold text-slate-900">Persoonlijke lening</h1>
          <p className="text-slate-600">Gebruik admin/password om te starten</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm text-slate-600" htmlFor="username">Gebruikersnaam</label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-600" htmlFor="password">Wachtwoord</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
            />
          </div>
        </div>

        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-red-700 border border-red-100 text-sm">{error}</div>}

        <button type="submit" className="btn-primary w-full">Log in</button>
      </form>
    </div>
  )
}
