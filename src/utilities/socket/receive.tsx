import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'
import { reduce, findFirst } from 'fp-ts/lib/Array'
import { sequenceT } from 'fp-ts/lib/Apply'
import { NonEmptyArray, getSemigroup } from 'fp-ts/lib/NonEmptyArray'
import { Eq } from 'fp-ts/lib/Eq'
import { Reader, ask, chain } from 'fp-ts/lib/Reader'
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
      findFirst((_collection: A) => eq.equals(_collection, item)),
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
function validate<A> (decoder: t.Decoder<unknown, A>) {
  return (eq: Eq<A>) => (state: A[]) => (item: A): E.Either<Error, A> =>
    pipe(
      item,
      validateV(decoder)(eq)(state),
      E.mapLeft((err: NonEmptyArray<Error>) => new Error(String(err)))
    )
}

/**
 * Struct of errors and valid
 */
type Result<A> = { errors: Error[]; valid: A[] }

/**
 * Parse event data
 *
 * @template A
 * @param {A[]} data event data to parse
 * @returns {Reader<Dependencies<A>, Result<A>>} Dependecies Reader for parsed data
 */
export function parse<A> (data: A[]): Reader<Dependencies<A>, Result<A>> {
  return (deps: Dependencies<A>) =>
    pipe(
      data,
      reduce({ errors: [], valid: [] }, (acc: Result<A>, item) =>
        pipe(
          item,
          validate(deps.decoder)(deps.eq)(deps.state),
          E.fold<Error, A, Result<A>>(
            (e: Error) => {
              acc['errors'] = [...acc['errors'], e]
              return acc
            },
            (item: A) => {
              acc['valid'] = [...acc['valid'], item]
              return acc
            }
          )
        )
      )
    )
}

/**
 * Receive data from websocket and return effects to run
 *
 * @export
 * @template A
 * @param {A[]} data event data to parse
 * @returns {Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>>} Dependecies Reader for effects to run
 */
export function receive<A> (
  data: A[]
): Reader<Dependencies<A>, TE.TaskEither<Error, Result<A>>> {
  return pipe(
    ask<Dependencies<A>>(),
    // allows the Reader from action to use Dependencies for parse
    chain((deps: Dependencies<A>) => action<A>(parse(data)(deps)))
  )
}

/**
 * Run effectful actions
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
      return TE.right(
        void (async () => {
          await deps.localForage.setItem(`leads`, result.valid)
          deps.setState(result.valid)
          return result
        })()
      )
    }
  }
}
