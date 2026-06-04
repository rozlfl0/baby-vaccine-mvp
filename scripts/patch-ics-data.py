from pathlib import Path
path = Path(r'C:\Users\maste\baby-vaccine-mvp\src\App.tsx')
text = path.read_text(encoding='utf-8')
text = text.replace("type ScheduleTemplate = { id: string; type: ItemType; title: string; monthOffset: number; dayOffset?: number; recommendedAgeLabel: string; description?: string }", "type ScheduleTemplate = { id: string; type: ItemType; title: string; monthOffset: number; dayOffset?: number; endMonthOffset?: number; endDayOffset?: number; recommendedAgeLabel: string; description?: string; sourceName: string; sourceUrl: string; version: string }")
text = text.replace("type ScheduleItem = { id: string; childId: string; templateId: string; type: ItemType; title: string; recommendedAgeLabel: string; description?: string; dueDate: string; status: ScheduleStatus; completedAt?: string; postCheckDueAt?: string; memo?: string }", "type ScheduleItem = { id: string; childId: string; templateId: string; type: ItemType; title: string; recommendedAgeLabel: string; description?: string; dueDate: string; endDate?: string; status: ScheduleStatus; completedAt?: string; postCheckDueAt?: string; memo?: string; sourceName: string; sourceUrl: string; version: string }")
start = text.index("const templates: ScheduleTemplate[] = [")
end = text.index("\n]\n\nconst newId", start) + 3
new_templates = """const KDCA = '질병관리청 예방접종도우미 표준 예방접종 일정표'
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
]"""
text = text[:start] + new_templates + text[end:]
text = text.replace("dueDate: addMonths(child.birthDate, t.monthOffset, t.dayOffset), status: 'pending'", "dueDate: addMonths(child.birthDate, t.monthOffset, t.dayOffset), endDate: t.endMonthOffset !== undefined ? addMonths(child.birthDate, t.endMonthOffset, t.endDayOffset) : undefined, status: 'pending', sourceName: t.sourceName, sourceUrl: t.sourceUrl, version: t.version")
insert_after = "function MedicalDisclaimer() { return <div className=\"disclaimer\">이 앱은 의료 진단을 제공하지 않습니다. 접종·검진 일정은 개발용 임시 데이터이며, 실제 일정과 아이 상태는 반드시 소아청소년과/공식 기관 안내를 확인하세요.</div> }"
ics = '''\nfunction icsDate(iso: string) { return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' }\nfunction escapeIcs(text: string) { return text.replace(/\\\\/g, '\\\\\\\\').replace(/,/g, '\\\\,').replace(/;/g, '\\\\;').replace(/\\n/g, '\\\\n') }\nfunction downloadIcs(items: ScheduleItem[], children: Child[], filename: string) {\n  const events = items.map((s) => {\n    const child = children.find((c) => c.id === s.childId)\n    const start = icsDate(s.dueDate)\n    const endBase = s.endDate ? new Date(s.endDate) : new Date(+new Date(s.dueDate) + 60 * 60 * 1000)\n    const end = icsDate(endBase.toISOString())\n    const summary = `[${child?.name ?? '아이'}] ${s.title}${s.status === 'completed' ? ' (완료)' : ''}`\n    const desc = `${s.recommendedAgeLabel}\\n출처: ${s.sourceName}\\n${s.sourceUrl}\\n※ 최종 일정은 의료진/공식기관 확인 필요`\n    return [`BEGIN:VEVENT`, `UID:${s.id}@baby-vaccine-mvp`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${escapeIcs(summary)}`, `DESCRIPTION:${escapeIcs(desc)}`, `END:VEVENT`].join('\\r\\n')\n  })\n  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Baby Vaccine MVP//KO', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\\r\\n')\n  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' })\n  const url = URL.createObjectURL(blob)\n  const a = document.createElement('a')\n  a.href = url\n  a.download = filename\n  a.click()\n  URL.revokeObjectURL(url)\n}\n'''
text = text.replace(insert_after, insert_after + ics)
nav = "<nav className=\"tabs\"><button className={mode === 'home' ? 'active' : ''} onClick={() => setMode('home')}>통합 홈</button><button className={mode === 'child' ? 'active' : ''} onClick={() => setMode('child')} disabled={!selectedChild}>아이별 일정</button></nav>"
text = text.replace(nav, nav + "\n    {data.children.length > 0 && <section className=\"panel export-panel\"><h2>캘린더 내보내기</h2><p>.ics 파일로 내려받아 Apple/Google/Naver 캘린더에 가져올 수 있습니다. 직접 동기화는 MVP에서 제외했습니다.</p><button onClick={() => downloadIcs(data.schedules, data.children, 'all-children-health-schedules.ics')}>전체 자녀 일정 .ics 다운로드</button></section>}")
head_old = "<div className=\"section-head\"><div><h2>{selectedChild.name}</h2><p>{ageLabel(selectedChild.birthDate)} · {formatDate(`${selectedChild.birthDate}T00:00:00`)}</p></div></div>"
head_new = "<div className=\"section-head\"><div><h2>{selectedChild.name}</h2><p>{ageLabel(selectedChild.birthDate)} · {formatDate(`${selectedChild.birthDate}T00:00:00`)}</p></div><button onClick={() => downloadIcs(childSchedules, data.children, `${selectedChild.name}-health-schedules.ics`)}>이 아이 일정 .ics</button></div>"
text = text.replace(head_old, head_new)
text = text.replace("<p className=\"due\">예정일: {formatDate(selectedSchedule.dueDate)} · {dday(selectedSchedule.dueDate)}</p>", "<p className=\"due\">{selectedSchedule.endDate ? `기간: ${formatDate(selectedSchedule.dueDate)} ~ ${formatDate(selectedSchedule.endDate)}` : `예정일: ${formatDate(selectedSchedule.dueDate)} · ${dday(selectedSchedule.dueDate)}`}<br />출처: {selectedSchedule.sourceName}</p>")
path.write_text(text, encoding='utf-8')
print('patched App.tsx')
