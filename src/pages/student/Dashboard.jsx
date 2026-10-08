import { findStudent, firstName } from '../../data/mockData'

// PLACEHOLDER — replace with real data from Supabase later
const stats = {
  cgpa: '4.21',
  rank: '#7',
  classSize: 80,
  duesStatus: 'Cleared',
  sessionGpas: [
    { session: '100L', gpa: 3.85 },
    { session: '200L', gpa: 4.02 },
    { session: '300L', gpa: 4.45 },
    { session: '400L', gpa: 4.52 },
  ],
}

export default function Dashboard() {
  const student = findStudent(localStorage.getItem('regNumber'))

  const cards = [
    { label: 'CGPA', value: stats.cgpa },
    { label: 'Class rank', value: `${stats.rank} of ${stats.classSize}` },
    { label: 'Session dues', value: stats.duesStatus },
    { label: 'Level', value: student?.level || '—' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium text-navy">
          Hello, {student ? firstName(student.fullName) : 'Student'}
        </h2>
        <p className="text-sm text-gray-500">Here's your academic overview.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-mist p-5">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-medium text-navy mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* GPA by session */}
      <div className="bg-white rounded-2xl border border-mist p-6">
        <h3 className="text-sm font-medium text-navy mb-6">GPA by session</h3>
        <div className="flex items-end gap-6 h-40">
          {stats.sessionGpas.map((s) => (
            <div key={s.session} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-xs text-navy font-medium">{s.gpa.toFixed(2)}</span>
              <div
                className="w-full max-w-16 rounded-t-lg bg-navy"
                style={{ height: `${(s.gpa / 5) * 100}%` }}
              />
              <span className="text-xs text-gray-500">{s.session}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}