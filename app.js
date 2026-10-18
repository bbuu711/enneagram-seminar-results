// ─────────────────────────────────────────────────────
// AI 에니어그램 세미나 결과지 – 앱 로직
// (질문/유형 데이터, 레이더 차트는 data.js 에서 가져옴)
// ─────────────────────────────────────────────────────
const ALL_QUESTIONS = quizPages.flatMap(p => p.questions); // 화면 순서 90문항
let records = [];

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── 데이터 불러오기 ──
async function loadRecords() {
  $('list-status').textContent = '불러오는 중...';
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${SEMINAR_TABLE}?select=*&order=created_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    records = await res.json();
    renderList();
    route();
  } catch (e) {
    console.error(e);
    $('list-status').textContent = '데이터를 불러오지 못했어요: ' + e.message;
  }
}

// ── 계산 도우미 ──
// answers: 새 형식 = 화면 순서 점수 배열 / 옛 형식 = { '1-1': 1~4 } 객체
function getAnswerScores(r) {
  const a = r.answers;
  if (Array.isArray(a)) return ALL_QUESTIONS.map((q, i) => a[i] ?? null);
  if (a && typeof a === 'object') return ALL_QUESTIONS.map(q => a[q.id] != null ? mapScore(a[q.id]) : null);
  return ALL_QUESTIONS.map(() => null);
}

const isExtra = q => q.id.endsWith('-10'); // 10번째 질문 = 추가 문항 (점수 계산 제외)

// 유형 점수 = X-1 ~ X-9 점수 합 (X-10 제외)
function getTypeScores(r) {
  const ans = getAnswerScores(r);
  if (ans.every(v => v == null) && r.type_scores && typeof r.type_scores === 'object') {
    const s = {};
    for (let t = 1; t <= 9; t++) s[t] = Number(r.type_scores[t] ?? 0);
    return s;
  }
  const s = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };
  ans.forEach((v, i) => { const q = ALL_QUESTIONS[i]; if (v && !isExtra(q)) s[q.type] += v; });
  return s;
}

function getTopType(r) {
  const s = getTypeScores(r);
  return Number(Object.keys(s).sort((a, b) => s[b] - s[a])[0]);
}

// 3대 유형: 가슴(2+3+4), 머리(5+6+7), 장(8+9+1)
const TRIADS = [
  { key: 'heart', name: '가슴형', types: [2, 3, 4], color: '#f472b6' },
  { key: 'head',  name: '머리형', types: [5, 6, 7], color: '#22d3ee' },
  { key: 'gut',   name: '장형',   types: [8, 9, 1], color: '#fbbf24' }
];
const getTriads = s => TRIADS.map(t => ({ ...t, score: t.types.reduce((a, k) => a + s[k], 0) }));

const fmtDate = d => d ? new Date(d).toLocaleString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';

// ── 목록 ──
function renderList() {
  const q = $('search-input').value.trim().toLowerCase();
  const ft = $('filter-type').value;
  const list = records.filter(r => {
    const hay = [r.name, r.phone, r.code, (r.phone || '').replace(/\D/g, '')].join(' ').toLowerCase();
    return (!q || hay.includes(q)) && (!ft || String(getTopType(r)) === ft);
  });

  $('list-body').innerHTML = list.map(r => {
    const t = getTopType(r);
    return `<tr data-id="${esc(r.id)}">
      <td>${fmtDate(r.created_at)}</td>
      <td><strong>${esc(r.name) || '-'}</strong></td>
      <td>${esc(r.birth) || '-'}</td>
      <td>${esc(r.gender) || '-'}</td>
      <td>${esc(r.phone) || '-'}</td>
      <td>${esc(r.code) || '-'}</td>
      <td><span class="pill">${t}번 · ${esc(typeData[t]?.potential || '-')}</span></td>
      <td><button class="btn btn-sm">결과 보기</button></td>
    </tr>`;
  }).join('');

  $('list-body').querySelectorAll('tr').forEach(tr =>
    tr.addEventListener('click', () => { location.hash = 'id=' + tr.dataset.id; })
  );

  $('list-status').textContent = list.length ? '' : (records.length ? '검색 결과가 없어요.' : '아직 제출된 결과가 없어요.');

  // 통계
  const counts = {};
  records.forEach(r => { const t = getTopType(r); counts[t] = (counts[t] || 0) + 1; });
  $('stats').innerHTML = `<span class="stat-chip">전체 ${records.length}명</span>` +
    Object.keys(counts).sort((a, b) => a - b).map(t => `<span class="stat-chip">${t}번 ${typeData[t]?.potential || ''} ${counts[t]}명</span>`).join('');
}

