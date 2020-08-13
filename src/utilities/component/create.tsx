import { flow } from 'fp-ts/lib/function'
import { Dependencies, parse, action, update } from '../utilities'

/**
 * Create new lead
 *
 * @export
 * @template A
 * @param {A[]} data event data received
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function create<A> (deps: Dependencies<A>) {
  return flow(parse(deps), action<A>(update(deps)))
}
