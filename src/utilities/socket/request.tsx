import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { pipe, flow } from 'fp-ts/lib/function'
import { Dependencies, over } from '../utilities'

/**
 * Request data from peers
 *
 * @export
 * @template A
 * @param {A[]} data peer data sent with request
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function request<A> (deps: Dependencies<A>): TE.TaskEither<Error, A[]> {
  return pipe(
    deps.state,
    over,
    E.fold<Error, A[], TE.TaskEither<Error, A[]>>(
      TE.left,
      flow(TE.right, TE.chain(flow(send(deps.socket), TE.right)))
    )
  )
}

export function send<A> (socket: WebSocket) {
  return (state: A[]): A[] => {
    socket.send(JSON.stringify({ event: 'REQUEST_LEADS', data: state }))
    return state
  }
}
