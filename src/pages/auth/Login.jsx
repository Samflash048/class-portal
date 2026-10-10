import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [regNumber, setRegNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const REG_PATTERN = /^\d{4}\/\d{6}$/

  async function handleSubmit(e) {
    e.preventDefault()
    const cleaned = regNumber.trim().toUpperCase()

    if (!REG_PATTERN.test(cleaned)) {
      setError('Enter a valid registration number (e.g. 2022/247147)')
      return
    }

    setLoading(true)
    const { data, error: dbError } = await supabase
      .from('students')
      .select('reg_number, full_name, session_code')
      .eq('reg_number', cleaned)
      .single()

    setLoading(false)

    if (dbError || !data) {
      setError('This registration number is not on the class list.')
      return
    }

    localStorage.setItem('regNumber', data.reg_number)
    localStorage.setItem('fullName', data.full_name)

    if (data.session_code) {
      navigate('/session-code')
    } else {
      setError('No session code has been issued for you yet. Contact the class rep.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-white">Class Portal</h1>
          <p className="text-sm text-mist mt-1">Sign in with your registration number</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label htmlFor="regNumber" className="block text-sm font-medium text-navy mb-1">
              Registration number
            </label>
            <input
              id="regNumber" type="text" value={regNumber}
              onChange={(e) => { setRegNumber(e.target.value); setError('') }}
              placeholder="2022/247147"
              className="w-full rounded-xl border border-mist px-4 py-2.5 text-sm text-navy
                         focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-accent text-navy py-2.5 text-sm font-medium
                       hover:bg-accent-dark transition-colors disabled:opacity-50">
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/admin" className="text-xs text-mist hover:text-white transition-colors">
            Class Rep / Admin Access
          </Link>
        </div>
      </div>
    </div>
  )
}