import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (name) => fs.readFileSync(new URL(name, import.meta.url), 'utf8');

test('화면 계약과 로컬 자원만 사용한다', () => {
  const html = read('./index.html');
  for (const marker of ['data-progress', 'data-turn', 'data-updated', 'data-features']) {
    assert.equal((html.match(new RegExp(`${marker}(?:[\\s=>])`, 'g')) || []).length, 1, marker);
  }
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.doesNotMatch(html, /https?:\/\//);
});

test('상태를 읽어 완료 비율을 계산한다', () => {
  const app = read('./app.js');
  assert.match(app, /fetch\(['"]\.\/status\.json['"]\)/);
  assert.match(app, /item\.progress/);
  assert.match(app, /totalProgress\s*\/\s*data\.features\.length/);
  assert.match(app, /feature\.progress/);
});

test('공개 화면 파일에 민감 문자열이 없다', () => {
  const publicText = ['index.html', 'styles.css', 'app.js'].map(read).join('\n');
  assert.doesNotMatch(publicText, /[A-Za-z]:[\\/]|\/Users\/|0x[0-9A-Fa-f]{6,}|\bcommit\b/i);
});

test('기본 화면은 다크 테마이며 오래된 게시 상태를 드러낸다', () => {
  const html = read('./index.html');
  const css = read('./styles.css');
  const app = read('./app.js');
  assert.match(html, /data-freshness/);
  assert.match(css, /color-scheme:\s*dark/);
  assert.match(css, /--canvas:\s*#[0-2][0-9a-f]{5}/i);
  assert.match(app, /stale/);
});
