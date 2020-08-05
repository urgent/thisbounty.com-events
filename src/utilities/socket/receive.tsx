import * as TE from 'fp-ts/lib/TaskEither'
import { Reader, ask, chain } from 'fp-ts/lib/Reader'
import { pipe } from 'fp-ts/lib/function'
import { Dependencies, Result, parse } from './utilities'

/**
 * Receive data from websocket and return effects to run
 *
 * @export
 * @template A
 * @param {A[]} data event data to parse
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function receive<A> (
  data: A[]
): Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>> {
  return pipe(
    ask<Dependencies<A>>(),
    // allows the Reader from action to use Dependencies for parse
    chain((deps: Dependencies<A>) => action<A>(parse(data)(deps)))
  )
}

/**
 * Run effectful actions
 *
 * @export
 * @template A
 * @param {Result<A>} result Parsed event data
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function action<A> (
  result: Result<A>
): Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>> {
  return (deps: Dependencies<A>) => {
    if (result.valid.length === 0) {
      return TE.left(new Error(String(result.errors)))
    } else {
      return TE.right(
        void (async () => {
          await deps.localForage.setItem(`leads`, result.valid)
          deps.setState(result.valid)
          return result
        })()
      )
    }
  }
}
