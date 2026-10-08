import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import SessionCode from './pages/auth/SessionCode'
import StudentLayout from './layouts/StudentLayout'
import Dashboard from './pages/student/Dashboard'
import Results from './pages/student/Results'
import Dues from './pages/student/Dues'
import Leaderboard from './pages/student/Leaderboard'
import CgpaCalc from './pages/student/CgpaCalc'
import Profile from './pages/student/Profile'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/session-code" element={<SessionCode />} />

        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/results" element={<Results />} />
          <Route path="/dashboard/dues" element={<Dues />} />
          <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
          <Route path="/dashboard/cgpa" element={<CgpaCalc />} />
          <Route path="/dashboard/profile" element={<Profile />} />
        </Route>

        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}