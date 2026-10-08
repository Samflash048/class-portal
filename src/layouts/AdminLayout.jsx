import { Outlet, useNavigate } from 'react-router-dom'
import { Upload, KeyRound, Wallet, Settings, LogOut } from 'lucide-react'

export default function AdminLayout() {
  const navigate = useNavigate()
  const admin = JSON.parse(localStorage.getItem('admin') || 'null')

  function handleLogout() {
    localStorage.removeItem('admin')
    navigate('/admin')
  }

  const tabs = [
    { id: 'upload', label: 'Upload results', icon: Upload },
    { id: 'codes', label: 'Session codes', icon: KeyRound },
    { id: 'dues', label: 'Manage dues', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-mist flex">
      <aside className="w-64 bg-navy text-white flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="text-lg font-medium">Class Portal</h1>
          <p className="text-xs text-mist mt-0.5 capitalize">{admin?.role?.replace('_', ' ') || 'Admin'}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id}
              onClick={() => document.getElementById(`tab-${id}`)?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-mist hover:bg-white/10 hover:text-white transition-colors">
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout}
          className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-mist hover:bg-white/10 hover:text-white transition-colors">
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      <main className="flex-1 p-8 space-y-8 max-w-4xl">
        <Outlet />
      </main>
    </div>
  )
}