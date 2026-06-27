import * as migration_20260627_000501 from './20260627_000501';
import * as migration_20260627_214219 from './20260627_214219';

export const migrations = [
  {
    up: migration_20260627_000501.up,
    down: migration_20260627_000501.down,
    name: '20260627_000501',
  },
  {
    up: migration_20260627_214219.up,
    down: migration_20260627_214219.down,
    name: '20260627_214219'
  },
];
