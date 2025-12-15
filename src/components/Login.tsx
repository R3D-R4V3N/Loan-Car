import { useState } from 'react'
import { toast } from 'react-toastify'
import { login } from '../api'

interface LoginProps {
  onLogin: (username: string) => void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      setLoading(true)
      const result = await login(username.trim(), password)
      localStorage.setItem('loan-auth', 'true')
      localStorage.setItem('loan-token', result.token)
      localStorage.setItem('loan-user', result.username)
      onLogin(result.username)
    } catch (err: unknown) {
      console.error(err)
      setError('Ongeldige gebruikersnaam of wachtwoord')
      toast.error('Ongeldige gebruikersnaam of wachtwoord')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-indigo-600 font-semibold">Inloggen</p>
          <h1 className="text-2xl font-bold text-slate-900">Autolening dashboard</h1>
          <p className="text-slate-600">Gebruik een van de accounts om de autolening te beheren.</p>
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
              placeholder="wachtwoord"
              required
            />
          </div>
        </div>

        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-red-700 border border-red-100 text-sm">{error}</div>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Aan het inloggen...' : 'Log in'}
        </button>

        <div className="text-xs text-slate-500">
          <p className="font-semibold mb-1">Beschikbare gebruikers:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Gilbert / BMW123</li>
            <li>Christian / BMW123</li>
            <li>Frank / BMW123</li>
            <li>Jasper / BMW123</li>
            <li>Guest / BMW123</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
