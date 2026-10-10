import { useEffect, useState } from 'react'
import { fetchMyResults } from '../../lib/api'
import { calcSemesterGpa } from '../../lib/gpa'

const GRADE_STYLES = {
  A: 'bg-green-100 text-green-800', B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800', D: 'bg-orange-100 text-orange-800',
  E: 'bg-red-100 text-red-700', F: 'bg-red-600 text-white',
}

export default function Results() {
  const reg = localStorage.getItem('regNumber')
  const [rows, setRows] = useState(null)
  const [tab, setTab] = useState(null)

  useEffect(() => {
    fetchMyResults(reg).then((r) => {
      setRows(r)
      const keys = [...new Set(r.map((x) => `${x.session}|${x.semester}`))]
      setTab(keys[0] || null)
    })
  }, [reg])

  if (rows === null) return <p className="text-gray-500">Loading results...</p>
  if (!rows.length) return <p className="text-gray-500">No results published yet.</p>

  const tabs = [...new Set(rows.map((r) => `${r.session}|${r.semester}`))]
  const current = rows.filter((r) => `${r.session}|${r.semester}` === tab)
  const { gpa, detail } = calcSemesterGpa(current)
  const [sessionName, sem] = tab.split('|')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-medium text-navy">Results</h2>
          <p className="text-sm text-gray-500">{sessionName} · semester {sem}</p>
        </div>

        <div className="flex bg-white border border-mist rounded-xl p-1 flex-wrap">
          {tabs.map((t) => {
            const [s, n] = t.split('|')
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                  tab === t ? 'bg-navy text-white' : 'text-navy hover:bg-mist'}`}>
                {s.split('/')[0]}L · sem {n}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-navy rounded-2xl p-6 flex items-center justify-between">
        <p className="text-mist text-sm">Semester GPA</p>
        <p className="text-3xl font-medium text-accent">{gpa.toFixed(2)}</p>
      </div>

      <div className="bg-white rounded-2xl border border-mist overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-mist">
              <th className="px-6 py-3 font-medium">Course</th>
              <th className="px-6 py-3 font-medium">Score</th>
              <th className="px-6 py-3 font-medium">Grade</th>
              <th className="px-6 py-3 font-medium">Units</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist">
            {detail.map((row) => (
              <tr key={row.code}>
                <td className="px-6 py-3 font-medium text-navy">{row.code}</td>
                <td className="px-6 py-3 text-gray-600">{row.score}</td>
                <td className="px-6 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${GRADE_STYLES[row.grade] || 'bg-mist text-navy'}`}>
                    {row.grade}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-600">{row.units}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}