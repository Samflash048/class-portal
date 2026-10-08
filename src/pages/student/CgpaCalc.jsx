import { useEffect, useState } from 'react'
import { fetchMyResults } from '../../lib/api'
import { calcCgpa, gradeClass } from '../../lib/gpa'

export default function CgpaCalc() {
  const reg = localStorage.getItem('regNumber')
  const [rows, setRows] = useState(null)
  const [target, setTarget] = useState('')

  useEffect(() => {
    fetchMyResults(reg).then(setRows)
  }, [reg])

  if (rows === null) return <p className="text-gray-500">Loading...</p>
  if (!rows.length) return <p className="text-gray-500">No results available for CGPA calculation yet.</p>

  const { cgpa, semesters } = calcCgpa(rows)

  let needed = null
  const t = parseFloat(target)
  if (!isNaN(t) && t > 0 && t <= 5) {
    const totalUnits = semesters.reduce((a, s) => a + s.units, 0)
    const nextUnits = semesters[semesters.length - 1]?.units || 15
    needed = ((t * (totalUnits + nextUnits) - cgpa * totalUnits) / nextUnits).toFixed(2)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-medium text-navy">CGPA calculator</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-navy rounded-2xl p-6">
          <p className="text-mist text-sm">Current CGPA</p>
          <p className="text-3xl font-medium text-accent mt-1">{cgpa.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-mist p-6">
          <p className="text-gray-500 text-sm">Classification</p>
          <p className="text-3xl font-medium text-navy mt-1">{gradeClass(cgpa)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-mist p-6 space-y-3">
        <h3 className="text-sm font-medium text-navy">Session breakdown</h3>
        {semesters.map((s) => (
          <div key={s.key} className="flex justify-between text-sm border-b border-mist last:border-0 pb-3 last:pb-0">
            <span className="text-gray-500">{s.key}</span>
            <span className="font-medium text-navy">{s.gpa.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-mist p-6 space-y-4">
        <h3 className="text-sm font-medium text-navy">What do I need next semester?</h3>
        <input type="number" step="0.01" min="0" max="5" value={target}
          onChange={(e) => setTarget(e.target.value)} placeholder="Target CGPA (e.g. 4.50)"
          className="w-full rounded-xl border border-mist px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent" />
        {needed !== null && (
          <p className="text-sm text-gray-600">
            {parseFloat(needed) > 5
              ? 'That target is out of reach — even a 5.00 next semester would not get you there.'
              : parseFloat(needed) <= 0
              ? 'You have already secured that CGPA.'
              : <>You need approximately a <span className="font-medium text-navy">{needed} GPA</span> next semester.</>}
          </p>
        )}
      </div>
    </div>
  )
}