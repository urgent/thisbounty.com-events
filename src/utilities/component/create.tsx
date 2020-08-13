import { flow } from 'fp-ts/lib/function'
import { parse, action, update, setBounty } from '../utilities'
import { Dependencies } from '../security/type'

/**
 * Create new lead
 *
 * @export
 * @template A
 * @param {A[]} data event data received
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function receive<A> (deps: Dependencies<A>) {
  return flow(parse(deps), action<A>(update(deps)))
}

export function create<A> (deps: Dependencies<A>) {
  return flow(setBounty(deps), receive(deps))
}
