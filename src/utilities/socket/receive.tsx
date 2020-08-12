import * as TE from 'fp-ts/lib/TaskEither'
import { Reader, ask, chain } from 'fp-ts/lib/Reader'
import { flow } from 'fp-ts/lib/function'
import { Dependencies, Result, parse } from '../utilities'

/**
 * Receive data from peer and return effects to run
 *
 * @export
 * @template A
 * @param {A[]} data event data received
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function receive<A> (deps: Dependencies<A>) {
  return flow(parse(deps), action<A>(deps))
}

/**
 * Run effectful actions
 *
 * @export
 * @template A
 * @param {Result<A>} result Parsed event data
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function action<A> (deps: Dependencies<A>) {
  return (result: Result<A>) => {
    if (result.valid.length === 0) {
      return TE.left(new Error(String(result.errors)))
    } else {
      return TE.right(
        void (async () => {
          const update = [...deps.state, ...result.valid]
          await deps.localForage.setItem(`leads`, update)
          deps.setState(update)
          return result
        })()
      )
    }
  }
}
