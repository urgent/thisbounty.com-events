import { pipe, flow } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as A from 'fp-ts/lib/Array'
import { sequenceT } from 'fp-ts/lib/Apply'
import { NonEmptyArray, getSemigroup } from 'fp-ts/lib/NonEmptyArray'
import { failure } from 'io-ts/lib/PathReporter'
import * as t from 'io-ts'
import { Eq } from 'fp-ts/lib/Eq'

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
