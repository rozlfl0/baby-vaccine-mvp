const DAY = 24 * 60 * 60 * 1000
const templates = [
  { id: 'hepb-1', type: 'vaccination', title: 'B형간염 1차', monthOffset: 0 },
  { id: 'bcg', type: 'vaccination', title: 'BCG', monthOffset: 0, dayOffset: 28 },
  { id: 'checkup-1', type: 'checkup', title: '1차 영유아 건강검진', monthOffset: 4 },
]
function addMonths(date, months, days = 0) {
  const d = new Date(`${date}T09:00:00`)
  d.setMonth(d.getMonth() + months)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}
function assert(condition, message) {
  if (!condition) throw new Error(message)
}
function filterSchedules(items, filter, query = '') {
  return items.filter((item) => {
    const statusOk = filter.status === 'all' || item.status === filter.status
    const typeOk = filter.type === 'all' || item.type === filter.type
    const queryOk = !query || item.title.includes(query)
    return statusOk && typeOk && queryOk
  })
}
const child = { id: 'child-1', name: '테스트아기', birthDate: '2026-01-01' }
const schedules = templates.map((t) => ({ ...t, childId: child.id, dueDate: addMonths(child.birthDate, t.monthOffset, t.dayOffset), status: 'pending' }))
assert(schedules.length === 3, '자녀 등록 시 일정 생성 실패')
assert(schedules.every((s) => s.childId === child.id), '일정 childId 연결 실패')
const vaccination = schedules[0]
const completedAt = new Date(Date.now() - DAY - 60_000).toISOString()
vaccination.status = 'completed'
vaccination.completedAt = completedAt
vaccination.postCheckDueAt = new Date(new Date(completedAt).getTime() + DAY).toISOString()
const checks = []
const needs24hCheck = vaccination.type === 'vaccination' && vaccination.status === 'completed' && new Date(vaccination.postCheckDueAt).getTime() <= Date.now() && !checks.some((c) => c.scheduleItemId === vaccination.id && c.checkType === 'after_24h')
assert(needs24hCheck, '24시간 체크 필요 판정 실패')
checks.push({ scheduleItemId: vaccination.id, checkType: 'after_24h', temperature: 37.8, hasFever: true })
const stillNeeds24hCheck = !checks.some((c) => c.scheduleItemId === vaccination.id && c.checkType === 'after_24h')
assert(!stillNeeds24hCheck, '24시간 체크 기록 후 제거 실패')
assert(filterSchedules(schedules, { status: 'pending', type: 'checkup' }).length === 1, '검진/예정 필터 실패')
assert(filterSchedules(schedules, { status: 'all', type: 'vaccination' }, 'B형').length === 1, '검색 필터 실패')
console.log('logic smoke test passed: child schedules + 24h post-vaccination check + filters')
