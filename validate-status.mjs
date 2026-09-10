import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const TOP_KEYS = new Set(['updated_at', 'current_turn', 'features']);
const FEATURE_KEYS = new Set(['name', 'status', 'progress']);
const STATUSES = new Set(['완료', '작업 중', '테스트 대기', '미구현']);

function exactKeys(object, allowed, label) {
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) throw new Error(`${label}: 허용되지 않은 키 ${key}`);
  }
  for (const key of allowed) {
    if (!(key in object)) throw new Error(`${label}: 필수 키 ${key} 누락`);
  }
}

export function validateStatus(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('최상위는 객체여야 합니다');
  exactKeys(value, TOP_KEYS, '최상위');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value.updated_at)
      || Number.isNaN(Date.parse(value.updated_at))) throw new Error('updated_at은 시간대가 있는 ISO 8601이어야 합니다');
  if (!['Claude', 'Codex'].includes(value.current_turn)) throw new Error('current_turn은 Claude 또는 Codex여야 합니다');
  if (!Array.isArray(value.features) || value.features.length === 0) throw new Error('features는 비지 않은 배열이어야 합니다');

  const names = new Set();
  value.features.forEach((feature, index) => {
    if (!feature || typeof feature !== 'object' || Array.isArray(feature)) throw new Error(`features[${index}]는 객체여야 합니다`);
    exactKeys(feature, FEATURE_KEYS, `features[${index}]`);
    if (typeof feature.name !== 'string' || !feature.name.trim()) throw new Error(`features[${index}].name이 비었습니다`);
    if (names.has(feature.name)) throw new Error(`중복 기능명: ${feature.name}`);
    names.add(feature.name);
    if (!STATUSES.has(feature.status)) throw new Error(`알 수 없는 상태: ${feature.status}`);
    if (!Number.isInteger(feature.progress) || feature.progress < 0 || feature.progress > 100) {
      throw new Error(`features[${index}].progress는 0~100 정수여야 합니다`);
    }
  });

  const serialized = JSON.stringify(value);
  const forbidden = [/[A-Za-z]:[\\/]/, /\/Users\//, /0x[0-9A-Fa-f]{6,}/];
  if (forbidden.some((pattern) => pattern.test(serialized))) throw new Error('공개 금지 정보가 포함됐습니다');
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    validateStatus(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
  } catch (error) {
    console.error(String(error.message || error).replace(/[\r\n\t]+/g, ' ').slice(0, 240));
    process.exitCode = 1;
  }
}
