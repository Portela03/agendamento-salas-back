export interface AcademicSemester {
  code: string
  name: string
  startClasses: string
  endClasses: string
  officialEnd: string
}

interface AcademicBlock {
  start: [number, number]
  end: [number, number]
  label: string
}

const SEMESTERS: Record<number, AcademicSemester[]> = {
  2026: [
    {
      code: '2026.1',
      name: '1o Semestre 2026',
      startClasses: '2026-02-04',
      endClasses: '2026-06-27',
      officialEnd: '2026-07-04',
    },
    {
      code: '2026.2',
      name: '2o Semestre 2026',
      startClasses: '2026-08-03',
      endClasses: '2026-12-14',
      officialEnd: '2026-12-21',
    },
  ],
}

const BLOCKS: Record<number, AcademicBlock[]> = {
  2026: [
    { start: [1, 1], end: [1, 1], label: 'Confraternizacao Universal' },
    { start: [2, 14], end: [2, 18], label: 'Carnaval / Quarta-Feira de Cinzas' },
    { start: [4, 3], end: [4, 4], label: 'Paixao de Cristo' },
    { start: [4, 20], end: [4, 21], label: 'Tiradentes' },
    { start: [5, 1], end: [5, 2], label: 'Dia do Trabalho' },
    { start: [6, 4], end: [6, 6], label: 'Corpus Christi' },
    { start: [7, 10], end: [7, 25], label: 'Recesso Academico - 1o Semestre' },
    { start: [9, 7], end: [9, 7], label: 'Independencia do Brasil' },
    { start: [10, 12], end: [10, 12], label: 'Nossa Sra. Aparecida' },
    { start: [10, 15], end: [10, 15], label: 'Dia do Professor' },
    { start: [10, 28], end: [10, 28], label: 'Dia do Servidor Publico' },
    { start: [11, 2], end: [11, 2], label: 'Finados' },
    { start: [11, 15], end: [11, 15], label: 'Proclamacao da Republica' },
    { start: [11, 20], end: [11, 21], label: 'Dia da Consciencia Negra' },
    { start: [12, 25], end: [12, 25], label: 'Natal' },
    { start: [12, 26], end: [12, 31], label: 'Recesso Academico - Fim de Ano' },
  ],
}

export function toDateKey(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function parseLocalDate(date: Date | string): Date {
  if (date instanceof Date) {
    const copy = new Date(date)
    copy.setHours(0, 0, 0, 0)
    return copy
  }

  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    const parsed = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    parsed.setHours(0, 0, 0, 0)
    return parsed
  }

  const parsed = new Date(date)
  parsed.setHours(0, 0, 0, 0)
  return parsed
}

export function getSemesterForDate(date: Date): AcademicSemester | null {
  const key = toDateKey(date)
  const semesters = SEMESTERS[date.getFullYear()]
  if (!semesters) return null

  return semesters.find((semester) => key >= semester.startClasses && key <= semester.endClasses) ?? null
}

export function getAcademicBlock(date: Date): string | null {
  const blocks = BLOCKS[date.getFullYear()]
  if (!blocks) return null

  const key = toDateKey(date)
  const block = blocks.find((item) => {
    const start = new Date(date.getFullYear(), item.start[0] - 1, item.start[1])
    const end = new Date(date.getFullYear(), item.end[0] - 1, item.end[1])
    return key >= toDateKey(start) && key <= toDateKey(end)
  })

  return block?.label ?? null
}

export function isOutsideClassPeriod(date: Date): boolean {
  return getSemesterForDate(date) === null
}

export function isBlockedAcademicDate(date: Date): string | null {
  if (date.getDay() === 0) return 'Domingo'
  const block = getAcademicBlock(date)
  if (block) return block
  if (isOutsideClassPeriod(date)) return 'Fora do periodo letivo'
  return null
}

export function generateWeeklyDatesUntilSemesterEnd(startDate: Date): Date[] {
  const semester = getSemesterForDate(startDate)
  if (!semester) return []

  const end = parseLocalDate(semester.endClasses)
  const dates: Date[] = []
  const cursor = new Date(startDate)
  cursor.setHours(0, 0, 0, 0)

  while (cursor <= end) {
    dates.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 7)
  }

  return dates
}
