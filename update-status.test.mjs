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
