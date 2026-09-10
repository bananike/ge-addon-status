import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateStatus } from './validate-status.mjs';

export function updateStatus(file, change) {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  const feature = value.features.find((item) => item.name === change.feature);
  if (!feature) throw new Error(`없는 기능: ${change.feature}`);
  feature.status = change.status;
  feature.progress = Number(change.progress);
  value.current_turn = change.turn;
  value.updated_at = change.now || new Date().toISOString();
  validateStatus(value);
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, file);
  return value;
}

function argumentsFrom(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) values.set(argv[index], argv[index + 1]);
  return {
    feature: values.get('--feature'), status: values.get('--status'),
    progress: values.get('--progress'), turn: values.get('--turn'),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const file = path.resolve(process.argv[2] || 'dashboard/status.json');
    const value = updateStatus(file, argumentsFrom(process.argv.slice(3)));
    console.log(`갱신 완료: ${value.updated_at}`);
  } catch (error) {
    console.error(String(error.message || error).replace(/[\r\n\t]+/g, ' ').slice(0, 240));
    process.exitCode = 1;
  }
}
