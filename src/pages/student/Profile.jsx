import { findStudent } from '../../data/mockData'

export default function Profile() {
  const student = findStudent(localStorage.getItem('regNumber'))
  if (!student) return <p className="text-gray-500">Student not found.</p>

  const rows = [
    { label: 'Full name', value: student.fullName },
    { label: 'Registration number', value: student.regNumber },
    { label: 'Level', value: student.level },
  ]

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-medium text-navy mb-6">Profile</h2>
      <div className="bg-white rounded-2xl border border-mist divide-y divide-mist">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between px-6 py-4">
            <span className="text-sm text-gray-500">{r.label}</span>
            <span className="text-sm font-medium text-navy">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}