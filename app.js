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

function getTypeScores(r) {
  if (r.type_scores && typeof r.type_scores === 'object') {
    const s = {};
    for (let t = 1; t <= 9; t++) s[t] = Number(r.type_scores[t] ?? 0);
    return s;
  }
  const s = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };
  getAnswerScores(r).forEach((v, i) => { if (v) s[ALL_QUESTIONS[i].type] += v; });
  return s;
}

function getTopType(r) {
  if (r.primary_type) return Number(r.primary_type);
  const s = getTypeScores(r);
  return Number(Object.keys(s).sort((a, b) => s[b] - s[a])[0]);
}

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

// ── 결과지 ──
function renderReport(r) {
  const top = getTopType(r);
  const data = typeData[top] || {};
  const scores = getTypeScores(r);

  $('rp-person').innerHTML = `<strong>${esc(r.name) || '이름 없음'}</strong>
    ${[r.birth, r.gender, r.phone, r.code && '고유번호 ' + r.code, fmtDate(r.created_at)].filter(Boolean).map(esc).join(' · ')}`;
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

  // 문항별 응답
  const ans = getAnswerScores(r);
  $('rp-answers').innerHTML = ALL_QUESTIONS.map((q, i) => `
    <tr class="${q.id.endsWith('-10') ? 'special-row' : ''}">
      <td>${i + 1}</td><td>${q.id}</td><td>${esc(q.text)}</td>
      <td class="score-cell s${ans[i] ?? ''}">${ans[i] ?? '-'}</td>
    </tr>`).join('');
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
    ...[1,2,3,4,5,6,7,8,9].map(t => `${t}번 점수`),
    ...ALL_QUESTIONS.map((q, i) => `${i + 1}(${q.id})`)];
  const rows = list.map(r => {
    const t = getTopType(r), s = getTypeScores(r);
    return [fmtDate(r.created_at), r.name, r.birth, r.gender, r.phone, r.code, t, typeData[t]?.potential,
      ...[1,2,3,4,5,6,7,8,9].map(k => s[k]), ...getAnswerScores(r)];
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
