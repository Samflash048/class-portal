import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

/* ---------- helpers ---------- */
function parseCsv(text) {
  // accepts: course_code,reg_number,score,grade per line
  return text.trim().split(/\r?\n/).slice(1).map((line) => {
    const [course_code, reg_number, score, grade] = line.split(',').map((s) => s.trim())
    return { course_code, reg_number: reg_number?.toUpperCase(), score: parseInt(score), grade: grade?.toUpperCase() }
  }).filter((r) => r.course_code && r.reg_number && !isNaN(r.score) && r.grade)
}

function makeCode() {
  return 'CP-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

/* ---------- upload results tab ---------- */
function UploadTab() {
  const [text, setText] = useState('')
  const [msg, setMsg] = useState(null)

  async function handleUpload() {
    const rows = parseCsv(text)
    if (!rows.length) { setMsg({ ok: false, text: 'No valid rows. Expected header: course_code,reg_number,score,grade' }); return }

    // look up current session + student ids + course units
    const { data: session } = await supabase.from('sessions').select('id').eq('is_current', true).single()
    const { data: students } = await supabase.from('students').select('id, reg_number')
    const idByReg = Object.fromEntries(students.map((s) => [s.reg_number, s.id]))
    const codes = [...new Set(rows.map((r) => r.course_code))]
    await supabase.from('courses').upsert(codes.map((c) => ({ course_code: c })), { onConflict: 'course_code' })

    const payload = rows
      .filter((r) => idByReg[r.reg_number])
      .map((r) => ({
        student_id: idByReg[r.reg_number], session_id: session.id,
        semester: 1, course_code: r.course_code, score: r.score, grade: r.grade,
      }))
    const skipped = rows.length - payload.length

    const { error } = await supabase.from('results').upsert(payload, {
      onConflict: 'student_id,session_id,semester,course_code',
    })
    setMsg(error
      ? { ok: false, text: `Error: ${error.message}` }
      : { ok: true, text: `Uploaded ${payload.length} results.${skipped ? ` Skipped ${skipped} unknown reg number(s).` : ''}` })
  }

  return (
    <section id="tab-upload" className="bg-white rounded-2xl border border-mist p-6 space-y-4">
      <h2 className="text-lg font-medium text-navy">Upload results (CSV)</h2>
      <p className="text-sm text-gray-500">
        Paste CSV with header <code className="bg-mist px-1 rounded">course_code,reg_number,score,grade</code> — same format as your result files. Existing rows for the same course + student are overwritten.
      </p>
      <textarea value={text} onChange={(e) => { setText(e.target.value); setMsg(null) }} rows={8}
        placeholder={'course_code,reg_number,score,grade\nMTH121,2022/247147,55,C\nMTH121,2022/247614,40,E'}
        className="w-full rounded-xl border border-mist px-4 py-3 text-sm font-mono text-navy focus:outline-none focus:ring-2 focus:ring-accent" />
      <div className="flex items-center gap-4">
        <button onClick={handleUpload}
          className="rounded-xl bg-navy text-white px-6 py-2.5 text-sm font-medium hover:bg-navy-light transition-colors">
          Upload
        </button>
        {msg && <p className={`text-sm ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</p>}
      </div>
    </section>
  )
}

/* ---------- session codes tab ---------- */
function CodesTab() {
    const [students, setStudents] = useState([])
  const [msg, setMsg] = useState('')

  async function load() {
    const { data } = await supabase.from('students').select('reg_number, full_name, session_code').order('reg_number')
    setStudents(data || [])
  }
  useEffect(() => { load() }, [])

  async function generateMissing() {
    const missing = students.filter((s) => !s.session_code)
    for (const s of missing) {
      await supabase.from('students').update({ session_code: makeCode() }).eq('reg_number', s.reg_number)
    }
    setMsg(`Generated codes for ${missing.length} student(s).`)
    load()
  }

  return (
    <section id="tab-codes" className="bg-white rounded-2xl border border-mist p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-navy">Session codes</h2>
        <button onClick={generateMissing}
          className="rounded-xl bg-accent text-navy px-5 py-2 text-sm font-medium hover:bg-accent-dark transition-colors">
          Generate missing codes
        </button>
      </div>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      <p className="text-sm text-gray-500">{students.filter((s) => !s.session_code).length} of {students.length} students still need a code.</p>
      <div className="max-h-80 overflow-y-auto border border-mist rounded-xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-xs text-gray-500 border-b border-mist">
              <th className="px-4 py-2 font-medium">Reg number</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist">
            {students.map((s) => (
              <tr key={s.reg_number}>
                <td className="px-4 py-2 text-gray-600">{s.reg_number}</td>
                <td className="px-4 py-2 font-medium text-navy">{s.full_name}</td>
                <td className="px-4 py-2 font-mono text-xs">{s.session_code || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ---------- dues tab ---------- */
const LEVELS = ['100', '200', '300', '400']

function DuesTab() {
  const [amounts, setAmounts] = useState({ 100: 1000, 200: 1000, 300: 2000, 400: 2000 })
  const [payReg, setPayReg] = useState('')
  const [payLevel, setPayLevel] = useState('400')
  const [msg, setMsg] = useState(null)

  async function applyAmounts() {
    const { data: students } = await supabase.from('students').select('id')
    const payload = students.flatMap((s) =>
      LEVELS.map((lvl) => ({ student_id: s.id, level: lvl, amount_due: amounts[lvl] })))
    const { error } = await supabase.from('dues').upsert(payload, { onConflict: 'student_id,level' })
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `Dues structure saved for ${students.length} students.` })
  }

  async function recordPayment() {
    const { data: student } = await supabase.from('students').select('id').eq('reg_number', payReg.trim().toUpperCase()).single()
    if (!student) { setMsg({ ok: false, text: 'Reg number not found.' }); return }
    const { error } = await supabase.from('dues').update({ amount_paid: amounts[payLevel] })
      .eq('student_id', student.id).eq('level', payLevel)
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: `Payment recorded for ${payReg.toUpperCase()} (${payLevel}L).` })
  }

  return (
    <section id="tab-dues" className="bg-white rounded-2xl border border-mist p-6 space-y-6">
      <h2 className="text-lg font-medium text-navy">Manage dues</h2>

      <div>
        <h3 className="text-sm font-medium text-navy mb-3">Amount due per level</h3>
        <div className="flex gap-3 items-end flex-wrap">
          {LEVELS.map((lvl) => (
            <label key={lvl} className="text-xs text-gray-500">
              {lvl}L (₦)
              <input type="number" value={amounts[lvl]} onChange={(e) => setAmounts({ ...amounts, [lvl]: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-24 rounded-xl border border-mist px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent" />
            </label>
          ))}
          <button onClick={applyAmounts} className="rounded-xl bg-navy text-white px-5 py-2 text-sm font-medium hover:bg-navy-light transition-colors">
            Apply to all students
          </button>
        </div>
      </div>

      <div className="border-t border-mist pt-6">
        <h3 className="text-sm font-medium text-navy mb-3">Record a full payment</h3>
        <div className="flex gap-3 flex-wrap">
          <input value={payReg} onChange={(e) => setPayReg(e.target.value)} placeholder="Reg number"
            className="rounded-xl border border-mist px-4 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-accent" />
          <select value={payLevel} onChange={(e) => setPayLevel(e.target.value)}
            className="rounded-xl border border-mist px-4 py-2 text-sm text-navy">
            {LEVELS.map((l) => <option key={l} value={l}>{l}L</option>)}
          </select>
          <button onClick={recordPayment} className="rounded-xl bg-accent text-navy px-5 py-2 text-sm font-medium hover:bg-accent-dark transition-colors">
            Mark paid
          </button>
        </div>
      </div>

      {msg && <p className={`text-sm ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</p>}
    </section>
  )
}

/* ---------- dues monitor tab ---------- */
function DuesMonitor() {
  const [level, setLevel] = useState('400')
  const [rows, setRows] = useState([])
  const [totals, setTotals] = useState({ collected: 0, outstanding: 0 })

  useEffect(() => { load(level) }, [level])

  async function load(lvl) {
    const { data: students } = await supabase
      .from('students').select('id, reg_number, full_name').order('reg_number')
    const { data: dues } = await supabase
      .from('dues').select('student_id, amount_due, amount_paid').eq('level', lvl)

    const dueByStudent = Object.fromEntries((dues || []).map((d) => [d.student_id, d]))
    const merged = students.map((s) => {
      const d = dueByStudent[s.id]
      return {
        ...s,
        due: d?.amount_due ?? 0,
        paid: d?.amount_paid ?? 0,
        status: !d ? 'Not billed' : d.amount_paid >= d.amount_due ? 'Paid' : 'Outstanding',
      }
    })

    setRows(merged)
    setTotals({
      collected: merged.reduce((a, r) => a + r.paid, 0),
      outstanding: merged.reduce((a, r) => a + Math.max(0, r.due - r.paid), 0),
    })
  }

  const STATUS_STYLES = {
    Paid: 'bg-green-100 text-green-800',
    Outstanding: 'bg-red-100 text-red-700',
    'Not billed': 'bg-mist text-gray-500',
  }

  return (
    <section id="tab-monitor" className="bg-white rounded-2xl border border-mist p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-medium text-navy">Dues monitor</h2>
        <select value={level} onChange={(e) => setLevel(e.target.value)}
          className="rounded-xl border border-mist px-4 py-2 text-sm text-navy">
          {['100', '200', '300', '400'].map((l) => <option key={l} value={l}>{l}L</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-mist rounded-xl p-4">
          <p className="text-xs text-gray-500">Collected · {level}L</p>
          <p className="text-xl font-medium text-navy">₦{totals.collected.toLocaleString()}</p>
        </div>
        <div className="bg-mist rounded-xl p-4">
          <p className="text-xs text-gray-500">Outstanding · {level}L</p>
          <p className="text-xl font-medium text-red-700">₦{totals.outstanding.toLocaleString()}</p>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto border border-mist rounded-xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-xs text-gray-500 border-b border-mist">
              <th className="px-4 py-2 font-medium">Reg number</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium text-right">Paid</th>
              <th className="px-4 py-2 font-medium text-right">Due</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist">
            {rows.map((r) => (
              <tr key={r.reg_number}>
                <td className="px-4 py-2 text-gray-600">{r.reg_number}</td>
                <td className="px-4 py-2 font-medium text-navy">{r.full_name}</td>
                <td className="px-4 py-2 text-right text-gray-600">₦{r.paid.toLocaleString()}</td>
                <td className="px-4 py-2 text-right text-gray-600">₦{r.due.toLocaleString()}</td>
                <td className="px-4 py-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ---------- settings tab ---------- */
function SettingsTab() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    supabase.from('sessions').select('leaderboard_visible').eq('is_current', true).single()
      .then(({ data }) => setVisible(data?.leaderboard_visible ?? true))
  }, [])

  async function toggle() {
    const next = !visible
    await supabase.from('sessions').update({ leaderboard_visible: next }).eq('is_current', true)
    setVisible(next)
  }

  return (
    <section id="tab-settings" className="bg-white rounded-2xl border border-mist p-6">
      <h2 className="text-lg font-medium text-navy mb-4">Settings</h2>
      <label className="flex items-center gap-3 text-sm text-navy cursor-pointer">
        <input type="checkbox" checked={visible} onChange={toggle} className="accent-[#1B2A49] w-4 h-4" />
        Leaderboard visible to students
      </label>
      <p className="text-xs text-gray-400 mt-2">When off, students only see their own position.</p>
    </section>
  )
}

/* ---------- page ---------- */
export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-medium text-navy">Admin dashboard</h1>
      <UploadTab />
      <CodesTab />
      <DuesTab />
      <DuesMonitor />
      <SettingsTab />
    </div>
  )
}