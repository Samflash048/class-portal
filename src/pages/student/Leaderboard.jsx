import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchAllStudentResults } from '../../lib/api'
import { calcCgpa } from '../../lib/gpa'

const MEDALS = { 1: 'bg-accent text-navy', 2: 'bg-gray-300 text-navy', 3: 'bg-orange-200 text-navy' }
const formatFirstName = (name) => name ? name.split(' ')[0] : 'Student'

export default function Leaderboard() {
  const myReg = localStorage.getItem('regNumber')
  const [ranked, setRanked] = useState(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    async function load() {
      const [rows, { data: session }] = await Promise.all([
        fetchAllStudentResults(),
        supabase.from('sessions').select('leaderboard_visible').eq('is_current', true).single(),
      ])
      setHidden(!session?.leaderboard_visible)

      const byStudent = {}
      rows.forEach((r) => {
        const key = r.students.reg_number
        ;(byStudent[key] ||= { name: r.students.full_name, rows: [] }).rows.push({
          session: r.sessions.name, semester: r.semester,
          code: r.course_code, score: r.score, grade: r.grade,
          units: r.courses?.units ?? 3,
        })
      })
      setRanked(
        Object.entries(byStudent)
          .map(([reg, v]) => ({ reg, name: v.name, cgpa: calcCgpa(v.rows).cgpa }))
          .sort((a, b) => b.cgpa - a.cgpa)
      )
    }
    load()
  }, [])

  if (ranked === null) return <p className="text-gray-500">Loading leaderboard...</p>

  const myRank = ranked.findIndex((s) => s.reg === myReg) + 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-navy">Leaderboard</h2>
          <p className="text-sm text-gray-500">Ranked by CGPA · based on results published so far</p>
        </div>
        {hidden && (
          <span className="px-3 py-1.5 rounded-full bg-mist text-xs text-gray-500">
            Hidden by admin
          </span>
        )}
      </div>

      {myRank > 0 && (
        <div className="bg-navy rounded-2xl p-6 flex items-center justify-between">
          <p className="text-mist text-sm">Your position</p>
          <p className="text-2xl font-medium text-accent">
            {hidden ? 'Hidden' : `#${myRank} of ${ranked.length}`}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-mist overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-mist">
              <th className="px-6 py-3 font-medium w-16">Rank</th>
              <th className="px-6 py-3 font-medium">Student</th>
              <th className="px-6 py-3 font-medium">Reg number</th>
              <th className="px-6 py-3 font-medium text-right">CGPA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist">
            {ranked.map((s, i) => (
              <tr key={s.reg} className={s.reg === myReg ? 'bg-accent/10' : ''}>
                <td className="px-6 py-3">
                  <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-medium ${MEDALS[i + 1] || 'bg-mist text-navy'}`}>
                    {hidden && s.reg !== myReg ? '—' : i + 1}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="font-medium text-navy">
                    {hidden && s.reg !== myReg ? 'Student' : formatFirstName(s.name)}
                  </span>
                  {s.reg === myReg && <span className="ml-2 text-xs text-accent-dark font-medium">(you)</span>}
                </td>
                <td className="px-6 py-3 text-gray-600">{s.reg}</td>
                <td className="px-6 py-3 text-right font-medium text-navy">
                  {hidden && s.reg !== myReg ? '—' : s.cgpa.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}