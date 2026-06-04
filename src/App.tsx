import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Gender = 'male' | 'female' | 'unknown'
type ItemType = 'vaccination' | 'checkup'
type ScheduleStatus = 'pending' | 'completed'
type CheckType = 'immediate' | 'after_24h'
type StatusFilter = 'all' | ScheduleStatus
type TypeFilter = 'all' | ItemType

type Child = { id: string; name: string; birthDate: string; gender: Gender; createdAt: string }
type ScheduleTemplate = { id: string; type: ItemType; title: string; monthOffset: number; dayOffset?: number; endMonthOffset?: number; endDayOffset?: number; recommendedAgeLabel: string; description?: string; sourceName: string; sourceUrl: string; version: string }
type ScheduleItem = { id: string; childId: string; templateId: string; type: ItemType; title: string; recommendedAgeLabel: string; description?: string; dueDate: string; endDate?: string; status: ScheduleStatus; completedAt?: string; postCheckDueAt?: string; memo?: string; sourceName: string; sourceUrl: string; version: string }
type PostVaccinationCheck = { id: string; childId: string; scheduleItemId: string; checkType: CheckType; checkedAt: string; temperature?: number; hasFever: boolean; condition: 'normal' | 'slightly_fussy' | 'very_fussy' | 'lethargic'; feeding: 'normal' | 'reduced' | 'poor'; injectionSite: 'normal' | 'redness' | 'swelling' | 'severe_swelling'; symptoms: string[]; memo?: string }
type PregnancyCategory = 'early' | 'exam' | 'preparation' | 'benefit'
type BirthOrder = 'first' | 'second_or_more' | 'unknown'
type PregnancyProfile = { id: string; dueDate?: string; currentWeekInput?: number; region?: string; birthOrder: BirthOrder; createdAt: string; updatedAt: string }
type PregnancyChecklistItem = { id: string; category: PregnancyCategory; title: string; description?: string; startWeek?: number; endWeek?: number; officialCheckRequired?: boolean; recommendation?: string }
type ChecklistState = { itemId: string; completed: boolean; completedAt?: string; memo?: string }
type AppData = { pregnancyProfile?: PregnancyProfile; pregnancyChecklistStates: ChecklistState[]; children: Child[]; schedules: ScheduleItem[]; checks: PostVaccinationCheck[] }

