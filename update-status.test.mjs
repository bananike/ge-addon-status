import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { updateStatus } from './update-status.mjs';

const fixture = () => ({
  updated_at: '2026-09-09T13:40:00+09:00',
  current_turn: 'Claude',
  features: [{ name: '마켓 판매자', status: '미구현', progress: 0 }],
  stages: ['기능 점검', '코드 수정 계획', '코드 수정', '재점검', '검사기·배포기', '배포 테스트'],
  stage_now: 3,
  current: '앞 일',
});

test('기능 하나를 고치면 상태와 진행률과 갱신시각을 함께 저장한다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashboard-status-'));
  const file = path.join(dir, 'status.json');
  fs.writeFileSync(file, `${JSON.stringify(fixture(), null, 2)}\n`);
  updateStatus(file, {
    feature: '마켓 판매자', status: '작업 중', progress: 35,
    turn: 'Codex', now: '2026-09-10T12:00:00+09:00',
  });
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.deepEqual(value, {
    updated_at: '2026-09-10T12:00:00+09:00',
    current_turn: 'Codex',
    features: [{ name: '마켓 판매자', status: '작업 중', progress: 35 }],
    stages: ['기능 점검', '코드 수정 계획', '코드 수정', '재점검', '검사기·배포기', '배포 테스트'],
    stage_now: 3,
    current: '앞 일',
  });
});

test('없는 기능명은 새로 만들지 않고 거절한다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashboard-status-'));
  const file = path.join(dir, 'status.json');
  fs.writeFileSync(file, JSON.stringify(fixture()));
  assert.throws(() => updateStatus(file, {
    feature: '없는 기능', status: '작업 중', progress: 1, turn: 'Claude',
  }), /없는 기능/);
});

test('기능 없이 지금 단계와 지금 하는 일만 고칠 수 있다', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dashboard-status-'));
  const file = path.join(dir, 'status.json');
  fs.writeFileSync(file, `${JSON.stringify(fixture(), null, 2)}
`);
  updateStatus(file, {
    stageNow: 4, current: '재점검 준비', turn: 'Claude', now: '2026-09-10T12:00:00+09:00',
  });
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(value.stage_now, 4);
  assert.equal(value.current, '재점검 준비');
  assert.equal(value.features[0].status, '미구현');
  assert.equal(value.updated_at, '2026-09-10T12:00:00+09:00');
});
