import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Upload, KeyRound, Wallet, Settings, LogOut, Activity, Menu, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const adminStr = localStorage.getItem('admin')
  const admin = adminStr ? JSON.parse(adminStr) : null

  useEffect(() => {
    async function verifyAdmin() {
      if (!admin || !admin.email) return handleLogout()
      const { data, error } = await supabase.from('admins').select('email').eq('email', admin.email).single()

      if (error || !data) handleLogout()
      else setLoadingAuth(false)
    }
    verifyAdmin()
  }, [])

  function handleLogout() {
    localStorage.removeItem('admin')
    navigate('/admin')
  }

  if (loadingAuth) {
    return <div className="min-h-screen bg-mist flex items-center justify-center text-navy font-medium">Verifying admin access...</div>
  }

  const tabs = [
    { id: 'upload', to: '/admin/dashboard/upload', label: 'Upload results', icon: Upload },
    { id: 'codes', to: '/admin/dashboard/codes', label: 'Session codes', icon: KeyRound },
    { id: 'dues', to: '/admin/dashboard/dues', label: 'Manage dues', icon: Wallet },
    { id: 'monitor', to: '/admin/dashboard/monitor', label: 'Dues monitor', icon: Activity },
    { id: 'settings', to: '/admin/dashboard/settings', label: 'Settings', icon: Settings },
  ]

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
            <p className="text-xs text-mist mt-0.5 capitalize">{admin?.role?.replace('_', ' ') || 'Admin'}</p>
          </div>
          <button className="md:hidden text-mist hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {tabs.map(({ id, to, label, icon: Icon }) => (
            <NavLink key={id} to={to}
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
        
        {/* Mobile Header (Only visible on small screens) */}
        <header className="bg-white border-b border-mist px-4 py-4 flex items-center md:hidden sticky top-0 z-30">
          <button className="text-navy p-1 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
            <span className="font-medium text-sm">Menu</span>
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}