// 검사 사이트(enneagram-seminar/script.js)에서 그대로 가져온 데이터
// ─────────────────────────────────────────────────────
// 0. Supabase (세미나 전용 테이블)
// ─────────────────────────────────────────────────────
const SUPABASE_URL      = 'https://lqnaznnzjgzpadwiwduj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxbmF6bm56amd6cGFkd2l3ZHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNzM4MTEsImV4cCI6MjEwNzc0OTgxMX0.9_hF2ZWyAA1aAk0n_6QpICZLTt-TU8t6Q-7tzHICCOo';
const SEMINAR_TABLE     = 'seminar_ai_results'; // 세미나 전용 신규 테이블

// ─────────────────────────────────────────────────────
// 1. 질문 데이터 (기존 틈 에니어그램에서 그대로 이식)
// ─────────────────────────────────────────────────────
const normalQuestions = {
  1: [
    { id: '1-1', text: '나는 모든 일을 개선하기 위해 깊이 생각해서 행동한다.' },
    { id: '1-2', text: '나는 다른 사람들보다 근면하며 책임감이 강하다.' },
    { id: '1-3', text: '나는 정직하고 자제력이 있는 사람이다.' },
    { id: '1-4', text: '나의 행동은 원칙에 기초를 둔다.' },
    { id: '1-5', text: '나는 완벽을 위해 끝까지 참고 노력한다.' },
    { id: '1-6', text: '나는 규칙을 잘 지키며 엄격하다.' },
    { id: '1-7', text: '나는 다른 사람들의 신임을 얻을 수 있다.' },
    { id: '1-8', text: '나는 정의감이 강하고 근면하다.' },
    { id: '1-9', text: '나는 주로 나의 양심과 이성에 따른다.' }
  ],
  2: [
    { id: '2-1', text: '나는 다른 사람들과 함께 일하기를 더 좋아한다.' },
    { id: '2-2', text: '나는 사람들에게 칭찬을 잘 한다.' },
    { id: '2-3', text: '내 생각보다는 남의 생각에 공감할 때가 많다.' },
    { id: '2-4', text: '나는 친구들이 나에게 의지할 때 기분이 좋다.' },
    { id: '2-5', text: '나의 관심사는 다른 사람들을 도와주는 것이다.' },
    { id: '2-6', text: '나는 사람들을 관심 있게 대하고 보살피려 한다.' },
    { id: '2-7', text: '나는 사람들과 친해지려고 많이 노력하고 있다.' },
    { id: '2-8', text: '나는 타인의 만족을 위해 노력한다.' },
    { id: '2-9', text: '나는 타인의 호감을 얻기 위해 노력한다.' }
  ],
  3: [
    { id: '3-1', text: '나는 능력을 발휘하는데 많은 시간을 투자한다.' },
    { id: '3-2', text: '나는 과정보다는 결과를 중시한다.' },
    { id: '3-3', text: '나는 적응력이 뛰어나 상황에 적절히 대응한다.' },
    { id: '3-4', text: '나는 인간 중심적이기보다는 오히려 목표 중심적이다.' },
    { id: '3-5', text: '나는 사람들에게 지나친 경쟁을 강요한다.' },
    { id: '3-6', text: '나는 성공만이 애정을 획득할 수 있다고 믿는다.' },
    { id: '3-7', text: '나는 실패를 두려워하여 과장하는 경향이 있다.' },
    { id: '3-8', text: '나는 침체에 빠지지 않고 무엇인가를 끊임없이 행한다.' },
    { id: '3-9', text: '나는 사람들에 대한 배려보다는 일의 성취를 더 중요하게 생각한다.' }
  ],
  4: [
    { id: '4-1', text: '나는 감성적이어서 혼자 있을 때가 많다.' },
    { id: '4-2', text: '나는 혼자서 자신만의 고상한 취미를 즐긴다.' },
    { id: '4-3', text: '나는 낭만적이고 예술가적인 기질이 있다.' },
    { id: '4-4', text: '나는 이방인처럼 느낄 때가 많다.' },
    { id: '4-5', text: '나는 다른 사람들과는 다른 독특한 감정을 가지고 있다.' },
    { id: '4-6', text: '나는 분위기에 약하고 자기 생각에 골몰하는 편이다.' },
    { id: '4-7', text: '나는 내 행동의 동기와 감정에 대해 회의적인 생각이 들 때가 있다.' },
    { id: '4-8', text: '나는 감동적인 것을 추구하다가 혼자 우울해지기도 한다.' },
    { id: '4-9', text: '나는 비현실적이며 몽상가적 기질을 가지고 있다.' }
  ],
  5: [
    { id: '5-1', text: '나는 무엇인가에 집중하며 통찰한다.' },
    { id: '5-2', text: '나는 문제가 있으면 풀릴 때까지 그것만 골똘히 생각한다.' },
    { id: '5-3', text: '나는 공적인 것보다는 개인생활에 대한 관심이 많다.' },
    { id: '5-4', text: '나는 감정보다는 이성을 추구한다.' },
    { id: '5-5', text: '나는 시간이나 돈을 아끼는 경향이 있다.' },
    { id: '5-6', text: '나의 관심사는 나를 둘러싼 세계를 이해하는 것이다.' },
    { id: '5-7', text: '나는 권위를 믿지 않고 규칙을 무시한다.' },
    { id: '5-8', text: '나는 지적이고 냉철하게 관찰하는 편이다.' },
    { id: '5-9', text: '나는 머리로 모든 것을 이해하고 판단한다.' }
  ],
  6: [
    { id: '6-1', text: '나는 명확한 지침이 있을 때 일의 능률이 오른다.' },
    { id: '6-2', text: '나는 사랑하는 사람을 가끔 의심하는 경향이 있다.' },
    { id: '6-3', text: '나는 성공에 대해서도 가끔 평가 절하하는 경향이 있다.' },
    { id: '6-4', text: '나는 잘 훈련되어 있어 조직이나 집단에 헌신할 수 있다.' },
    { id: '6-5', text: '사람들은 내게 때로 용기가 필요하다고 말한다.' },
    { id: '6-6', text: '나는 결과에 대한 두려움 때문에 일을 질질 끄는 경우가 있다.' },
    { id: '6-7', text: '나는 충성할 만한 사람이라고 판단되면 헌신할 수 있다.' },
    { id: '6-8', text: '나는 친하게 지내는 사람과 영원한 우정을 유지하도록 노력한다.' },
    { id: '6-9', text: '나는 모든 일에서 안전을 중요하게 생각한다.' }
  ],
  7: [
    { id: '7-1', text: '나는 자발적으로 재미있는 일을 즐긴다.' },
    { id: '7-2', text: '나는 모험적이며 위험을 감수한다.' },
    { id: '7-3', text: '나는 끊임없이 변화하는 생활을 좋아한다.' },
    { id: '7-4', text: '나는 자극과 흥분을 유발하는 활동을 좋아한다.' },
    { id: '7-5', text: '나는 어린아이처럼 명량하고 순진하다.' },
    { id: '7-6', text: '나는 미래에 대해 항상 열정을 가지고 있다.' },
    { id: '7-7', text: '나는 여러 가지 일들을 즐기며, 새로운 경험을 갈망한다.' },
    { id: '7-8', text: '나는 한 가지 일에 정착하기가 어렵다.' },
    { id: '7-9', text: '나는 현실에 만족하지 않고 새로운 것을 추가한다.' }
  ],
  8: [
    { id: '8-1', text: '나에게는 지도자로서의 기질이 있다.' },
    { id: '8-2', text: '나는 의사 결정을 할 때 적절한 지도력을 발휘한다.' },
    { id: '8-3', text: '나는 늘 강해야 한다고 생각한다.' },
    { id: '8-4', text: '나는 사람들에게 영향력 있는 사람이다.' },
    { id: '8-5', text: '나는 다른 사람들이 말하기 어려워하는 것을 이야기 한다.' },
    { id: '8-6', text: '나는 공격적이고 자기 주장이 강하다.' },
    { id: '8-7', text: '나는 사람들을 통제하려 한다.' },
    { id: '8-8', text: '나는 사람들을 지시하고 동기를 부여한다.' },
    { id: '8-9', text: '나는 강한 자신감으로 사람들을 설득 시킨다.' }
  ],
  9: [
    { id: '9-1', text: '나는 자기만족적이며 태평한 편이다.' },
    { id: '9-2', text: '나는 감정의 동요가 많지 않은 원만한 사람이다.' },
    { id: '9-3', text: '나는 안전한 해결책을 원하고 되도록 갈등을 피한다.' },
    { id: '9-4', text: '나는 친구들과 긴장을 풀고 마음 편하게 지낸다.' },
    { id: '9-5', text: '나는 사람들을 유쾌하고 편하게 대한다.' },
    { id: '9-6', text: '사람들은 나를 그냥 좋아한다.' },
    { id: '9-7', text: '나는 세상에 대해 낙관적인 편이다.' },
    { id: '9-8', text: '사람들이 하는 일은 각자의 몫이며 나와 상관없는 일이다.' },
    { id: '9-9', text: '나는 조화로움을 추구하는 평화주의자이다.' }
  ]
};

