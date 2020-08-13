import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import * as A from 'fp-ts/lib/Array'
import { Separated } from 'fp-ts/lib/Compactable'
import { flow } from 'fp-ts/lib/function'
import { Dependencies } from './security/type'
import { validate } from './security/validation'

/**
 * Parse event data for runtime check and state uniqueness
 *
 * @template A
 * @param {A[]} data event data to parse
 * @returns {Separated<Error[], A[]>} Dependecies Reader for parsed data
 */
export function parse<A> (deps: Dependencies<A>) {
  return flow(A.map(validate(deps.decoder)(deps.eq)(deps.state)), A.separate)
}

/**
 * Check for array length against env
 *
 * @export
 * @template A
 * @param {A[]} data array to check
 * @returns {Either<Error, A[]>} result of array length check, original input if valid
 */
export function over<A> (data: A[]): E.Either<Error, A[]> {
  if (data.length >= parseInt(process.env.REQUEST_LEADS_THRESHOLD)) {
    return E.right(data)
  } else {
    return E.left(
      new Error(
        `REQUEST_LEADS_THRESHOLD of ${process.env.REQUEST_LEADS_THRESHOLD}`
      )
    )
  }
}

type Effect<A> = (a: A[]) => void

/**
 * Run effectful action
 *
 * @export
 * @template A
 * @param {Effect} effect Effect to run
 * @param {Result<A>} result Effect parameter with at least one valid property
 * @returns {TaskEither<Error, A[]>} Task of effectful action
 */
export function action<A> (effect: Effect<A>) {
  return (
    data: Separated<Error[], A[]>
  ): TE.TaskEither<Error, Separated<Error[], A[]>> => {
    if (data.right.length === 0) {
      return TE.left(new Error(String(data.left)))
    } else {
      effect(data.right)
      return TE.right(data)
    }
  }
}

/**
 * Merge, save to state and local storage
 *
 * @export
 * @template A
 * @param {Dependencies<A>} deps Dependencies required to run effect
 * @returns {void}
 */
export function update<A> (deps: Dependencies<A>) {
  return (data: A[]): void =>
    void (async () => {
      const update = [...deps.state, ...data]
      await deps.localForage.setItem(`leads`, update)
      deps.setState(update)
      return data
    })()
}

export function write<A> (event: string) {
  return (data: A[]) => ({ event, data })
}

export function send<A> (deps: Dependencies<A>) {
  return flow(JSON.stringify, deps.socket.send)
}