const STORAGE_KEY = 'baby-vaccine-mvp-v1'
const DAY = 24 * 60 * 60 * 1000
const KDCA = '질병관리청 예방접종도우미 표준 예방접종 일정표'
const KDCA_URL = 'https://nip.kdca.go.kr/irhp/infm/goVcntInfo.do?menuLv=1&menuCd=115'
const NHIS = '국민건강보험공단 영유아 건강검진 안내'
const NHIS_URL = 'https://www.nhis.or.kr/nhis/healthin/wbhaca04800m01.do'
const templates: ScheduleTemplate[] = [
  { id: 'hepb-1', type: 'vaccination', title: 'B형간염 1차', monthOffset: 0, recommendedAgeLabel: '출생 직후', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'bcg', type: 'vaccination', title: 'BCG', monthOffset: 0, dayOffset: 28, recommendedAgeLabel: '생후 4주 이내', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'hepb-2', type: 'vaccination', title: 'B형간염 2차', monthOffset: 1, recommendedAgeLabel: '생후 1개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'dtap-1', type: 'vaccination', title: 'DTaP 1차', monthOffset: 2, recommendedAgeLabel: '생후 2개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'ipv-1', type: 'vaccination', title: 'IPV 1차', monthOffset: 2, recommendedAgeLabel: '생후 2개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'hib-1', type: 'vaccination', title: 'Hib 1차', monthOffset: 2, recommendedAgeLabel: '생후 2개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'pcv-1', type: 'vaccination', title: '폐렴구균 1차', monthOffset: 2, recommendedAgeLabel: '생후 2개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'rota-1', type: 'vaccination', title: '로타바이러스 1차', monthOffset: 2, recommendedAgeLabel: '생후 2개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'dtap-2', type: 'vaccination', title: 'DTaP 2차', monthOffset: 4, recommendedAgeLabel: '생후 4개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'ipv-2', type: 'vaccination', title: 'IPV 2차', monthOffset: 4, recommendedAgeLabel: '생후 4개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'hib-2', type: 'vaccination', title: 'Hib 2차', monthOffset: 4, recommendedAgeLabel: '생후 4개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'pcv-2', type: 'vaccination', title: '폐렴구균 2차', monthOffset: 4, recommendedAgeLabel: '생후 4개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'dtap-3', type: 'vaccination', title: 'DTaP 3차', monthOffset: 6, recommendedAgeLabel: '생후 6개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'ipv-3', type: 'vaccination', title: 'IPV 3차', monthOffset: 6, recommendedAgeLabel: '생후 6개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'hib-3', type: 'vaccination', title: 'Hib 3차', monthOffset: 6, recommendedAgeLabel: '생후 6개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'pcv-3', type: 'vaccination', title: '폐렴구균 3차', monthOffset: 6, recommendedAgeLabel: '생후 6개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'hepb-3', type: 'vaccination', title: 'B형간염 3차', monthOffset: 6, recommendedAgeLabel: '생후 6개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'mmr-1', type: 'vaccination', title: 'MMR 1차', monthOffset: 12, recommendedAgeLabel: '생후 12~15개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'var-1', type: 'vaccination', title: '수두 1회', monthOffset: 12, recommendedAgeLabel: '생후 12~15개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'hepa-1', type: 'vaccination', title: 'A형간염 1차', monthOffset: 12, recommendedAgeLabel: '생후 12~23개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'hib-booster', type: 'vaccination', title: 'Hib 추가접종', monthOffset: 12, recommendedAgeLabel: '생후 12~15개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'pcv-booster', type: 'vaccination', title: '폐렴구균 추가접종', monthOffset: 12, recommendedAgeLabel: '생후 12~15개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'dtap-4', type: 'vaccination', title: 'DTaP 추가접종', monthOffset: 15, recommendedAgeLabel: '생후 15~18개월', sourceName: KDCA, sourceUrl: KDCA_URL, version: '2024-01-15 page review' },
  { id: 'checkup-1', type: 'checkup', title: '1차 영유아 건강검진', monthOffset: 0, dayOffset: 14, endMonthOffset: 1, endDayOffset: 4, recommendedAgeLabel: '생후 14~35일', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'checkup-2', type: 'checkup', title: '2차 영유아 건강검진', monthOffset: 4, endMonthOffset: 6, recommendedAgeLabel: '생후 4~6개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'checkup-3', type: 'checkup', title: '3차 영유아 건강검진', monthOffset: 9, endMonthOffset: 12, recommendedAgeLabel: '생후 9~12개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'checkup-4', type: 'checkup', title: '4차 영유아 건강검진', monthOffset: 18, endMonthOffset: 24, recommendedAgeLabel: '생후 18~24개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'oral-1', type: 'checkup', title: '1차 영유아 구강검진', monthOffset: 18, endMonthOffset: 29, recommendedAgeLabel: '생후 18~29개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'checkup-5', type: 'checkup', title: '5차 영유아 건강검진', monthOffset: 30, endMonthOffset: 36, recommendedAgeLabel: '생후 30~36개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'oral-2', type: 'checkup', title: '2차 영유아 구강검진', monthOffset: 30, endMonthOffset: 41, recommendedAgeLabel: '생후 30~41개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'checkup-6', type: 'checkup', title: '6차 영유아 건강검진', monthOffset: 42, endMonthOffset: 48, recommendedAgeLabel: '생후 42~48개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'oral-3', type: 'checkup', title: '3차 영유아 구강검진', monthOffset: 42, endMonthOffset: 53, recommendedAgeLabel: '생후 42~53개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'checkup-7', type: 'checkup', title: '7차 영유아 건강검진', monthOffset: 54, endMonthOffset: 60, recommendedAgeLabel: '생후 54~60개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'oral-4', type: 'checkup', title: '4차 영유아 구강검진', monthOffset: 54, endMonthOffset: 65, recommendedAgeLabel: '생후 54~65개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
  { id: 'checkup-8', type: 'checkup', title: '8차 영유아 건강검진', monthOffset: 66, endMonthOffset: 71, recommendedAgeLabel: '생후 66~71개월', sourceName: NHIS, sourceUrl: NHIS_URL, version: 'NHIS page' },
]

const pregnancyChecklistTemplates: PregnancyChecklistItem[] = [
  { id: 'early-confirmation', category: 'early', title: '임신확인서 받기', description: '병원에서 임신 확인 후 임신확인서를 받아 이후 지원 신청에 사용합니다.', startWeek: 5, endWeek: 7, officialCheckRequired: true },
  { id: 'early-register', category: 'early', title: '임산부 등록', description: '병원 또는 온라인/국민건강보험 경로로 임산부 등록 여부를 확인합니다.', startWeek: 5, endWeek: 8, officialCheckRequired: true },
  { id: 'early-gov24', category: 'early', title: '정부24 맘편한 임신 신청', description: '보건소 방문이 어렵다면 정부24 맘편한 임신 원스톱 서비스를 확인합니다.', startWeek: 5, endWeek: 12, officialCheckRequired: true },
  { id: 'early-folic', category: 'early', title: '엽산제 지원 확인', description: '보건소/지자체 임산부 영양제 지원을 확인합니다.', startWeek: 5, endWeek: 12, officialCheckRequired: true, recommendation: '엽산 복용 기록/영양제 준비 영역으로 확장 가능' },
  { id: 'early-iron', category: 'early', title: '철분제 지원 확인', description: '보통 임신 중기 이후 철분제 지원을 확인합니다.', startWeek: 16, endWeek: 40, officialCheckRequired: true },
  { id: 'early-card', category: 'early', title: '국민행복카드 신청', description: '임신·출산 진료비 지원과 첫만남이용권 등 바우처 사용을 위해 확인합니다.', startWeek: 5, endWeek: 12, officialCheckRequired: true },
  { id: 'exam-first-ultrasound', category: 'exam', title: '임신 확인/초음파', description: '임신낭/심박 확인 등 첫 산부인과 진료 메모를 남겨보세요.', startWeek: 5, endWeek: 7 },
  { id: 'exam-basic', category: 'exam', title: '산전 기본검사', description: '혈액/소변/빈혈/갑상선 등 병원 안내에 따른 기본검사를 확인합니다.', startWeek: 8, endWeek: 12, officialCheckRequired: true },
  { id: 'exam-nt', category: 'exam', title: '1차 기형아 검사', description: '목투명대 검사 등 병원에서 안내받은 일정을 기록합니다.', startWeek: 11, endWeek: 13, officialCheckRequired: true },
  { id: 'exam-second', category: 'exam', title: '2차 기형아 검사', description: '2차 선별검사 시기와 결과 메모를 남깁니다.', startWeek: 16, endWeek: 18, officialCheckRequired: true },
  { id: 'exam-detail', category: 'exam', title: '정밀 초음파', description: '20주 전후 정밀 초음파 예약/검사 여부를 확인합니다.', startWeek: 20, endWeek: 22, officialCheckRequired: true },
  { id: 'exam-diabetes', category: 'exam', title: '임신성 당뇨 검사', description: '24~28주 검사 예약과 병원 안내사항을 확인합니다.', startWeek: 24, endWeek: 28, officialCheckRequired: true },
  { id: 'exam-final', category: 'exam', title: '막달 검사/분만 준비', description: '35~37주 전후 막달 검사와 분만 병원 안내를 확인합니다.', startWeek: 35, endWeek: 37, officialCheckRequired: true },
  { id: 'prep-care-center', category: 'preparation', title: '산후조리원 예약', description: '원하는 곳은 빠르게 마감될 수 있어 후보를 비교하고 예약 여부를 체크합니다.', startWeek: 8, endWeek: 20 },
  { id: 'prep-helper', category: 'preparation', title: '산후관리사 업체 알아보기', description: '업체 예약과 정부지원 신청은 별도로 필요할 수 있습니다.', startWeek: 24, endWeek: 34, officialCheckRequired: true },
  { id: 'prep-bag', category: 'preparation', title: '출산가방 준비', description: '신분증, 산모수첩, 충전기, 아기 퇴원복 등 기본 준비물을 점검합니다.', startWeek: 32, endWeek: 38, recommendation: '출산가방 아이템 추천/제휴 영역으로 확장 가능' },
  { id: 'prep-baby-items', category: 'preparation', title: '아기용품 기본 준비', description: '기저귀, 물티슈, 젖병, 체온계, 카시트 등 필요한 물품을 정리합니다.', startWeek: 28, endWeek: 38, recommendation: '체온계/카시트/기저귀 추천 영역으로 확장 가능' },
  { id: 'benefit-first-card', category: 'benefit', title: '임신·출산 진료비 지원', description: '지원 금액/조건은 변경될 수 있으니 공식 안내를 확인합니다.', officialCheckRequired: true },
  { id: 'benefit-first-meeting', category: 'benefit', title: '첫만남이용권', description: '출생 후 신청할 바우처 항목으로 미리 체크해둡니다.', officialCheckRequired: true },
  { id: 'benefit-parent-pay', category: 'benefit', title: '부모급여', description: '출생 후 60일 내 신청하면 소급 적용 여부가 중요할 수 있습니다.', officialCheckRequired: true },
  { id: 'benefit-child-allowance', category: 'benefit', title: '아동수당', description: '출산 후 신청할 지원 항목입니다.', officialCheckRequired: true },
  { id: 'benefit-local', category: 'benefit', title: '지역 출산축하금/산후조리비', description: '거주지역 주민센터/보건소/지자체 기준으로 확인합니다.', officialCheckRequired: true },
  { id: 'benefit-train', category: 'benefit', title: 'KTX/SRT 임산부 할인', description: '임산부와 동반 1인 혜택 조건을 확인합니다.', officialCheckRequired: true },
]

const newId = () => crypto.randomUUID()
const todayInput = () => new Date().toISOString().slice(0, 10)
const nowLocalInput = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
function addMonths(date: string, months: number, days = 0) { const d = new Date(`${date}T09:00:00`); d.setMonth(d.getMonth() + months); d.setDate(d.getDate() + days); return d.toISOString() }
function formatDate(iso: string) { return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(iso)) }
function formatDateTime(iso: string) { return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) }
function dday(iso: string) { const diff = Math.ceil((new Date(iso).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / DAY); return diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}` }
function ageLabel(birthDate: string) { const days = Math.max(0, Math.floor((Date.now() - new Date(`${birthDate}T00:00:00`).getTime()) / DAY)); const months = Math.floor(days / 30.44); return months < 1 ? `생후 ${days}일` : `생후 약 ${months}개월` }
function generateSchedules(child: Child): ScheduleItem[] { return templates.map((t) => ({ id: newId(), childId: child.id, templateId: t.id, type: t.type, title: t.title, recommendedAgeLabel: t.recommendedAgeLabel, description: t.description, dueDate: addMonths(child.birthDate, t.monthOffset, t.dayOffset), endDate: t.endMonthOffset !== undefined ? addMonths(child.birthDate, t.endMonthOffset, t.endDayOffset) : undefined, status: 'pending', sourceName: t.sourceName, sourceUrl: t.sourceUrl, version: t.version })) }
function filterSchedules(items: ScheduleItem[], statusFilter: StatusFilter, typeFilter: TypeFilter, query: string) { const q = query.trim().toLowerCase(); return items.filter((s) => (statusFilter === 'all' || s.status === statusFilter) && (typeFilter === 'all' || s.type === typeFilter) && (!q || s.title.toLowerCase().includes(q) || s.recommendedAgeLabel.toLowerCase().includes(q))) }
function migrateData(parsed?: Partial<AppData>): AppData { return { pregnancyProfile: parsed?.pregnancyProfile, pregnancyChecklistStates: parsed?.pregnancyChecklistStates ?? [], children: parsed?.children ?? [], schedules: parsed?.schedules ?? [], checks: parsed?.checks ?? [] } }
function loadData(): AppData { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return migrateData(JSON.parse(raw)) } catch {} return migrateData() }
function pregnancyWeek(profile?: PregnancyProfile) { if (!profile) return undefined; if (profile.dueDate) { const due = new Date(`${profile.dueDate}T00:00:00`).getTime(); return Math.min(42, Math.max(1, Math.floor((280 * DAY - (due - Date.now())) / (7 * DAY)) + 1)) } return profile.currentWeekInput }
function dueDday(profile?: PregnancyProfile) { if (!profile?.dueDate) return '예정일 미입력'; return dday(`${profile.dueDate}T00:00:00`) }
function visiblePregnancyItems(week?: number) { return pregnancyChecklistTemplates.filter((item) => !week || item.category === 'benefit' || ((!item.startWeek || item.startWeek <= week + 2) && (!item.endWeek || item.endWeek >= week - 1))) }
function categoryLabel(category: PregnancyCategory) { return { early: '초기 필수', exam: '검사/진료', preparation: '출산 준비', benefit: '혜택/지원' }[category] }

function MedicalDisclaimer() { return <div className="disclaimer">이 앱은 의료 진단을 제공하지 않습니다. 접종·검진 일정은 개발용 임시 데이터이며, 실제 일정과 아이 상태는 반드시 소아청소년과/공식 기관 안내를 확인하세요.</div> }
function icsDate(iso: string) { return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' }
function escapeIcs(text: string) { return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n') }
function downloadIcs(items: ScheduleItem[], children: Child[], filename: string) {
  const events = items.map((s) => {
    const child = children.find((c) => c.id === s.childId)
    const start = icsDate(s.dueDate)
    const endBase = s.endDate ? new Date(s.endDate) : new Date(+new Date(s.dueDate) + 60 * 60 * 1000)
    const end = icsDate(endBase.toISOString())
    const summary = `[${child?.name ?? '아이'}] ${s.title}${s.status === 'completed' ? ' (완료)' : ''}`
    const desc = `${s.recommendedAgeLabel}\n출처: ${s.sourceName}\n${s.sourceUrl}\n※ 최종 일정은 의료진/공식기관 확인 필요`
    return [`BEGIN:VEVENT`, `UID:${s.id}@baby-vaccine-mvp`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${escapeIcs(summary)}`, `DESCRIPTION:${escapeIcs(desc)}`, `END:VEVENT`].join('\r\n')
  })
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Baby Vaccine MVP//KO', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n')
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}


