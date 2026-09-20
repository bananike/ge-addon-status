import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStatus } from './validate-status.mjs';

const valid = () => ({
  updated_at: '2026-09-09T13:40:00+09:00',
  current_turn: 'Claude',
  features: [{ name: '자동 미션', status: '작업 중', progress: 85 }],
  stages: ['기능 점검', '코드 수정 계획', '코드 수정', '재점검', '검사기·배포기', '배포 테스트'],
  stage_now: 3,
  current: '죽은 길 걷어내기',
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

test('단계 여섯과 지금 단계·지금 하는 일을 요구한다', () => {
  for (const key of ['stages', 'stage_now', 'current']) {
    const value = valid(); delete value[key];
    assert.throws(() => validateStatus(value), key);
  }
});
test('단계 수가 여섯이 아니면 거절한다', () => {
  const value = valid(); value.stages = value.stages.slice(0, 5);
  assert.throws(() => validateStatus(value));
});
test('지금 단계는 1~6 정수만 받는다', () => {
  for (const now of [0, 7, 2.5, '3']) {
    const value = valid(); value.stage_now = now;
    assert.throws(() => validateStatus(value), String(now));
  }
});
test('지금 하는 일은 비지 않은 짧은 글이어야 한다', () => {
  for (const text of ['', '   ', 'x'.repeat(81), 42]) {
    const value = valid(); value.current = text;
    assert.throws(() => validateStatus(value), String(text).slice(0, 8));
  }
});
