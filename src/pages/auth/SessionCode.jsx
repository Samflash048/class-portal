import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function SessionCode() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const reg = localStorage.getItem('regNumber')
    const { data } = await supabase
      .from('students')
      .select('session_code')
      .eq('reg_number', reg)
      .single()
    setLoading(false)

    if (data?.session_code && data.session_code === code.trim().toUpperCase()) {
      navigate('/dashboard')
    } else {
      setError('Incorrect session code. Check the code issued to you and try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-white">Enter your session code</h1>
          <p className="text-sm text-mist mt-1">
            A unique code was issued to you by the class rep or fin. sec.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <input type="text" value={code}
            onChange={(e) => { setCode(e.target.value); setError('') }}
            placeholder="Your unique code"
            className="w-full rounded-xl border border-mist px-4 py-2.5 text-sm text-center
                       tracking-widest uppercase text-navy focus:outline-none focus:ring-2 focus:ring-accent" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-accent text-navy py-2.5 text-sm font-medium
                       hover:bg-accent-dark transition-colors disabled:opacity-50">
            {loading ? 'Verifying...' : 'Access portal'}
          </button>
        </form>

        <p className="text-center text-xs text-mist mt-6">
          Lost your code? Contact the class rep.
        </p>
      </div>
    </div>
  )
}