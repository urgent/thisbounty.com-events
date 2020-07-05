import { LeadProps } from 'components/Lead'
import localForage from 'localforage'
import { Dependencies, Prompt, Effect, contraError, exec } from './effect'
import * as t from 'io-ts'
import { Either, fold, left, right, parseJSON, toError } from 'fp-ts/lib/Either'
import { task } from 'fp-ts/lib/Task'
import { pipe, identity } from 'fp-ts/lib/function'

/**
 * Action with effect to run on succesful runtime validation
 */
export type Action = (deps: Dependencies) => (state: LeadProps[]) => void

/**
 * Set state and save to local storage
 * @param {Dependencies} deps Dependencies needed to run action
 * @param {LeadProps[]} state State to set and save to local storage
 */
const action: Action = deps => async state => {
  deps.setLeads({ [deps['bounty']]: state })
  await localForage.setItem(`leads.${deps.bounty}`, state)
}

/**
 * Runtime type for a Bounty lead
 */
export const Runtime = t.type({
  suit: t.keyof({ C: null, D: null, H: null, S: null, X: null }),
  number: t.union([t.keyof({ A: null, K: null, Q: null, J: null }), t.Int])
})

type Runtime = t.TypeOf<typeof Runtime>

/**
 * Merge runtime with component state
 */
type Merge = (
  state: LeadProps[]
) => (runtime: Runtime) => Either<Error, LeadProps[]>

/**
 * Check uniqueness and merge
 * @param {LeadProps[]} state React component state
 * @param {Runtime} runtime Runtime to add to state
 * @returns {Either<Error, LeadProps[]>} Merged state and runtime, or non-unique error
 */
export const merge: Merge = state => runtime => {
  if (
    state.some(
      (value: LeadProps) =>
        value.suit === runtime.suit && value.number === runtime.number
    )
  ) {
    return left(
      new Error(`${runtime.suit}${runtime.number} already exists in state.`)
    )
  } else {
    return right([runtime, ...state])
  }
}

/**
 * Return a Depencies Reader on successful merge
 */
export type OnMerge = (merge: LeadProps[]) => Prompt

/**
 * Return action which saves to local storage and state
 * @param {LeadProps} merge Merged state with runtime
 * @returns {Prompt} Prompt for Dependencies or errors
 */
export const onMerge: OnMerge = (merge: LeadProps[]): Prompt => deps =>
  task.of(action(deps)(merge))

/**
 * On successful runtime runtime decode, merge with existing state
 */
export type OnRuntime = (state: LeadProps[]) => (runtime: Runtime) => Effect

/**
 * Merge runtime with state. Return errors or effectful action to run
 * @param {LeadProps[]} state React component state
 * @param {Runtime} runtime Runtime to add to state
 */
export const onRuntime: OnRuntime = function (state) {
  return runtime =>
    pipe(
      merge(state)(runtime),
      fold<Error, LeadProps[], Effect>(identity, onMerge)
    )
}

/**
 * Make an effectual function from a runtime message
 */
type Make = (state: LeadProps[]) => (event: MessageEvent) => Effect

/**
 * Make an effectful function to merge runtime with state, set state, and save to local storage
 * @param {MessageEvent} event Runtime message
 * @returns {Effect} Prompt for Dependencies or decode/function errors
 */

export const make: Make = state => event =>
  pipe(
    parseJSON<Error>(event.data, toError),
    fold<Error, JSON, Effect>(identity, (json: JSON) =>
      pipe(
        Runtime.decode(json),
        fold<t.Errors, Runtime, Effect>(contraError, onRuntime(state))
      )
    )
  )

/**
 * Merge runtime leads with state, set state, and save to local storage by bounty id
 *
 * @param {LeadProps[]} state Existing leads state
 * @param {Dependencies} deps Dependencies needed to run effect
 * @param {MessageEvent} event Runtime message
 * @returns {Effect} Prompt for Dependencies or decode/function errors
 */
export const create = (state: LeadProps[]) => (deps: Dependencies) => (
  event: MessageEvent
) =>
  pipe(
    // create an effect to set state and save to local storage
    make(state)(event),
    // create return type is a union of io-ts error, string error, or a Task
    // if no error, run Task with required dependencies
    // if lead decode or duplicate error, return error without running side effects
    exec(deps)
  )