// ── 별자리 ──
function getZodiac(birth) {
  if (!birth) return '';
  const s = String(birth).replace(/\D/g, ''); // 숫자만
  let mo, d;
  if (s.length === 8) {
    // YYYYMMDD 형식 (예: 20060826)
    mo = parseInt(s.slice(4, 6), 10);
    d  = parseInt(s.slice(6, 8), 10);
  } else {
    // YYYY-MM-DD 등 구분자 있는 형식
    const m = String(birth).match(/(\d{1,4})[-./](\d{1,2})[-./](\d{1,2})/);
    if (!m) return '';
    mo = parseInt(m[2], 10);
    d  = parseInt(m[3], 10);
  }
  if (!mo || !d) return '';
  const md = mo * 100 + d;
  if (md >= 120 && md <= 218) return '물병자리';
  if (md >= 219 && md <= 320) return '물고기자리';
  if (md >= 321 && md <= 419) return '양자리';
  if (md >= 420 && md <= 520) return '황소자리';
  if (md >= 521 && md <= 621) return '쌍둥이자리';
  if (md >= 622 && md <= 722) return '게자리';
  if (md >= 723 && md <= 822) return '사자자리';
  if (md >= 823 && md <= 923) return '처녀자리';
  if (md >= 924 && md <= 1022) return '천칭자리';
  if (md >= 1023 && md <= 1122) return '전갈자리';
  if (md >= 1123 && md <= 1224) return '사수자리';
  return '염소자리';
}

// ── 결과지 ──
function renderReport(r) {
  const top = getTopType(r);
  const data = typeData[top] || {};
  const scores = getTypeScores(r);

  const zodiac = getZodiac(r.birth);
  const birthStr = r.birth ? esc(r.birth) + (zodiac ? ` (${zodiac})` : '') : '';
  $('rp-person').innerHTML = `<strong>${esc(r.name) || '이름 없음'}</strong>
    ${[birthStr, r.gender && esc(r.gender), r.phone && esc(r.phone)].filter(Boolean).join(' · ')}`;
  $('rp-type').textContent = data.label || `${top}번 유형`;
  $('rp-potential').innerHTML = `당신의 잠재력은 <em>${esc(data.potential)}</em>입니다.`;
  $('rp-sub').textContent = data.sub || '';
  $('rp-ai').textContent = data.aiDesc || '';
  $('rp-strengths').innerHTML = (data.strengths || []).map(s => `<li>${esc(s)}</li>`).join('');
  $('rp-growths').innerHTML = (data.growths || []).map(s => `<li>${esc(s)}</li>`).join('');

  renderRadar(scores, top);

  // 점수 순위
  const sorted = Object.entries(scores).map(([t, s]) => ({ t: +t, s })).sort((a, b) => b.s - a.s);
  const max = Math.max(...sorted.map(x => x.s)) || 1;
  $('rp-bars').innerHTML = sorted.map(x => `
    <div class="bar-item ${x.t === top ? 'top' : ''}">
      <div class="bar-head"><span>${x.t}번 ${esc(typeData[x.t]?.shortLabel?.replace(/^\d+번\s*/, '') || '')}</span><span>${x.s}점</span></div>
      <div class="bar-track"><div class="bar-fill" data-pct="${Math.round(x.s / max * 100)}"></div></div>
    </div>`).join('');
  requestAnimationFrame(() => setTimeout(() =>
    document.querySelectorAll('.bar-fill').forEach(el => el.style.width = el.dataset.pct + '%'), 50));

  // 3대 유형
  const triads = getTriads(scores);
  const tMax = Math.max(...triads.map(t => t.score));
  $('rp-triads').innerHTML = triads.map(t => `
    <div class="triad ${t.score === tMax ? 'top' : ''}" style="--c:${t.color}">
      <div class="triad-name">${t.name}</div>
      <div class="triad-score">${t.score}<small>점</small></div>
      <div class="triad-formula">${t.types.map(k => `${k}번 ${scores[k]}`).join(' + ')}</div>
    </div>`).join('');

  // 문항별 응답 – 유형별(X-1~X-9) + 추가 문항(X-10)
  const ans = getAnswerScores(r);
  const scoreOf = {};
  ALL_QUESTIONS.forEach((q, i) => scoreOf[q.id] = ans[i]);
  const row = q => `<div class="ans-row"><span class="ans-q"><b>${q.id}.</b> ${esc(q.text)}</span><span class="ans-s s${scoreOf[q.id] ?? ''}">${scoreOf[q.id] ?? '-'}</span></div>`;
  const groups = [];
  for (let t = 1; t <= 9; t++) {
    groups.push({ title: `${t}번 유형`, total: scores[t], qs: normalQuestions[t] });
  }
  groups.push({ title: '추가 문항', total: null, qs: specialQuestions });
  $('rp-answers').innerHTML = groups.map(g => `
    <div class="ans-group ${g.total == null ? 'extra' : ''}">
      <div class="ans-head"><span>${g.title}</span>${g.total != null ? `<span>합계 ${g.total}점</span>` : '<span>점수 계산 제외</span>'}</div>
      ${g.qs.map(row).join('')}
    </div>`).join('');
}

