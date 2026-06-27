import * as migration_20260627_000501 from './20260627_000501';

export const migrations = [
  {
    up: migration_20260627_000501.up,
    down: migration_20260627_000501.down,
    name: '20260627_000501'
  },
];
