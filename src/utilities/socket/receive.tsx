import {
  Codec,
  Codex,
  codex,
  Dependencies,
  Effect,
  Prompt,
  exec,
  need,
  over,
  pick,
  deduplicate,
  assign
} from './effect'
import { task } from 'fp-ts/lib/Task'
import * as E from 'fp-ts/lib/Either'
import { sequenceT } from 'fp-ts/lib/Apply'

import { Semigroup } from 'fp-ts/lib/Semigroup'

import { NonEmptyArray, getSemigroup } from 'fp-ts/lib/NonEmptyArray'
import { map, sequence, traverse, reduce } from 'fp-ts/lib/Array'

import { pipe, flow, identity } from 'fp-ts/lib/function'
import { Eq } from 'fp-ts/lib/Eq'
import { Reader } from 'fp-ts/lib/Reader'
import { Task } from 'fp-ts/lib/Task'
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'
import * as TE from 'fp-ts/lib/TaskEither'

/**
 * Add leads from websocket to state
 *
 * @param {Leadbar} leadbar leads from websocket, overwrites leads in state
 * @param {deps} Dependencies dependencies to write leads to state
 *
 * @return {void} runs effect
 */
type Action = (validated: Codex) => Reader<Dependencies, Task<void>>

export const action: Action = validated => (deps: Dependencies) =>
  task.of(
    void (async () => {
      await deps.localForage.setItem(`leads`, validated)
      deps.setState(validated)
    })()
  )

export const Lead = t.type({
  suit: t.keyof({ C: null, D: null, H: null, S: null, X: null }),
  number: t.union([t.keyof({ A: null, K: null, Q: null, J: null }), t.number]),
  bounty: t.keyof({ 1: null, 2: null, 3: null, 4: null })
})

export type Lead = t.TypeOf<typeof Lead>

export const eqLead: Eq<Lead> = {
  equals: (x: Lead, y: Lead) => x.suit === y.suit && x.number === y.number
}

/*
Trying to abstract request, respond, receive to a utility for easy component creation
Problems:
xxx 1. Abstraction away the io-ts type. Does not work in typescript. Only way now is any
Fixed with new decode from reference

xxx 2. Nested Records. {'1': [lead, lead]}. Either.getValidation works better with the same inputs
Get rid of nesting, put bounty property in Lead
Start with input in container, and apply validation to that.

What to do?

1. 
Take the fp-ts approach.

Start with an interface, then create an object

2.
Reverse the approach. Start with the effectful operation. Then approach through TaskEither, inside it might fail.


Rules

leads must decode
leads must be unique to existing state


Idea:
Move bounty property to lead, flatten state

*/

export interface Request<A> {
  payload: NonEmptyArray<A>
  decoder: t.Decoder<unknown, A>
}

/* Different types */

export const decodeWith = function<A> (decoder: t.Decoder<unknown, A>) {
  return flow(
    decoder.decode,
    E.mapLeft((errors: t.Errors) => new Error(failure(errors).join('\n')))
  )
}

export const unique = function<A> (eq: Eq<A>) {
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

const event = {
  data: [
    { suit: 'H', number: 8, bounty: 1 },
    { suit: 'H', number: 9, bounty: 1 },
    { suit: 'H', number: 10, bounty: 1 },
    { suit: 'H', number: 'J', bounty: 1 }
  ]
}

const validate = (state: Lead[]) => (lead: Lead): E.Either<Error, Lead> =>
  pipe(
    lead,
    validateLead(Lead)(eqLead)(state),
    E.mapLeft((err: NonEmptyArray<Error>) => new Error(String(err)))
  )

const validateV = (state: Lead[]) => lift(validate(state))

const _sequence = sequence(E.Applicative)
const _traverse = traverse(E.Applicative)

function semigroup<E, A> (S: Semigroup<A>): Semigroup<E.Either<E, A>> {
  return {
    concat: (x, y) =>
      E.isLeft(y) ? x : E.isLeft(x) ? y : E.right(S.concat(x.right, y.right))
  }
}
type Result = { errors: Error[]; leads: Lead[] }
export const receive = (state: Lead[]) => (leads: Lead[]) =>
  pipe(
    TE.right(leads),
    TE.chain((leads: Lead[]) =>
      pipe(
        leads,
        reduce({ errors: [], leads: [] }, (acc: Result, lead) =>
          pipe(
            lead,
            validate(state),
            //side effects
            E.fold<Error, Lead, Result>(
              (e: Error) => {
                acc['errors'] = [...acc['errors'], e]
                return acc
              },
              (lead: Lead) => {
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
