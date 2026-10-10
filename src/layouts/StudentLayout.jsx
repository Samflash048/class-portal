import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Wallet, User, Trophy, Calculator, LogOut, Menu, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/results', label: 'Results', icon: FileText },
  { to: '/dashboard/dues', label: 'Session dues', icon: Wallet },
  { to: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/dashboard/cgpa', label: 'CGPA calculator', icon: Calculator },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function StudentLayout() {
  const navigate = useNavigate()
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const regNumber = localStorage.getItem('regNumber') || ''
  const fullName = localStorage.getItem('fullName') || 'Student'
  const sessionCode = localStorage.getItem('sessionCode') || ''
  const firstName = fullName.split(' ')[0]

  useEffect(() => {
    async function verifyAccess() {
      if (!regNumber || !sessionCode) return handleLogout()
      
      const { data, error } = await supabase
        .from('students').select('session_code').eq('reg_number', regNumber).single()

      if (error || !data || data.session_code !== sessionCode) handleLogout()
      else setLoadingAuth(false)
    }
    verifyAccess()
  }, [regNumber, sessionCode])

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  if (loadingAuth) {
    return <div className="min-h-screen bg-mist flex items-center justify-center text-navy font-medium">Verifying session...</div>
  }

  return (
    <div className="min-h-screen bg-mist flex relative">
      
      {/* Mobile Dark Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy text-white flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium">Class Portal</h1>
            <p className="text-xs text-mist mt-0.5">2022/2023 session</p>
          </div>
          <button className="md:hidden text-mist hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive ? 'bg-accent text-navy font-medium' : 'text-mist hover:bg-white/10 hover:text-white'
                }`
              }>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout}
          className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-mist hover:bg-white/10 hover:text-white transition-colors">
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="bg-white border-b border-mist px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-navy p-1" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <p className="text-sm text-navy hidden sm:block">
              Welcome back, <span className="font-medium">{firstName}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-navy text-accent flex items-center justify-center text-sm font-medium">
              {firstName[0]}
            </div>
            <div className="text-xs text-navy leading-tight hidden sm:block">
              <p className="font-medium">{fullName}</p>
              <p className="text-gray-500">{regNumber}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}