const specialQuestions = [
  { type: 1, id: '1-10', text: '나는 이성친구 또는 친구와의 약속이 없으면 불안함을 느낀다.' },
  { type: 2, id: '2-10', text: '나는 자해 또는 자살 시도에 대해 생각해 본 적 있다.' },
  { type: 3, id: '3-10', text: '나는 문신 혹은 피어싱에 관심이 간다.' },
  { type: 4, id: '4-10', text: '나는 가끔 충동적으로 행동(ex. 투자, 폭식, 성관계 등) 하는 경향이 있다.' },
  { type: 5, id: '5-10', text: '나는 1시간 이상 걸리는 곳으로 이동하는 것에 부담을 느껴한다.' },
  { type: 6, id: '6-10', text: '나는 잠수를 타고 싶다고 생각한 적이 있다.' },
  { type: 7, id: '7-10', text: '나는 심리적 어려움이 생긴다면 전문 상담 또는 약물 치료를 받아야 한다고 생각한다.' },
  { type: 8, id: '8-10', text: '나는 정치 또는 종교와 관련된 것은 피한다.' },
  { type: 9, id: '9-10', text: '나는 동성에게 이성적 감정을 느낀 적이 있다.' }
];

// Round-robin + special 삽입 (기존 알고리즘 그대로)
const normalList = [];
for (let i = 0; i < 9; i++) {
  for (let t = 1; t <= 9; t++) {
    const list = normalQuestions[t];
    if (i < list.length) normalList.push({ type: t, id: list[i].id, text: list[i].text });
  }
}
const questionsList = [];
let spIdx = 0;
const insertPositions = [8, 16, 24, 32, 40, 48, 56, 64, 72];
for (let i = 0; i < normalList.length; i++) {
  if (spIdx < insertPositions.length && questionsList.length === insertPositions[spIdx]) {
    questionsList.push(specialQuestions[spIdx]);
    spIdx++;
  }
  questionsList.push(normalList[i]);
}
while (spIdx < specialQuestions.length) { questionsList.push(specialQuestions[spIdx++]); }

