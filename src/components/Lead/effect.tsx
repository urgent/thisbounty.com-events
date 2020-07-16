import * as t from 'io-ts'
import { Reader } from 'fp-ts/lib/Reader'
import { Task } from 'fp-ts/lib/Task'
import { IO } from 'fp-ts/lib/IO'
import { LeadProps } from 'components/Lead'
import { size } from 'fp-ts/lib/Record'
import { Eq } from 'fp-ts/lib/Eq'
import { Either, left, right, fold } from 'fp-ts/lib/Either'
import { pipe, identity } from 'fp-ts/lib/function'

/**
 * Shorthand type to dimension leads by bounty
 */
export type Leadbar = Record<string, LeadProps[]>

/**
 * Runtime type for a Bounty lead
 */
export const Runtime = t.type({
  suit: t.keyof({ C: null, D: null, H: null, S: null, X: null }),
  number: t.union([t.keyof({ A: null, K: null, Q: null, J: null }), t.Int])
})

export type Runtime = t.TypeOf<typeof Runtime>

/**
 * Dependencies needed to run effect
 * @export
 * @interface dependencies
 */
export interface Dependencies {
  bounty: string
  leads: Leadbar
  setLeads: React.Dispatch<React.SetStateAction<Leadbar>>
  setBounty: React.Dispatch<React.SetStateAction<string>>
  socket: WebSocket
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
 * Checks for callable input to determine if Lookup is a Prompt
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
 * Make a leadbar need to have records or return error with message
 *
 * @param {string} message Message for error
 * @param {Leadbar} leadbar Leadbar to check for elements
 * @returns {Either<Error, Leadbar>} Error if no records, leadbar if records.
 */
export const need = (message: string) => (
  leadbar: Leadbar
): Either<Error, Leadbar> => {
  if (size(leadbar) === 0) {
    return left(new Error(message))
  } else {
    return right(leadbar)
  }
}

/**
 * Returns true if amount of leads is less than provided threshold
 *
 * @param {number} threshold Amount of leads
 * @param {LeadProps[]} leads Leads to check
 * @returns {boolean} Result of leads less than threshold comparison
 */
export const under = (threshold: number) => (leads: LeadProps[]): boolean =>
  leads.length < threshold

/**
 * Returns true if amount of leads is greater than or equal to provided threshold
 *
 * @param {number} threshold Amount of leads
 * @param {LeadProps[]} leads Leads to check
 * @returns {boolean} Result of leads greater than threshold comparison
 */
export const over = (threshold: number) => (leads: LeadProps[]): boolean =>
  leads.length >= threshold

/**
 * Decode Runtime data returning false on failure
 *
 * @param {LeadProps} lead Runtime data to decode
 * @returns {false | Runtime} False on decode failure, decoded Runtime on success
 */
export const decode = (lead: LeadProps): false | Runtime =>
  pipe(
    Runtime.decode(lead),
    fold<t.Errors, Runtime, false | Runtime>((e: t.Errors) => false, identity)
  )

/**
 * Remove invalid leads with Runtime decoding
 *
 * @param {LeadProps[]} leads Leads to cast
 * @returns {LeadProps[]} Leads cast by decoding Runtime, with invalid leads removed
 */
export const pick = (leads: LeadProps[]): LeadProps[] => leads.filter(decode)

export const eqLead: Eq<LeadProps> = {
  equals: (x: LeadProps, y: LeadProps) =>
    x.suit === y.suit && x.number === y.number
}
