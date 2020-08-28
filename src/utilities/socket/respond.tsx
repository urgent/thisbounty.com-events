import { flow, pipe } from 'fp-ts/lib/function'
import { parse, action, write, send } from '../utilities'
import { Dependencies } from '../security/type'

/**
 * Parse state against input, returning state
 *
 * @template A
 * @param {Dependencies<A>} deps
 * @param {A[]} data peer data
 * @returns
 */
function inverseParse<A> (deps: Dependencies<A>) {
  return (data: A[]) => {
    console.log('data is')
    console.log(data)
    return parse(Object.assign({}, deps, { state: data }))(deps.state)
  }
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
    action<A>((data: A[]) => {
      pipe(data, write('RESPOND_LEADS'), send(deps))
    })
  )
}
