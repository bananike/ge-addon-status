import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStatus } from './validate-status.mjs';

const valid = () => ({
  updated_at: '2026-09-09T13:40:00+09:00',
  current_turn: 'Claude',
  features: [{ name: '자동 미션', status: '작업 중', progress: 85 }],
});

test('정상 상태를 통과시킨다', () => assert.equal(validateStatus(valid()), true));
test('알 수 없는 상태를 거절한다', () => {
  const value = valid(); value.features[0].status = '보류';
  assert.throws(() => validateStatus(value));
});
test('중복 기능명과 빈 목록을 거절한다', () => {
  const value = valid(); value.features.push({ ...value.features[0] });
  assert.throws(() => validateStatus(value));
  value.features = [];
  assert.throws(() => validateStatus(value));
});
test('알 수 없는 차례를 거절한다', () => {
  const value = valid(); value.current_turn = 'Other';
  assert.throws(() => validateStatus(value));
});
test('기능 진행률은 0~100 정수만 받는다', () => {
  for (const progress of [-1, 101, 10.5, '50']) {
    const value = valid(); value.features[0].progress = progress;
    assert.throws(() => validateStatus(value), String(progress));
  }
});
test('민감 정보를 거절한다', () => {
  for (const name of ['D:\\secret', 'D:/secret', '/Users/name', '0x12345678']) {
    const value = valid(); value.features[0].name = name;
    assert.throws(() => validateStatus(value), name);
  }
});
test('금지 키와 추가 키를 거절한다', () => {
  for (const key of ['commit', 'source_commit', 'handoff_document']) {
    const value = valid(); value[key] = 'x';
    assert.throws(() => validateStatus(value), key);
  }
});
