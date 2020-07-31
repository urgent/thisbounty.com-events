import { task } from 'fp-ts/lib/Task'
import * as E from 'fp-ts/lib/Either'
import { sequenceT } from 'fp-ts/lib/Apply'
import { NonEmptyArray, getSemigroup } from 'fp-ts/lib/NonEmptyArray'
import { reduce } from 'fp-ts/lib/Array'
import { pipe, flow } from 'fp-ts/lib/function'
import { Eq } from 'fp-ts/lib/Eq'
import { Reader } from 'fp-ts/lib/Reader'
import { Task } from 'fp-ts/lib/Task'
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import * as TE from 'fp-ts/lib/TaskEither'
import localForage from 'localforage'

export interface Dependencies<A> {
  bounty: string
  setBounty: React.Dispatch<React.SetStateAction<string>>
  state: A[]
  setState: React.Dispatch<React.SetStateAction<A[]>>
  socket: WebSocket
  localForage: typeof localForage
  codec: A
  eq: Eq<A>
}

/**
 * Add leads from websocket to state
 *
 * @param {Leadbar} leadbar leads from websocket, overwrites leads in state
 * @param {deps} Dependencies dependencies to write leads to state
 *
 * @return {void} runs effect
 */

export function action<A> (
  validated: A[]
): Reader<Dependencies<A>, Task<void>> {
  return (deps: Dependencies<A>) =>
    task.of(
      void (async () => {
        await deps.localForage.setItem(`leads`, validated)
        deps.setState(validated)
      })()
    )
}

export function decodeWith<A> (decoder: t.Decoder<unknown, A>) {
  return flow(
    decoder.decode,
    E.mapLeft((errors: t.Errors) => new Error(failure(errors).join('\n')))
  )
}

export function unique<A> (eq: Eq<A>) {
  return (state: A[]) => (event: A): E.Either<Error, A> => {
    if (state.findIndex((_state: A) => eq.equals(_state, event)) === -1) {
      return E.right(event)
    } else {
      return E.left(
        new Error(`Event ${JSON.stringify(event)} already exists in state`)
      )
    }
  }
}

function lift<E, A> (
  check: (a: A) => E.Either<E, A>
): (a: A) => E.Either<NonEmptyArray<E>, A> {
  return a =>
    pipe(
      check(a),
      E.mapLeft(a => [a])
    )
}

const decodeWithV = function<A> (decoder: t.Decoder<unknown, A>) {
  return lift(decodeWith(decoder))
}

const uniqueV = function<A> (eq: Eq<A>) {
  return (state: A[]) => lift(unique(eq)(state))
}

function validateLead<A> (decoder: t.Decoder<unknown, A>) {
  return (eq: Eq<A>) => (state: A[]) => (
    event: A
  ): E.Either<NonEmptyArray<Error>, A> =>
    pipe(
      sequenceT(E.getValidation(getSemigroup<Error>()))(
        decodeWithV(decoder)(event),
        uniqueV(eq)(state)(event)
      ),
      E.map(() => event)
    )
}

function validate<A> (decoder: t.Decoder<unknown, A>) {
  return (eq: Eq<A>) => (state: A[]) => (lead: A): E.Either<Error, A> =>
    pipe(
      lead,
      validateLead(decoder)(eq)(state),
      E.mapLeft((err: NonEmptyArray<Error>) => new Error(String(err)))
    )
}

type Result<A> = { errors: Error[]; leads: A[] }

export function receive<A> (decoder: t.Decoder<unknown, A>) {
  return (eq: Eq<A>) => (state: A[]) => (leads: A[]) =>
    pipe(
      TE.right(leads),
      TE.chain((leads: A[]) =>
        pipe(
          leads,
          reduce({ errors: [], leads: [] }, (acc: Result<A>, lead) =>
            pipe(
              lead,
              validate(decoder)(eq)(state),
              E.fold<Error, A, Result<A>>(
                (e: Error) => {
                  acc['errors'] = [...acc['errors'], e]
                  return acc
                },
                (lead: A) => {
                  acc['leads'] = [...acc['leads'], lead]
                  return acc
                }
              )
            )
          ),
          TE.right
        )
      )
    )
}