// ── 화면 전환 (링크 공유 가능: #id=123) ──
function route() {
  const m = location.hash.match(/id=([^&]+)/);
  const r = m && records.find(x => String(x.id) === decodeURIComponent(m[1]));
  $('view-list').classList.toggle('hidden', !!r);
  $('view-report').classList.toggle('hidden', !r);
  if (r) { renderReport(r); window.scrollTo(0, 0); }
}

// ── CSV ──
function exportCSV(list, filename) {
  const head = ['제출일시', '이름', '생년월일', '성별', '전화번호', '고유번호', '주유형', '잠재력',
    ...[1,2,3,4,5,6,7,8,9].map(t => `${t}번 점수`), '가슴형', '머리형', '장형',
    ...ALL_QUESTIONS.map((q, i) => `${i + 1}(${q.id})`)];
  const rows = list.map(r => {
    const t = getTopType(r), s = getTypeScores(r);
    return [fmtDate(r.created_at), r.name, r.birth, r.gender, r.phone, r.code, t, typeData[t]?.potential,
      ...[1,2,3,4,5,6,7,8,9].map(k => s[k]), ...getTriads(s).map(x => x.score), ...getAnswerScores(r)];
  });
  const csv = [head, ...rows].map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = filename;
  a.click();
}

function currentRecord() {
  const m = location.hash.match(/id=([^&]+)/);
  return m && records.find(x => String(x.id) === decodeURIComponent(m[1]));
}

// ── 이벤트 ──
for (let t = 1; t <= 9; t++) {
  $('filter-type').insertAdjacentHTML('beforeend', `<option value="${t}">${t}번 · ${typeData[t].potential}</option>`);
}
$('search-input').addEventListener('input', renderList);
$('filter-type').addEventListener('change', renderList);
$('btn-refresh').addEventListener('click', loadRecords);
$('btn-export-all').addEventListener('click', () => exportCSV(records, 'seminar_results_all.csv'));
$('btn-back').addEventListener('click', () => { location.hash = ''; });
$('btn-print').addEventListener('click', () => window.print());
$('btn-export-one').addEventListener('click', () => { const r = currentRecord(); if (r) exportCSV([r], `result_${r.name || r.id}.csv`); });
$('btn-copy-link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); $('btn-copy-link').textContent = '✅ 복사됨'; }
  catch { prompt('아래 링크를 복사하세요', location.href); }
  setTimeout(() => $('btn-copy-link').textContent = '🔗 링크 복사', 1500);
});
window.addEventListener('hashchange', route);

loadRecords();
