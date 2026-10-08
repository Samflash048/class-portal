import { supabase } from './supabase'

export async function fetchMyResults(regNumber) {
  const { data: student } = await supabase
    .from('students').select('id').eq('reg_number', regNumber).single()
  if (!student) return []

  const { data } = await supabase
    .from('results')
    .select('semester, course_code, score, grade, sessions(name), courses(units)')
    .eq('student_id', student.id)
    .order('semester')

  return (data || []).map((r) => ({
    session: r.sessions.name,
    semester: r.semester,
    code: r.course_code,
    score: r.score,
    grade: r.grade,
    units: r.courses?.units ?? 3,
  }))
}

export async function fetchAllStudentResults() {
  const { data } = await supabase
    .from('results')
    .select('student_id, semester, course_code, score, grade, sessions(name), courses(units), students!inner(reg_number, full_name)')
  return data || []
}