export default function Profile() {
  const regNumber = localStorage.getItem('regNumber') || '—'
  const fullName = localStorage.getItem('fullName') || '—'

  const rows = [
    { label: 'Full name', value: fullName },
    { label: 'Registration number', value: regNumber },
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