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
  const value = document.createElement('strong');
  value.className = 'feature-progress';
  value.textContent = `${feature.progress}%`;
  const meter = document.createElement('span');
  meter.className = 'feature-meter';
  const fill = document.createElement('span');
  fill.style.width = `${feature.progress}%`;
  meter.append(fill);
  const detail = document.createElement('span');
  detail.className = 'feature-detail';
  detail.append(badge, value);
  row.append(name, detail, meter);
  return row;
}

async function loadStatus() {
  try {
    const response = await fetch('./status.json');
    if (!response.ok) throw new Error('load failed');
    const data = await response.json();
    const totalProgress = data.features.reduce((sum, item) => sum + item.progress, 0);
    const progress = Math.round(totalProgress / data.features.length);
    $('[data-progress]').textContent = `${progress}%`;
    $('[data-progress-bar]').style.width = `${progress}%`;
    $('[data-turn]').textContent = data.current_turn;
    $('[data-updated]').textContent = new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'medium', timeStyle: 'short',
    }).format(new Date(data.updated_at));
    const stale = Date.now() - new Date(data.updated_at).getTime() > 48 * 60 * 60 * 1000;
    const freshness = $('[data-freshness]');
    freshness.hidden = !stale;
    freshness.textContent = stale ? '상태 갱신이 48시간 이상 늦었습니다.' : '';
    const list = $('[data-features]');
    data.features.forEach((feature) => list.append(featureRow(feature)));
  } catch {
    const error = $('[data-error]');
    error.textContent = '상태를 불러오지 못했습니다.';
    error.hidden = false;
  }
}

loadStatus();
