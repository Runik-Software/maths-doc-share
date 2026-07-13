import * as migration_20260627_000501 from './20260627_000501'
import * as migration_20260627_214219 from './20260627_214219'
import * as migration_20260628_162627 from './20260628_162627'
import * as migration_20260629_171304 from './20260629_171304'
import * as migration_20260713_000212 from './20260713_000212'

export const migrations = [
  {
    up: migration_20260627_000501.up,
    down: migration_20260627_000501.down,
    name: '20260627_000501',
  },
  {
    up: migration_20260627_214219.up,
    down: migration_20260627_214219.down,
    name: '20260627_214219',
  },
  {
    up: migration_20260628_162627.up,
    down: migration_20260628_162627.down,
    name: '20260628_162627',
  },
  {
    up: migration_20260629_171304.up,
    down: migration_20260629_171304.down,
    name: '20260629_171304',
  },
  {
    up: migration_20260713_000212.up,
    down: migration_20260713_000212.down,
    name: '20260713_000212',
  },
]
