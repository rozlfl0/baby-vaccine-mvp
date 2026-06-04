const DAY = 24 * 60 * 60 * 1000
const templates = [
  { id: 'hepb-1', type: 'vaccination', title: 'B형간염 1차', monthOffset: 0 },
  { id: 'bcg', type: 'vaccination', title: 'BCG', monthOffset: 0, dayOffset: 28 },
  { id: 'checkup-1', type: 'checkup', title: '1차 영유아 건강검진', monthOffset: 4 },
]
const pregnancyChecklistTemplates = [
  { id: 'early-confirmation', category: 'early', title: '임신확인서 받기', startWeek: 5, endWeek: 7 },
  { id: 'early-gov24', category: 'early', title: '정부24 맘편한 임신 신청', startWeek: 5, endWeek: 12 },
  { id: 'exam-basic', category: 'exam', title: '산전 기본검사', startWeek: 8, endWeek: 12 },
  { id: 'exam-diabetes', category: 'exam', title: '임신성 당뇨 검사', startWeek: 24, endWeek: 28 },
  { id: 'benefit-parent-pay', category: 'benefit', title: '부모급여' },
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
function pregnancyWeek(profile, now = new Date()) {
  if (profile.dueDate) {
    const due = new Date(`${profile.dueDate}T00:00:00`).getTime()
    return Math.min(42, Math.max(1, Math.floor((280 * DAY - (due - now.getTime())) / (7 * DAY)) + 1))
  }
  return profile.currentWeekInput
}
function visiblePregnancyItems(week) {
  return pregnancyChecklistTemplates.filter((item) => !week || item.category === 'benefit' || ((!item.startWeek || item.startWeek <= week + 2) && (!item.endWeek || item.endWeek >= week - 1)))
}
const profile = { dueDate: '2026-10-08', region: '서울', birthOrder: 'first' }
assert(pregnancyWeek(profile, new Date('2026-01-01T00:00:00')) === 1, '출산예정일 기반 임신 주차 계산 실패')
assert(pregnancyWeek({ currentWeekInput: 8 }) === 8, '현재 주차 입력 기반 계산 실패')
const week8Items = visiblePregnancyItems(8)
assert(week8Items.some((item) => item.id === 'early-gov24'), '임신 초기 체크리스트 노출 실패')
assert(week8Items.some((item) => item.category === 'benefit'), '혜택 체크리스트 상시 노출 실패')
assert(!week8Items.some((item) => item.id === 'exam-diabetes'), '먼 시기 검사 필터 실패')
let checklistStates = []
function togglePregnancyItem(itemId) {
  const existing = checklistStates.find((s) => s.itemId === itemId)
  checklistStates = existing ? checklistStates.map((s) => s.itemId === itemId ? { ...s, completed: !s.completed } : s) : [...checklistStates, { itemId, completed: true }]
}
togglePregnancyItem('early-gov24')
assert(checklistStates.some((s) => s.itemId === 'early-gov24' && s.completed), '임신 체크리스트 완료 처리 실패')
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
console.log('logic smoke test passed: pregnancy checklist + child schedules + 24h post-vaccination check + filters')
