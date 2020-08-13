import { flow } from 'fp-ts/lib/function'
import { Dependencies, parse, action, write, send } from '../utilities'

/**
 * Parse state against input, returning state
 *
 * @template A
 * @param {Dependencies<A>} deps
 * @param {A[]} data peer data
 * @returns
 */
function inverseParse<A> (deps: Dependencies<A>) {
  return (data: A[]) =>
    parse(Object.assign({}, deps, { state: data }))(deps.state)
}

/**
 * Respond to peer request for data
 *
 * @export
 * @template A
 * @param {A[]} data peer data
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function respond<A> (deps: Dependencies<A>) {
  return flow(
    inverseParse(deps),
    action<A>(flow(write('RESPOND_LEADS'), send(deps)))
  )
}
