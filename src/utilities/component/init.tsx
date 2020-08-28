import eventEmitter from '../eventEmitter'
import { task } from 'fp-ts/lib/Task'
import * as O from 'fp-ts/lib/Option'

import { flow, pipe, identity } from 'fp-ts/lib/function'
import { parse, action, update, setBounty } from '../utilities'
import { Dependencies } from '../security/type'
import { Separated } from 'fp-ts/lib/Compactable'

function delay (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function effect<A> (deps: Dependencies<A>) {
  return async (storage: Separated<Error[], A[]>) => {
    deps.setState(storage.right)
    delay(2000)
    eventEmitter.emit('REQUEST_LEADS', storage.right)
  }
}

export function init<A> (deps: Dependencies<A>) {
  return (key: string) => {
    return task.of(
      (async () => {
        pipe(
          await deps.localForage.getItem(key),
          O.fromNullable,
          O.fold(() => [], Array.from),
          parse(deps),
          effect(deps)
        )
      })()
    )
  }
}
