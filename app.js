const $ = (selector) => document.querySelector(selector);
const statusClass = new Map([
  ['완료', 'done'], ['작업 중', 'active'], ['테스트 대기', 'waiting'], ['미구현', 'todo'],
]);

function featureRow(feature) {
  const row = document.createElement('article');
  row.className = 'feature-row';
  const name = document.createElement('span');
  name.className = 'feature-name';
  name.textContent = feature.name;
  const badge = document.createElement('span');
  badge.className = `badge ${statusClass.get(feature.status) || 'todo'}`;
  badge.textContent = feature.status;
  row.append(name, badge);
  return row;
}

async function loadStatus() {
  try {
    const response = await fetch('./status.json');
    if (!response.ok) throw new Error('load failed');
    const data = await response.json();
    const completed = data.features.filter((item) => item.status === '완료').length;
    const progress = Math.round((completed / data.features.length) * 100);
    $('[data-progress]').textContent = `${progress}%`;
    $('[data-progress-bar]').style.width = `${progress}%`;
    $('[data-turn]').textContent = data.current_turn;
    $('[data-updated]').textContent = new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'medium', timeStyle: 'short',
    }).format(new Date(data.updated_at));
    const list = $('[data-features]');
    data.features.forEach((feature) => list.append(featureRow(feature)));
  } catch {
    const error = $('[data-error]');
    error.textContent = '상태를 불러오지 못했습니다.';
    error.hidden = false;
  }
}

loadStatus();
