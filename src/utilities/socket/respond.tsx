import * as TE from 'fp-ts/lib/TaskEither'
import { Reader, ask, chain } from 'fp-ts/lib/Reader'
import { pipe } from 'fp-ts/lib/function'
import { Dependencies, Result, parse } from './utilities'

/**
 * Respond to peer request for data
 *
 * @export
 * @template A
 * @param {A[]} data peer data sent with request
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function respond<A> (
  data: A[]
): Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>> {
  return pipe(
    ask<Dependencies<A>>(),
    // allows the Reader from action to use Dependencies for parse
    chain((deps: Dependencies<A>) =>
      // switch state and event data. Responding with state
      action<A>(parse(deps.state)(Object.assign({}, deps, { state: data })))
    )
  )
}

/**
 * Return effectful actions, or list of errors if no valid data
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
      return TE.right(send(deps, result))
    }
  }
}

export function send<A> (deps: Dependencies<A>, result: Result<A>) {
  deps.socket.send(
    JSON.stringify({ event: 'RESPOND_LEADS', data: result.valid })
  )
  return result
}