// 5문항씩 페이지 분할
const quizPages = [];
const PER_PAGE = 5;
for (let i = 0; i < questionsList.length; i += PER_PAGE) {
  const chunk = questionsList.slice(i, i + PER_PAGE).map((q, idx) => ({ ...q, localNum: i + idx + 1 }));
  quizPages.push({ questions: chunk });
}
const TOTAL_PAGES = quizPages.length;

// ─────────────────────────────────────────────────────
// 2. AI 역량 유형 데이터 (9유형)
// ─────────────────────────────────────────────────────
const typeData = {
  1: {
    label: '에니어그램 1번 유형 — 원칙주의자',
    shortLabel: '1번 원칙주의자',
    potential: '정직성',
    sub:   '정확성과 기준을 중시하며 더 나은 세상을 만들고자 합니다.',
    aiDesc: 'AI 시대에 당신은 탁월한 퀄리티 관리자입니다. 무분별하게 쏟아지는 AI 결과물을 검증하고 정제하는 능력, 원칙에 기반한 윤리적 AI 활용, 높은 기준을 지키는 실행력이 조직의 신뢰를 만들어냅니다.',
    strengths: [
      'AI 결과물의 오류와 편향을 정확히 잡아냄',
      '윤리적이고 원칙 중심의 AI 사용 기준 수립',
      '높은 완성도의 산출물로 신뢰 구축',
      '세심한 프롬프트 설계로 정밀한 결과 도출'
    ],
    growths: [
      '완벽 추구보다 빠른 실험·반복 사이클 채택하기',
      '80% 완성도의 빠른 결과도 가치 있음을 인식',
      'AI의 불완전함을 수용하고 협력하는 유연성 키우기',
      '팀의 다양한 기준도 존중하며 협업하기'
    ]
  },
  2: {
    label: '에니어그램 2번 유형 — 협력가',
    shortLabel: '2번 협력가',
    potential: '섬김',
    sub:   '타인의 필요를 먼저 알아채고 진심으로 도움을 줍니다.',
    aiDesc: 'AI 시대에 당신은 탁월한 연결자이자 촉진자입니다. 인간과 AI, 팀원과 팀원 사이의 간극을 메우고 공감을 바탕으로 집단지성을 이끌어냅니다. AI가 대체하기 가장 어려운 "진심" 역량의 소유자입니다.',
    strengths: [
      '팀 내 갈등을 조율하고 협업 분위기 조성',
      '사람 중심 AI 서비스 기획 및 UX 개선',
      '다양한 이해관계자의 니즈를 파악해 솔루션 제안',
      '공감력으로 AI 도구 도입 시 저항감 최소화'
    ],
    growths: [
      '나 자신의 욕구와 목표도 명확히 정의하기',
      'AI를 통해 나의 시간과 에너지를 먼저 절약하기',
      '도움을 주되 경계 설정으로 지속 가능성 유지',
      '데이터와 논리를 통한 설득력 강화하기'
    ]
  },
  3: {
    label: '에니어그램 3번 유형 — 성취가',
    shortLabel: '3번 성취가',
    potential: '탁월함',
    sub:   '목표를 향해 빠르게 적응하며 성과를 만들어냅니다.',
    aiDesc: 'AI 시대에 당신은 빠른 실행력과 적응력으로 기회를 선점합니다. 새로운 AI 도구를 누구보다 빨리 익혀 성과로 연결하고, 변화하는 환경에서도 방향성을 잃지 않습니다. 결과 중심 사고가 AI 시대에 강력한 무기입니다.',
    strengths: [
      '신기술을 빠르게 학습해 즉시 성과로 연결',
      '명확한 목표 설정과 AI 기반 실행 계획 수립',
      '변화에 유연하게 적응하며 새 기회 포착',
      '성과 지표를 설정하고 AI로 지속 개선'
    ],
    growths: [
      '과정의 학습과 실패에서도 가치를 찾는 연습',
      '속도보다 방향의 중요성 인식하기',
      '팀원의 감정과 과정을 함께 챙기는 리더십',
      '장기적 성장을 위한 깊이 있는 전문성 쌓기'
    ]
  },
  4: {
    label: '에니어그램 4번 유형 — 개인주의자',
    shortLabel: '4번 개인주의자',
    potential: '창의성',
    sub:   '독창적인 감성과 깊은 자기 인식으로 세상을 바라봅니다.',
    aiDesc: 'AI 시대에 당신의 차별화된 관점과 창의적 감성은 누구도 쉽게 복제할 수 없는 자산입니다. AI가 평균적인 것을 생성한다면, 당신은 AI를 통해 독창적인 것을 만들어냅니다. 창의적 콘텐츠와 차별화 전략의 핵심 인재입니다.',
    strengths: [
      'AI 생성물에 독창성과 감성을 더해 차별화',
      '트렌드를 새롭게 해석하는 창의적 기획력',
      '감성 콘텐츠·브랜드 스토리텔링 역량',
      '인간 감정을 깊이 이해하는 공감 능력'
    ],
    growths: [
      '아이디어를 실현 가능한 프로세스로 구체화하기',
      '비교 대신 나만의 고유한 가치에 집중하기',
      '일관성 있는 실행력으로 창의성을 성과로 연결',
      '팀과의 협업 속에서 창의성 발휘하기'
    ]
  },
  5: {
    label: '에니어그램 5번 유형 — 탐구자',
    shortLabel: '5번 탐구자',
    potential: '통찰력',
    sub:   '깊은 분석력과 지식 탐구로 세상을 이해합니다.',
    aiDesc: 'AI 시대에 당신의 분석력과 전문성은 더욱 빛을 발합니다. AI를 도구로 활용해 방대한 정보를 빠르게 처리하고, 남들이 보지 못한 인사이트를 도출합니다. 깊은 전문성 위에 AI를 올린 T자형 인재의 이상적인 모습입니다.',
    strengths: [
      'AI로 방대한 데이터를 분석해 핵심 인사이트 도출',
      '복잡한 문제를 체계적으로 분해·해결하는 논리력',
      '깊은 전문 지식으로 AI 결과를 정확히 검증',
      '호기심 주도 학습으로 새 기술 빠르게 흡수'
    ],
    growths: [
      '지식을 실행으로 연결하는 "충분히 알았다" 기준 설정',
      '팀과 지식을 공유해 집단 역량 강화하기',
      '분석보다 빠른 시도와 피드백 루프 만들기',
      '대인 관계와 협업 속에서 아이디어 검증하기'
    ]
  },
  6: {
    label: '에니어그램 6번 유형 — 충성가',
    shortLabel: '6번 충성가',
    potential: '신뢰성',
    sub:   '신뢰와 안전을 중시하며 팀을 위해 헌신합니다.',
    aiDesc: 'AI 시대에 당신은 팀의 안전망이자 리스크 관리자입니다. AI 도입 시 발생할 수 있는 위험을 사전에 식별하고, 신뢰 기반의 AI 거버넌스를 구축합니다. 충성스럽고 책임감 있는 협업 능력은 AI 시대에도 핵심 인재상입니다.',
    strengths: [
      'AI 시스템의 리스크와 오류를 사전에 예방',
      '팀 신뢰 기반의 AI 도입 전략 수립',
      '체계적인 프로세스 설계로 지속 가능한 시스템 구축',
      '위기 상황에서 침착하게 대응하는 안정적 역량'
    ],
    growths: [
      '불확실한 상황에서도 먼저 시도해보는 실행 용기',
      'AI의 80% 정확도도 충분히 활용 가능함을 수용',
      '과도한 검토보다 빠른 의사결정 훈련하기',
      '나 자신의 판단력을 더 신뢰하는 연습'
    ]
  },
  7: {
    label: '에니어그램 7번 유형 — 열정가',
    shortLabel: '7번 열정가',
    potential: '호기심',
    sub:   '에너지 넘치는 호기심으로 새로운 가능성을 탐험합니다.',
    aiDesc: 'AI 시대에 당신의 빠른 호기심과 트렌드 감각은 기회 포착의 레이더입니다. 다양한 AI 도구를 가장 먼저 실험하고 창의적으로 조합해 새로운 가능성을 개척합니다. 아이디어 발산과 혁신의 씨앗을 심는 역할입니다.',
    strengths: [
      '최신 AI 트렌드를 가장 먼저 파악하고 실험',
      '다양한 도구를 창의적으로 조합해 새 솔루션 개발',
      '낙관적 에너지로 팀의 변화 저항 극복',
      '여러 분야를 연결하는 크로스오버 아이디어 발굴'
    ],
    growths: [
      '유망한 아이디어를 선별해 끝까지 실행하는 집중력',
      '하나의 프로젝트를 완성한 후 다음으로 이동하기',
      '깊이 있는 전문성 하나를 집중적으로 쌓기',
      '장기 계획과 일관된 실행력 키우기'
    ]
  },
  8: {
    label: '에니어그램 8번 유형 — 도전자',
    shortLabel: '8번 도전자',
    potential: '결단력',
    sub:   '강한 의지와 결단력으로 변화를 이끌어냅니다.',
    aiDesc: 'AI 시대에 당신은 변화의 선봉장입니다. AI 전환을 두려움 없이 선도하고, 조직에 강력한 추진력을 불어넣습니다. 의사결정 속도와 실행력은 AI 시대 리더십의 핵심이며, 당신이 가장 잘 하는 것입니다.',
    strengths: [
      'AI 전환을 두려움 없이 추진하는 강한 실행력',
      '빠르고 명확한 의사결정으로 팀을 이끄는 리더십',
      '도전적 목표 설정과 달성으로 조직 혁신 주도',
      '불필요한 프로세스를 제거하는 효율화 능력'
    ],
    growths: [
      '경청과 협력으로 더 강한 팀 시너지 만들기',
      '세심한 소통으로 구성원 동기 부여하기',
      '단기 성과와 함께 장기 지속 가능성도 고려하기',
      '취약성을 나눔으로써 더 깊은 신뢰 구축하기'
    ]
  },
  9: {
    label: '에니어그램 9번 유형 — 평화주의자',
    shortLabel: '9번 평화주의자',
    potential: '포용력',
    sub:   '조화로운 관계 속에서 모두를 포용하는 중재자입니다.',
    aiDesc: 'AI 시대에 당신은 인간과 AI, 세대와 세대 사이를 잇는 다리 역할을 합니다. 다양한 관점을 통합하고 갈등을 조율하는 능력은 AI 가 대체하기 어려운 고유한 인간 역량입니다. 포용력 있는 리더십으로 팀 전체를 끌어올립니다.',
    strengths: [
      '다양한 의견을 통합해 최적의 합의점 도출',
      '팀 갈등을 해소하고 심리적 안전감 조성',
      '장기적 관점에서 지속 가능한 변화 설계',
      '모든 구성원의 강점을 끌어내는 포용 리더십'
    ],
    growths: [
      '나만의 의견과 방향을 명확하게 표현하기',
      'AI 도구를 활용해 자신의 강점을 더 적극적으로 드러내기',
      '결정을 미루지 않고 적시에 액션 취하기',
      '갈등을 회피보다 적극 해결하는 자세 갖기'
    ]
  }
};

