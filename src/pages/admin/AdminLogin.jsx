import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { data } = await supabase
      .from('admins')
      .select('email, role')
      .eq('email', email.trim().toLowerCase())
      .eq('password_hash', password)
      .single()
    setLoading(false)

    if (!data) {
      setError('Invalid credentials.')
      return
    }
    localStorage.setItem('admin', JSON.stringify(data))
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-white">Admin access</h1>
          <p className="text-sm text-mist mt-1">Class rep & financial secretary only</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" className="w-full rounded-xl border border-mist px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent" />
          <input type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setError('') }}
            placeholder="Password" className="w-full rounded-xl border border-mist px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-accent text-navy py-2.5 text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}