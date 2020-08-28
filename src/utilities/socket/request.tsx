import * as T from 'fp-ts/lib/Task'
import { pipe } from 'fp-ts/lib/function'
import { write, send } from '../utilities'
import { Dependencies } from '../security/type'

/**
 * Request data from peers
 *
 * @export
 * @template A
 * @param {A[]} data peer data sent with request
 * @returns {Reader<Dependencies<A>, T.Task<Result<A>>>} Dependecies Reader for effects to run
 */
export function request<A> (deps: Dependencies<A>): T.Task<void> {
  return T.of(pipe(deps.state, write('REQUEST_LEADS'), send(deps)))
}

/*
 under,
    E.fold<Error, A[], TE.TaskEither<Error, () => void>>(
      error => {
        console.log(error)
        return TE.left(error)
      },*/
