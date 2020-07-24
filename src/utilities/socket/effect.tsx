import * as t from 'io-ts'
import { Reader } from 'fp-ts/lib/Reader'
import { Task } from 'fp-ts/lib/Task'
import { IO } from 'fp-ts/lib/IO'
import { Either, left, right, fold } from 'fp-ts/lib/Either'
import { Eq } from 'fp-ts/lib/Eq'
import { size } from 'fp-ts/lib/Record'
import { uniq } from 'fp-ts/lib/Array'
import { pipe, identity } from 'fp-ts/lib/function'
import localForage from 'localforage'
import { EventEmitter } from 'events'

/*

Need input for
- Codec, implements Codec
- Dependencies for effect
*/

export type Decodable = object

export interface Codec {
  decode: (runtime: Decodable) => Either<t.Errors, Codec>
}

export interface EqCodec {
  equals: (x: Codec, y: Codec) => boolean
}

/**
 * Shorthand type to dimension leads by bounty
 */
export type Codex = Record<string, Codec[]>

export const codex = {
  of: (event: MessageEvent): Codex =>
    Object.assign({ '1': [], '2': [], '3': [], '4': [] }, event.data)
}

/**
 * Dependencies needed to run effect
 * @export
 * @interface dependencies
 */
export interface Dependencies {
  bounty: string
  setBounty: React.Dispatch<React.SetStateAction<string>>
  state: Codex
  setState: React.Dispatch<React.SetStateAction<Codex>>
  socket: WebSocket
  localForage: typeof localForage
  eventEmitter: EventEmitter
  codec: Codec
  eq: EqCodec
}

/**
 * Prompt for dependencies required to run action
 */
export type Prompt = Reader<Dependencies, Task<void> | IO<void>>

/**
 * Effectful function
 */
export type Effect = Prompt | Error

/**
 * Checks for callable to determine if Lookup is a Prompt
 * @param {Result} result
 * @returns {boolean} True if result is callable
 */
export const isEffect = (effect: Effect): boolean =>
  typeof effect === 'function'

/**
 * Run effect if callable
 * @param {Dependencies} deps Requirements for effects
 * @param {Effect} effect effect to run
 * @returns {Effect} Constant correct Effect, side-effects called
 */
export const exec = (deps: Dependencies) => (effect: Effect) => {
  if (isEffect(effect)) {
    void (effect as Prompt)(deps)()
  }
  return effect
}

/**
 * Cast a io-ts Lead decode error into a Node Error
 * @param {t.Errors} error error to convert
 */
export const contraError = (error: t.Errors) =>
  Error(
    error.reduce(
      (prev, current): string =>
        `${prev} Runtime error value: ${current.value} -- `,
      ''
    )
  )

/**
 * Require Codex length
 *
 * @param {string} message Message for error
 * @param {Codex}  codex Codex to check
 * @returns {Either<Error, Codex>} Error if no records, Codex if records.
 */
export const need = (message: string) => (
  codex: Codex
): Either<Error, Codex> => {
  if (size(codex) === 0) {
    return left(new Error(message))
  } else {
    return right(codex)
  }
}

interface Sizeable {
  length: number
}

/**
 * Compare size of array to threshold, true if less than
 *
 * @param {Sizeable} array Subject of comparison
 * @returns {boolean} Result of comparison, true if less than
 */
export const under = (threshold: number) => (array: Sizeable): boolean =>
  array.length < threshold

/**
 * Compare size of array to threshold, true if greater than or equal
 *
 * @param {number} threshold Value of comparison
 * @param {Sizeable} array Subject of comparison
 * @returns {boolean} Result of comparison, true if greater than or equal
 */
export const over = (threshold: number) => (array: Sizeable): boolean =>
  array.length >= threshold

/**
 * Decode MessageEvent
 *
 * @param {MessageEvent} event MessageEvent to filter
 * @returns {Codec[]} Codec MessageEvent with failures removed
 */
export const pick = (codec: Codec) => (event: Codec[]): Codec[] =>
  event.filter(_event =>
    pipe(
      _event,
      codec.decode,
      fold<t.Errors, Codec, false | Codec>((e: t.Errors) => false, identity)
    )
  )

/**
 * Filter Codec array with a keyed Codex search
 *
 * @param {Codec} event value to search
 * @param {string} bounty key to search in
 * @param {Codex} state values to filter
 * @returns {Codec[]} values from state not in event
 */
export const deduplicate = (eq: Eq<Codec>) => (state: Codex) => (
  bounty: string,
  event: Codec[]
): Codec[] =>
  event.filter(
    // return true if event not in state
    // return false if event in state
    _event =>
      state[bounty].findIndex((_state: Codec) => eq.equals(_state, _event)) ===
      -1
  )

type Assign = (
  eq: Eq<Codec>
) => (valid: Codex) => (bounty: string, codec: Codec[]) => Codec[]
export const assign: Assign = eq => valid => (bounty, codec): Codec[] =>
  uniq<Codec>(eq)([...codec, ...valid[bounty]])
