import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Wallet, User, Trophy, Calculator, LogOut,
} from 'lucide-react'
import { findStudent, firstName } from '../data/mockData'

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
  const student = findStudent(localStorage.getItem('regNumber'))

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-mist flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="text-lg font-medium">Class Portal</h1>
          <p className="text-xs text-mist mt-0.5">2022/2023 session</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-navy font-medium'
                    : 'text-mist hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                     text-mist hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-mist px-8 py-4 flex items-center justify-between">
          <p className="text-sm text-navy">
            Welcome back, <span className="font-medium">{student ? firstName(student.fullName) : 'Student'}</span>
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-navy text-accent flex items-center justify-center text-sm font-medium">
              {student ? firstName(student.fullName)[0] : '?'}
            </div>
            <div className="text-xs text-navy leading-tight">
              <p className="font-medium">{student?.fullName || '—'}</p>
              <p className="text-gray-500">{student?.regNumber || ''}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}