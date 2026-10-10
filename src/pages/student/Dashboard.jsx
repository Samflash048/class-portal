import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchMyResults, fetchAllStudentResults } from '../../lib/api'
import { calcCgpa } from '../../lib/gpa'

export default function Dashboard() {
  const regNumber = localStorage.getItem('regNumber')
  const fullName = localStorage.getItem('fullName') || 'Student'
  const firstName = fullName.split(' ')[0]
  
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      // 1. Get student DB ID & Dues status
      const { data: student } = await supabase.from('students').select('id').eq('reg_number', regNumber).single()
      let duesStatus = 'Cleared'
      if (student) {
        const { data: dues } = await supabase.from('dues').select('amount_due, amount_paid').eq('student_id', student.id)
        const totalDue = dues?.reduce((a, d) => a + d.amount_due, 0) || 0
        const totalPaid = dues?.reduce((a, d) => a + d.amount_paid, 0) || 0
        duesStatus = totalPaid >= totalDue && totalDue > 0 ? 'Cleared' : (totalDue === 0 ? 'No dues' : 'Outstanding')
      }

      // 2. Calculate personal CGPA & Session GPAs
      const myRows = await fetchMyResults(regNumber)
      const { cgpa, semesters } = calcCgpa(myRows)

      // 3. Calculate Class Rank
      const allRows = await fetchAllStudentResults()
      const byStudent = {}
      allRows.forEach((r) => {
        const key = r.students.reg_number
        ;(byStudent[key] ||= []).push({
          session: r.sessions.name, semester: r.semester,
          score: r.score, grade: r.grade, units: r.courses?.units ?? 3
        })
      })
      const ranked = Object.entries(byStudent)
        .map(([reg, rows]) => ({ reg, cgpa: calcCgpa(rows).cgpa }))
        .sort((a, b) => b.cgpa - a.cgpa)
      
      const myRank = ranked.findIndex((s) => s.reg === regNumber) + 1

      setStats({
        cgpa: cgpa.toFixed(2),
        rank: myRank > 0 ? `#${myRank}` : '—',
        classSize: ranked.length,
        duesStatus,
        sessionGpas: semesters // from gpa.js: { key, gpa, units }
      })
    }
    
    if (regNumber) loadDashboard()
  }, [regNumber])

  if (!stats) return <p className="text-gray-500">Loading dashboard...</p>

  const cards = [
    { label: 'CGPA', value: stats.cgpa },
    { label: 'Class rank', value: `${stats.rank} of ${stats.classSize}` },
    { label: 'Session dues', value: stats.duesStatus },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium text-navy">
          Hello, {firstName}
        </h2>
        <p className="text-sm text-gray-500">Here is your academic overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-mist p-5">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-medium text-navy mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-mist p-6">
        <h3 className="text-sm font-medium text-navy mb-6">GPA by session</h3>
        {stats.sessionGpas.length === 0 ? (
          <p className="text-sm text-gray-500">No results uploaded yet.</p>
        ) : (
          <div className="flex items-end gap-6 h-40">
            {stats.sessionGpas.map((s) => (
              <div key={s.key} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs text-navy font-medium">{s.gpa.toFixed(2)}</span>
                <div
                  className="w-full max-w-16 rounded-t-lg bg-navy transition-all duration-500"
                  style={{ height: `${(s.gpa / 5) * 100}%` }}
                />
                <span className="text-xs text-gray-500 text-center">{s.key}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}