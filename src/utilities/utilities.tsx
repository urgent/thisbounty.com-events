import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import * as A from 'fp-ts/lib/Array'
import { Separated } from 'fp-ts/lib/Compactable'
import * as t from 'io-ts'
import { sequenceT } from 'fp-ts/lib/Apply'
import { NonEmptyArray, getSemigroup } from 'fp-ts/lib/NonEmptyArray'
import { Eq } from 'fp-ts/lib/Eq'
import { pipe, flow } from 'fp-ts/lib/function'
import { failure } from 'io-ts/lib/PathReporter'
import localForage from 'localforage'

export interface Dependencies<A> {
  state: A[]
  setState: React.Dispatch<React.SetStateAction<A[]>>
  socket: WebSocket
  localForage: typeof localForage
  decoder: t.Decoder<unknown, A>
  eq: Eq<A>
}

/**
 * Decode an object with provided codec
 *
 * @export
 * @template A
 * @param {t.Decoder<unknown, A>} decoder io-ts codec
 * @param {Object} i input to decode
 * @returns {Either<Error, A>} result of decode, Either of joined Errors or decoded result
 */
export function decodeWith<A> (decoder: t.Decoder<{}, A>) {
  return flow(
    decoder.decode,
    E.mapLeft((errors: t.Errors) => new Error(failure(errors).join('\n')))
  )
}

/**
 * Monadic Array.findIndex to Either
 *
 * @export
 * @template A
 * @param {Eq<A>} eq Comparison operator for collection and item equality
 * @param {A[]} collection Collection to search
 * @param {A} item Item to find
 * @returns {Either<Error, A>} Error if item exists, item if unique
 */
export function deduplicate<A> (eq: Eq<A>) {
  return (collection: A[]) => (item: A): E.Either<Error, A> =>
    pipe(
      collection,
      A.findFirst((_collection: A) => eq.equals(_collection, item)),
      O.fold(
        () => E.right(item),
        item =>
          E.left(
            new Error(
              `Duplicate ${JSON.stringify(item)} already exists in state`
            )
          )
      )
    )
}

/**
 * Add multiple error array support to an Either<E,A> returning function
 *
 * @template E
 * @template A
 * @param {(a: A) => E.Either<E, A>} check Either returning function
 * @returns {(a: A) => E.Either<NonEmptyArray<E>, A>} Either returning function with error array support
 */
function lift<E, A> (
  check: (a: A) => E.Either<E, A>
): (a: A) => E.Either<NonEmptyArray<E>, A> {
  return flow(
    check,
    E.mapLeft(a => [a])
  )
}

/**
 * Decode an object with provided codec, lifted to support multiple error collection
 *
 * @template A
 * @param {t.Decoder<unknown, A>} decoder io-ts codec
 * @param {Object} i input to decode
 * @returns  {Either<NonEmptyArray<E>, A>} result of decode, Either of joined Errors or decoded result
 */
function decodeWithV<A> (decoder: t.Decoder<unknown, A>) {
  return lift(decodeWith(decoder))
}

/**
 * Monadic Array.findIndex to Either, lifted to support multiple error collection
 *
 * @template A
 * @param {Eq<A>} eq Comparison operator for collection and item equality
 * @param {A[]} collection Collection to search
 * @param {A} item Item to find
 * @returns {Either<NonEmptyArray<E>, A>} Error if item exists, item if unique
 */
function deduplicateV<A> (
  eq: Eq<A>
): (collection: A[]) => (a: A) => E.Either<NonEmptyArray<Error>, A> {
  return flow(deduplicate(eq), lift)
}

/**
 * Validate with decoder and unique
 *
 * @template A
 * @param {t.Decoder<unknown, A>} decoder io-ts codec
 * @param {Eq<A>} eq Comparison operator for unique
 * @param {A[]} collection Collection to search for unique comparison
 * @param {A} item Item to validate
 * @returns {E.Either<NonEmptyArray<Error>, A>} Decoder or unique error on failure, decode result on success
 */
function validateV<A> (decoder: t.Decoder<unknown, A>) {
  return (eq: Eq<A>) => (collection: A[]) => (
    item: A
  ): E.Either<NonEmptyArray<Error>, A> =>
    pipe(
      sequenceT(E.getValidation(getSemigroup<Error>()))(
        decodeWithV(decoder)(item),
        deduplicateV(eq)(collection)(item)
      ),
      E.map(() => item)
    )
}

/**
 * Validate an event with runtime decoding and state uniqueness
 *
 * @template A
 * @param {t.Decoder<unknown, A>} decoder io-ts codec
 * @param {Eq<A>} eq Comparison operator for unique
 * @param {A[]} collection Collection to search for unique comparison
 * @param {A} item Item to validate
 * @returns {E.Either<NonEmptyArray<Error>, A>} Decoder or unique error on failure, decode result on success
 */
export function validate<A> (decoder: t.Decoder<unknown, A>) {
  return (eq: Eq<A>) => (state: A[]) => (item: A): E.Either<Error, A> =>
    pipe(
      item,
      validateV(decoder)(eq)(state),
      E.mapLeft((err: NonEmptyArray<Error>) => new Error(String(err)))
    )
}

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
