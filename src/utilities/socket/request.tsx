import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe, flow } from 'fp-ts/lib/function'
import { Dependencies, over, write, send } from '../utilities'

/**
 * Request data from peers
 *
 * @export
 * @template A
 * @param {A[]} data peer data sent with request
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function request<A> (deps: Dependencies<A>): TE.TaskEither<Error, void> {
  return pipe(
    deps.state,
    over,
    E.fold<Error, A[], TE.TaskEither<Error, void>>(
      TE.left,
      //  send(deps)
      flow(
        TE.right,
        TE.chain(flow(write('REQUEST_LEADS'), send(deps), TE.right))
      )
    )
  )
}
