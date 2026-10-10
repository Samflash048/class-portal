import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dues() {
  const reg = localStorage.getItem('regNumber')
  const [rows, setRows] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: student } = await supabase
        .from('students').select('id').eq('reg_number', reg).single()
      if (!student) { setRows([]); return }

      const { data: dues } = await supabase
        .from('dues').select('level, amount_due, amount_paid')
        .eq('student_id', student.id).order('level')

      setRows((dues || []).map((d) => ({
        level: `${d.level}L`,
        expected: d.amount_due,
        amount: d.amount_paid,
        status: d.amount_paid >= d.amount_due ? 'Paid' : 'Unpaid',
      })))
    }
    load()
  }, [reg])

  const STATUS_STYLES = {
    Paid: 'bg-green-100 text-green-800',
    Unpaid: 'bg-red-100 text-red-700',
  }

  const totalOwed = (rows || [])
    .filter((r) => r.status === 'Unpaid')
    .reduce((a, r) => a + (r.expected - r.amount), 0)

  if (rows === null) return <p className="text-gray-500">Loading dues...</p>

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-medium text-navy">Session dues</h2>
        <p className="text-sm text-gray-500">Flat class dues per level, as recorded by the fin. sec.</p>
      </div>

      <div className="bg-navy rounded-2xl p-6 flex items-center justify-between">
        <p className="text-mist text-sm">Outstanding balance</p>
        <p className="text-2xl font-medium text-accent">
          {totalOwed > 0 ? `₦${totalOwed.toLocaleString()}` : 'Cleared'}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-500">No dues have been billed yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-mist overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-mist">
                <th className="px-6 py-3 font-medium">Level</th>
                <th className="px-6 py-3 font-medium">Amount due</th>
                <th className="px-6 py-3 font-medium">Paid</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist">
              {rows.map((r) => (
                <tr key={r.level}>
                  <td className="px-6 py-3 font-medium text-navy">{r.level}</td>
                  <td className="px-6 py-3 text-gray-600">₦{r.expected.toLocaleString()}</td>
                  <td className="px-6 py-3 text-gray-600">₦{r.amount.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Spot an error? Dues are updated by the financial secretary — contact them directly.
      </p>
    </div>
  )
}