// 3센터 정의
const centers = {
  gut:   { types: [1, 8, 9], label: '장(Gut) 중심',   color: '#f97316', glow: 'rgba(249,115,22,0.5)' },
  heart: { types: [2, 3, 4], label: '가슴(Heart) 중심', color: '#ec4899', glow: 'rgba(236,72,153,0.5)' },
  head:  { types: [5, 6, 7], label: '머리(Head) 중심', color: '#22d3ee', glow: 'rgba(34,211,238,0.5)' }
};

function mapScore(rating) {
  if (rating === 1) return 1;
  if (rating === 2) return 2;
  if (rating === 3) return 4;
  if (rating === 4) return 5;
  return 0;
}

function renderRadar(typeScores, topType) {
  const container = document.getElementById('radar-container');
  const W = 320, H = 300;
  const cx = W / 2, cy = H / 2;
  const R  = 110;  // 외부 원 반지름 (만점선)

  // 9각형 직접 배치: 9번(12시), 1번(1시 40분), 2번(3시 20분)...
  // 위첸부터 시계 방향, 첫번째 유형은 9번
  const typeOrder = [9, 1, 2, 3, 4, 5, 6, 7, 8]; // 9번이 맨 위
  const N = typeOrder.length;

  function angle(i) {
    // 위첸부터 시계 방향, -90도 출발
    return (2 * Math.PI * i / N) - Math.PI / 2;
  }

  function polarToXY(i, r) {
    const a = angle(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  // 유형별 최대 점수 (전체 평면화: 10문항 * 5점 = 50점 만점)
  const MAX_SCORE = 50;

  // 망 선 (1~9단계)
  const LEVELS = 9;
  const levelLines = [];
  for (let lv = 1; lv <= LEVELS; lv++) {
    const r = R * (lv / LEVELS);
    const pts = typeOrder.map((_, i) => polarToXY(i, r));
    levelLines.push(pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z');
  }

  // 스포크 라인 (중심에서 랜터 방향)
  const spokeLines = typeOrder.map((_, i) => {
    const outer = polarToXY(i, R);
    return `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
  }).join('');

  // 망 라인 SVG 요소
  const gridLines = levelLines.map((d, lv) =>
    `<path d="${d}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`
  ).join('');

  // 만점 라인 (9각형)
  const maxPts = typeOrder.map((_, i) => polarToXY(i, R));
  const maxPath = maxPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  // 내 점수 라인
  const myPts = typeOrder.map((type, i) => {
    const ratio = Math.min((typeScores[type] || 0) / MAX_SCORE, 1);
    return polarToXY(i, R * ratio);
  });
  const myPath = myPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  // 라벨 (type 이름 및 번호)
  const typeNames = {
    1: '1개혁', 2: '2협력', 3: '3성취', 4: '4창조',
    5: '5탐구', 6: '6헌신', 7: '7열정', 8: '8도전', 9: '9화합'
  };
  const LABEL_MARGIN = 22;
  const labels = typeOrder.map((type, i) => {
    const pt = polarToXY(i, R + LABEL_MARGIN);
    const isTop = type === topType;
    const fill  = isTop ? '#22d3ee' : '#94a3b8';
    const fw    = isTop ? '700' : '400';
    return `<text x="${pt.x.toFixed(1)}" y="${(pt.y + 4).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="${fill}" font-size="11" font-family="Noto Sans KR, sans-serif" font-weight="${fw}">${typeNames[type]}</text>`;
  }).join('');

  // 도승 점
  const topDot = (() => {
    const idx = typeOrder.indexOf(topType);
    const ratio = Math.min((typeScores[topType] || 0) / MAX_SCORE, 1);
    const p = polarToXY(idx, R * ratio);
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>`;
  })();

  const svg = `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <!-- 배경 망 -->
    ${gridLines}
    <!-- 스포크 -->
    ${spokeLines}
    <!-- 만점 선 -->
    <path d="${maxPath}" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" stroke-width="1.8" stroke-linejoin="round"/>
    <!-- 내 점수 선 -->
    <path d="${myPath}" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="2" stroke-linejoin="round"/>
    <!-- 도승 점 -->
    ${topDot}
    <!-- 라벨 -->
    ${labels}
  </svg>`;

  container.innerHTML = svg;
}