function App() {
  const [data, setData] = useState<AppData>(loadData)
  const [selectedChildId, setSelectedChildId] = useState('')
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [mode, setMode] = useState<'start' | 'pregnancySetup' | 'pregnancy' | 'home' | 'child' | 'detail' | 'postCheck'>('start')
  const [checkType, setCheckType] = useState<CheckType>('after_24h')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [query, setQuery] = useState('')
  const [pregnancyCategory, setPregnancyCategory] = useState<PregnancyCategory>('early')
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data])
  useEffect(() => { if (!selectedChildId && data.children[0]) setSelectedChildId(data.children[0].id) }, [data.children, selectedChildId])
  const selectedChild = data.children.find((c) => c.id === selectedChildId)
  const selectedSchedule = data.schedules.find((s) => s.id === selectedScheduleId)
  const upcoming = useMemo(() => data.schedules.filter((s) => s.status === 'pending').sort((a,b) => +new Date(a.dueDate) - +new Date(b.dueDate)).slice(0, 6), [data.schedules])
  const duePostChecks = useMemo(() => data.schedules.filter((s) => s.type === 'vaccination' && s.status === 'completed' && s.postCheckDueAt && +new Date(s.postCheckDueAt) <= Date.now() && !data.checks.some((c) => c.scheduleItemId === s.id && c.checkType === 'after_24h')), [data.schedules, data.checks])
  const stats = useMemo(() => ({ total: data.schedules.length, pending: data.schedules.filter((s) => s.status === 'pending').length, completed: data.schedules.filter((s) => s.status === 'completed').length, checks: data.checks.length }), [data])
  const currentWeek = pregnancyWeek(data.pregnancyProfile)
  const pregnancyItems = useMemo(() => visiblePregnancyItems(currentWeek), [currentWeek])
  const pregnancyDone = data.pregnancyChecklistStates.filter((state) => state.completed).length
  const pregnancyTotal = pregnancyChecklistTemplates.length

  function savePregnancyProfile(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = new FormData(e.currentTarget); const dueDate = String(form.get('dueDate') || ''); const weekRaw = Number(form.get('currentWeekInput')); const profile: PregnancyProfile = { id: data.pregnancyProfile?.id ?? newId(), dueDate: dueDate || undefined, currentWeekInput: dueDate ? undefined : (weekRaw || undefined), region: String(form.get('region') || '').trim() || undefined, birthOrder: String(form.get('birthOrder') || 'unknown') as BirthOrder, createdAt: data.pregnancyProfile?.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() }; setData((prev) => ({ ...prev, pregnancyProfile: profile })); setMode('pregnancy') }
  function togglePregnancyItem(itemId: string) { setData((prev) => { const existing = prev.pregnancyChecklistStates.find((s) => s.itemId === itemId); const next = existing ? prev.pregnancyChecklistStates.map((s) => s.itemId === itemId ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date().toISOString() : undefined } : s) : [...prev.pregnancyChecklistStates, { itemId, completed: true, completedAt: new Date().toISOString() }]; return { ...prev, pregnancyChecklistStates: next } }) }
  function isPregnancyDone(itemId: string) { return data.pregnancyChecklistStates.some((state) => state.itemId === itemId && state.completed) }
  function addChild(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = new FormData(e.currentTarget); const name = String(form.get('name') || '').trim(); const birthDate = String(form.get('birthDate') || ''); const gender = String(form.get('gender') || 'unknown') as Gender; if (!name || !birthDate) return; const child: Child = { id: newId(), name, birthDate, gender, createdAt: new Date().toISOString() }; setData((prev) => ({ ...prev, children: [...prev.children, child], schedules: [...prev.schedules, ...generateSchedules(child)] })); setSelectedChildId(child.id); setMode('child'); e.currentTarget.reset() }
  function completeSchedule(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (!selectedSchedule) return; const form = new FormData(e.currentTarget); const completedAt = new Date(String(form.get('completedAt'))).toISOString(); const memo = String(form.get('memo') || ''); const postCheckDueAt = selectedSchedule.type === 'vaccination' ? new Date(+new Date(completedAt) + DAY).toISOString() : undefined; setData((prev) => ({ ...prev, schedules: prev.schedules.map((s) => s.id === selectedSchedule.id ? { ...s, status: 'completed', completedAt, postCheckDueAt, memo } : s) })) }
  function savePostCheck(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (!selectedSchedule) return; const form = new FormData(e.currentTarget); const check: PostVaccinationCheck = { id: newId(), childId: selectedSchedule.childId, scheduleItemId: selectedSchedule.id, checkType, checkedAt: new Date().toISOString(), temperature: Number(form.get('temperature')) || undefined, hasFever: form.get('hasFever') === 'yes', condition: String(form.get('condition') || 'normal') as PostVaccinationCheck['condition'], feeding: String(form.get('feeding') || 'normal') as PostVaccinationCheck['feeding'], injectionSite: String(form.get('injectionSite') || 'normal') as PostVaccinationCheck['injectionSite'], symptoms: form.getAll('symptoms').map(String), memo: String(form.get('memo') || '') }; setData((prev) => ({ ...prev, checks: [...prev.checks, check] })); setMode('detail') }
  function addSampleData() { const first: Child = { id: newId(), name: '첫째테스트', birthDate: '2024-11-15', gender: 'unknown', createdAt: new Date().toISOString() }; const second: Child = { id: newId(), name: '둘째테스트', birthDate: '2026-05-01', gender: 'unknown', createdAt: new Date().toISOString() }; const schedules = [...generateSchedules(first), ...generateSchedules(second)]; setData({ pregnancyProfile: data.pregnancyProfile, pregnancyChecklistStates: data.pregnancyChecklistStates, children: [first, second], schedules, checks: [] }); setSelectedChildId(second.id); setMode('home') }
  function resetData() { if (confirm('테스트 데이터를 모두 지울까요?')) { setData({ pregnancyChecklistStates: [], children: [], schedules: [], checks: [] }); setSelectedChildId(''); setSelectedScheduleId(''); setMode('home') } }
  function downloadJson() { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'baby-vaccine-mvp-data.json'; a.click(); URL.revokeObjectURL(url) }
  function importJson(e: FormEvent<HTMLInputElement>) { const file = e.currentTarget.files?.[0]; if (!file) return; file.text().then((raw) => { const parsed = migrateData(JSON.parse(raw)); setData(parsed); setSelectedChildId(parsed.children[0]?.id ?? ''); setMode('home') }).catch(() => alert('JSON 파일을 읽지 못했습니다.')) }
  const childSchedulesRaw = selectedChild ? data.schedules.filter((s) => s.childId === selectedChild.id).sort((a,b) => +new Date(a.dueDate) - +new Date(b.dueDate)) : []
  const childSchedules = filterSchedules(childSchedulesRaw, statusFilter, typeFilter, query)

  return <main className="app">
    <header className="hero-card"><p className="eyebrow">초보 엄빠 케어 MVP</p><h1>임신부터 첫 접종까지, 지금 할 일을 한눈에</h1><p>임신 주차별 체크리스트, 혜택 확인, 출산 준비, 출산 후 접종·검진·24시간 상태 체크까지 하나의 흐름으로 테스트합니다.</p><div className="stat-row"><span>임신체크 {pregnancyDone}/{pregnancyTotal}</span><span>자녀 {data.children.length}</span><span>예정 {stats.pending}</span><span>완료 {stats.completed}</span><span>상태기록 {stats.checks}</span></div></header>
    <section className="panel utility"><h2>테스트 도구</h2><div className="button-row"><button onClick={addSampleData}>샘플 자녀 2명 생성</button><button onClick={downloadJson}>JSON 백업</button><label className="file-button">JSON 복원<input type="file" accept="application/json" onChange={importJson} /></label><button className="danger-button" onClick={resetData}>전체 초기화</button></div></section>
    <section className="panel mode-choice"><h2>현재 상황 선택</h2><div className="choice-grid"><button className={mode === 'pregnancy' || mode === 'pregnancySetup' ? 'choice-card active' : 'choice-card'} onClick={() => setMode(data.pregnancyProfile ? 'pregnancy' : 'pregnancySetup')}><strong>임신 중이에요</strong><span>주차별 할 일·혜택·출산 준비를 체크합니다.</span></button><button className={['home','child','detail','postCheck'].includes(mode) ? 'choice-card active' : 'choice-card'} onClick={() => setMode('home')}><strong>아이가 태어났어요</strong><span>자녀 등록 후 접종·검진·24시간 상태 체크를 관리합니다.</span></button></div></section>
    {mode === 'pregnancySetup' && <section className="panel detail"><button className="link" onClick={() => setMode('start')}>← 선택으로</button><h2>임신 정보 등록</h2><p>출산 예정일을 알면 주차와 D-day를 자동 계산합니다. 모르면 현재 주차만 입력해도 됩니다.</p><form className="form-grid pregnancy-form" onSubmit={savePregnancyProfile}><label>출산 예정일<input name="dueDate" type="date" defaultValue={data.pregnancyProfile?.dueDate ?? ''} /></label><label>현재 임신 주차<input name="currentWeekInput" type="number" min="1" max="42" placeholder="예: 8" defaultValue={data.pregnancyProfile?.currentWeekInput ?? ''} /></label><label>거주지역<input name="region" placeholder="예: 경기도 남양주시" defaultValue={data.pregnancyProfile?.region ?? ''} /></label><label>출산 순서<select name="birthOrder" defaultValue={data.pregnancyProfile?.birthOrder ?? 'unknown'}><option value="unknown">선택 안 함</option><option value="first">첫째</option><option value="second_or_more">둘째 이상</option></select></label><button type="submit">임신 타임라인 만들기</button></form></section>}
    {mode === 'pregnancy' && data.pregnancyProfile && <section className="grid pregnancy-grid"><div className="panel pregnancy-summary"><div className="section-head"><div><h2>임신 대시보드</h2><p>{data.pregnancyProfile.region ? `${data.pregnancyProfile.region} · ` : ''}{data.pregnancyProfile.birthOrder === 'first' ? '첫째' : data.pregnancyProfile.birthOrder === 'second_or_more' ? '둘째 이상' : '출산 순서 미선택'}</p></div><button onClick={() => setMode('pregnancySetup')}>수정</button></div><div className="big-metric"><strong>{currentWeek ? `${currentWeek}주차` : '주차 미입력'}</strong><span>출산 예정 {dueDday(data.pregnancyProfile)}</span></div><p className="due">이번 MVP는 공식 신청/의료 판단 대신 “무엇을 확인해야 하는지”를 놓치지 않게 돕는 체크리스트입니다.</p><button onClick={() => setMode('home')}>출산했어요 / 아이 등록하기</button></div><div className="panel pregnancy-todo"><h2>이번 시기 할 일</h2>{pregnancyItems.slice(0, 6).map((item) => <PregnancyChecklistRow key={item.id} item={item} done={isPregnancyDone(item.id)} onToggle={() => togglePregnancyItem(item.id)} />)}</div><div className="panel recommendation"><h2>추천/제휴 자리</h2><p>실제 광고는 아직 붙이지 않고, 상황별 준비물 추천 영역만 MVP에서 확인합니다.</p><ul><li>임신 초기: 엽산·산모수첩 케이스</li><li>출산 준비: 기저귀·물티슈·카시트·체온계</li><li>접종 후: 아기 체온계·수유 기록 도구</li></ul></div><div className="panel checklist-panel"><h2>체크리스트</h2><div className="category-tabs">{(['early','exam','preparation','benefit'] as PregnancyCategory[]).map((cat) => <button key={cat} className={pregnancyCategory === cat ? 'active' : ''} onClick={() => setPregnancyCategory(cat)}>{categoryLabel(cat)}</button>)}</div><div className="schedule-list">{pregnancyChecklistTemplates.filter((item) => item.category === pregnancyCategory).map((item) => <PregnancyChecklistRow key={item.id} item={item} done={isPregnancyDone(item.id)} onToggle={() => togglePregnancyItem(item.id)} />)}</div></div></section>}
    {(['home','child','detail','postCheck'].includes(mode) || mode === 'start') && <>
      <section className="panel"><h2>자녀 등록</h2><form className="form-grid" onSubmit={addChild}><input name="name" placeholder="아이 이름" required /><input name="birthDate" type="date" defaultValue={todayInput()} required /><select name="gender" defaultValue="unknown"><option value="unknown">성별 선택 안 함</option><option value="female">여아</option><option value="male">남아</option></select><button type="submit">자녀 추가 + 일정 생성</button></form></section>
      <nav className="tabs"><button className={mode === 'home' || mode === 'start' ? 'active' : ''} onClick={() => setMode('home')}>통합 홈</button><button className={mode === 'child' ? 'active' : ''} onClick={() => setMode('child')} disabled={!selectedChild}>아이별 일정</button></nav>
      {data.children.length > 0 && <section className="panel export-panel"><h2>캘린더 내보내기</h2><p>.ics 파일로 내려받아 Apple/Google/Naver 캘린더에 가져올 수 있습니다. 직접 동기화는 MVP에서 제외했습니다.</p><button onClick={() => downloadIcs(data.schedules, data.children, 'all-children-health-schedules.ics')}>전체 자녀 일정 .ics 다운로드</button></section>}
      {(mode === 'home' || mode === 'start') && <section className="grid"><div className="panel"><h2>등록된 자녀</h2>{data.children.length === 0 && <p className="empty">먼저 자녀를 등록해보세요.</p>}{data.children.map((child) => <button className="child-card" key={child.id} onClick={() => { setSelectedChildId(child.id); setMode('child') }}><strong>{child.name}</strong><span>{ageLabel(child.birthDate)}</span><em>남은 일정 {data.schedules.filter((s) => s.childId === child.id && s.status === 'pending').length}개</em></button>)}</div><div className="panel"><h2>다가오는 접종·검진</h2>{upcoming.map((s) => <ScheduleRow key={s.id} item={s} child={data.children.find((c) => c.id === s.childId)} onClick={() => { setSelectedScheduleId(s.id); setSelectedChildId(s.childId); setMode('detail') }} />)}</div><div className="panel urgent"><h2>24시간 체크 필요</h2>{duePostChecks.length === 0 && <p className="empty">지금 필요한 24시간 체크가 없습니다.</p>}{duePostChecks.map((s) => <button className="alert-card" key={s.id} onClick={() => { setSelectedScheduleId(s.id); setSelectedChildId(s.childId); setCheckType('after_24h'); setMode('postCheck') }}><strong>{s.title}</strong><span>{formatDateTime(s.postCheckDueAt!)}</span><em>접종열/이상반응 확인</em></button>)}</div></section>}
      {mode === 'child' && selectedChild && <section className="panel"><div className="section-head"><div><h2>{selectedChild.name}</h2><p>{ageLabel(selectedChild.birthDate)} · {formatDate(`${selectedChild.birthDate}T00:00:00`)}</p></div><button onClick={() => downloadIcs(childSchedules, data.children, `${selectedChild.name}-health-schedules.ics`)}>이 아이 일정 .ics</button></div><div className="filters"><input placeholder="접종/검진명 검색" value={query} onChange={(e) => setQuery(e.target.value)} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}><option value="all">전체 상태</option><option value="pending">예정만</option><option value="completed">완료만</option></select><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}><option value="all">접종+검진</option><option value="vaccination">접종만</option><option value="checkup">검진만</option></select></div><div className="result-count">표시 {childSchedules.length}개 / 전체 {childSchedulesRaw.length}개</div><div className="schedule-list">{childSchedules.map((s) => <ScheduleRow key={s.id} item={s} onClick={() => { setSelectedScheduleId(s.id); setMode('detail') }} />)}</div></section>}
      {mode === 'detail' && selectedSchedule && <section className="panel detail"><button className="link" onClick={() => setMode('child')}>← 목록으로</button><h2>{selectedSchedule.title}</h2><p>{selectedSchedule.type === 'vaccination' ? '예방접종' : '영유아 검진'} · {selectedSchedule.recommendedAgeLabel}</p><p className="due">{selectedSchedule.endDate ? `기간: ${formatDate(selectedSchedule.dueDate)} ~ ${formatDate(selectedSchedule.endDate)}` : `예정일: ${formatDate(selectedSchedule.dueDate)} · ${dday(selectedSchedule.dueDate)}`}<br />출처: {selectedSchedule.sourceName}</p>{selectedSchedule.status === 'completed' ? <CompletedBlock item={selectedSchedule} checks={data.checks.filter((c) => c.scheduleItemId === selectedSchedule.id)} onPost={(type) => { setCheckType(type); setMode('postCheck') }} /> : <form className="stack" onSubmit={completeSchedule}><label>실제 완료 날짜/시간<input name="completedAt" type="datetime-local" defaultValue={nowLocalInput()} /></label><label>메모<input name="memo" placeholder="병원명, 아이 상태 등" /></label><button type="submit">완료 처리하기</button></form>}</section>}
      {mode === 'postCheck' && selectedSchedule && <section className="panel detail"><button className="link" onClick={() => setMode('detail')}>← 상세로</button><h2>{checkType === 'after_24h' ? '접종 후 24시간 체크' : '접종 직후 상태 기록'}</h2><p>{selectedSchedule.title} 이후 아이 상태를 기록합니다.</p><form className="stack" onSubmit={savePostCheck}><label>현재 체온(℃)<input name="temperature" type="number" step="0.1" placeholder="37.5" /></label><Field title="접종열이 있나요?" name="hasFever" options={[["no", "아니요"], ["yes", "네"]]} /><Field title="아이 컨디션" name="condition" options={[["normal", "평소와 비슷해요"], ["slightly_fussy", "조금 보채요"], ["very_fussy", "많이 보채요"], ["lethargic", "기운이 없어 보여요"]]} /><Field title="수유/식사" name="feeding" options={[["normal", "평소와 같아요"], ["reduced", "조금 줄었어요"], ["poor", "거의 먹지 않아요"]]} /><Field title="접종 부위" name="injectionSite" options={[["normal", "괜찮아요"], ["redness", "조금 붉어요"], ["swelling", "부었어요"], ["severe_swelling", "많이 붓거나 단단해요"]]} /><div className="check-group"><b>기타 증상</b>{['구토','설사','발진','심한 울음','경련','호흡 이상','기타'].map((x) => <label key={x}><input type="checkbox" name="symptoms" value={x} /> {x}</label>)}</div><label>메모<textarea name="memo" placeholder="열 시작 시간, 해열제 여부, 수유량 등" /></label><div className="danger">호흡 이상, 경련, 의식 저하, 고열 지속, 달래지지 않는 울음이 있으면 즉시 의료기관에 문의하세요.</div><button type="submit">기록 저장하기</button></form></section>}
    </>}
    <MedicalDisclaimer />
  </main>

}
function PregnancyChecklistRow({ item, done, onToggle }: { item: PregnancyChecklistItem; done: boolean; onToggle: () => void }) { return <button className={`pregnancy-item ${done ? 'completed' : ''}`} onClick={onToggle}><span className="checkmark">{done ? '✓' : '○'}</span><strong>{item.title}</strong><span>{item.startWeek ? `${item.startWeek}${item.endWeek && item.endWeek !== item.startWeek ? `~${item.endWeek}` : ''}주 · ` : ''}{item.description}</span>{item.officialCheckRequired && <em>공식 확인 필요</em>}{item.recommendation && <small>{item.recommendation}</small>}</button> }
function ScheduleRow({ item, child, onClick }: { item: ScheduleItem; child?: Child; onClick: () => void }) { return <button className={`schedule-row ${item.status}`} onClick={onClick}><span className="badge">{item.type === 'vaccination' ? '접종' : '검진'}</span><strong>{item.title}</strong><span>{child ? `${child.name} · ` : ''}{item.recommendedAgeLabel}{item.endDate ? ` · ${formatDate(item.dueDate)}~${formatDate(item.endDate)}` : ''}</span><em>{item.status === 'completed' ? '완료' : dday(item.dueDate)}</em></button> }
function CompletedBlock({ item, checks, onPost }: { item: ScheduleItem; checks: PostVaccinationCheck[]; onPost: (type: CheckType) => void }) { return <div className="stack"><div className="success">완료: {item.completedAt ? formatDateTime(item.completedAt) : '완료됨'}</div>{item.postCheckDueAt && <div className="post-due">24시간 체크 예정: {formatDateTime(item.postCheckDueAt)}</div>}<div className="button-row"><button onClick={() => onPost('immediate')}>상태 기록하기</button><button onClick={() => onPost('after_24h')}>24시간 체크 기록</button></div><h3>상태 기록</h3>{checks.length === 0 && <p className="empty">아직 상태 기록이 없습니다.</p>}{checks.map((c) => <div className="record" key={c.id}><b>{c.checkType === 'after_24h' ? '24시간 체크' : '즉시 기록'}</b><span>{formatDateTime(c.checkedAt)} · 체온 {c.temperature ?? '-'}℃ · 접종열 {c.hasFever ? '있음' : '없음'}</span><small>{c.memo}</small></div>)}</div> }
function Field({ title, name, options }: { title: string; name: string; options: string[][] }) { return <div className="radio-group"><b>{title}</b>{options.map(([value, label], i) => <label key={value}><input type="radio" name={name} value={value} defaultChecked={i === 0} /> {label}</label>)}</div> }
export default App
