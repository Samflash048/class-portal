const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }

// rows: [{code, score, grade, units}] for ONE semester -> gpa
export function calcSemesterGpa(rows) {
  let qp = 0, units = 0
  const detail = rows.map((r) => {
    const pts = (GRADE_POINTS[r.grade] ?? 0) * r.units
    qp += pts; units += r.units
    return { ...r, points: pts }
  })
  return { gpa: units ? qp / units : 0, totalUnits: units, detail }
}

// rows: full list for one student, each with {session, semester}
// -> { cgpa, semesters: [{key, gpa, units}] }
export function calcCgpa(rows) {
  const groups = {}
  rows.forEach((r) => {
    const key = `${r.session} · sem ${r.semester}`
    ;(groups[key] ||= []).push(r)
  })
  let totalQP = 0, totalUnits = 0
  const semesters = Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, g]) => {
      const { gpa, totalUnits: u } = calcSemesterGpa(g)
      totalQP += gpa * u; totalUnits += u
      return { key, gpa, units: u }
    })
  return { cgpa: totalUnits ? totalQP / totalUnits : 0, semesters }
}

export function gradeClass(cgpa) {
  if (cgpa >= 4.5) return 'First class'
  if (cgpa >= 3.5) return 'Second class upper'
  if (cgpa >= 2.4) return 'Second class lower'
  if (cgpa >= 1.5) return 'Third class'
  return 'Pass'
}