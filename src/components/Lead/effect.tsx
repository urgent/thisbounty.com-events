import { LeadProps } from 'components/Lead'
import localForage from 'localforage'
import * as t from 'io-ts'
import { Either, fold, left, right } from 'fp-ts/lib/Either'
import { task, Task } from 'fp-ts/lib/Task'
import { Reader } from 'fp-ts/lib/Reader'
import { pipe } from 'fp-ts/lib/function'

/**
 * Runtime type for a Bounty lead
 */
export const Lead = t.type({
  suit: t.keyof({ C: null, D: null, H: null, S: null, X: null }),
  number: t.union([t.keyof({ A: null, K: null, Q: null, J: null }), t.Int])
})

type Lead = t.TypeOf<typeof Lead>

/**
 * Add a Lead to component state
 */
type Merge = (lead: Lead) => (state: LeadProps[]) => Either<string, LeadProps>

/**
 * Check uniqueness and merge
 * @param {Lead} lead Runtime lead to add to state
 * @param {LeadProps[]} state React component state
 * @returns {Either<string, LeadProps>} Merged state and runtime, or non-unique error
 */

// don't need to pass state. probably best to take out that either, and just merge unique. array to set to array

export const merge: Merge = lead => (state = []) => {
  if (
    state.some(value => {
      console.log(value)
      console.log(lead)
      console.log(value.suit === lead.suit && value.number === lead.number)
      return value.suit === lead.suit && value.number === lead.number
    })
  ) {
    return left(`${lead.suit}${lead.number} already exists in state`)
  }
  return right(lead)
}

/**
 * Reader for deps required on successful merge
 */
type Success = Reader<Dependencies, Task<Promise<void>>>

/**
 * Requirements for effectful mutation on succesful merge
 * @export
 * @interface Dependencies
 */
export interface Dependencies {
  bounty: string
  setState: React.Dispatch<React.SetStateAction<LeadProps[]>>
}

/**
 * Runtime handler for lead decode
 */
export type OnRuntime = (
  state: LeadProps[]
) => (runtime: Lead) => Success | string

/**
 * Decode runtime and fold to merge with state
 * @param {LeadProps[]} state Existing React component state
 * @param {Lead} runtime Runtime lead to merge with state
 * @returns {Success | string} Reader returning an effectful function or error message
 */
export const onRuntime: OnRuntime = state => runtime =>
  fold<string, LeadProps, Success | string>(
    (error: string): string => error,
    onMerge
  )(merge(runtime)(state))

/**
 * Handle to merge runtime with state
 */
export type OnMerge = (merge: LeadProps) => Success

/**
 * Return effect which saves merge to local storage and state
 * @param {LeadProps} merge Merged state with runtime
 * @returns {Success} Requirement prompt to set state and run effect
 */
export const onMerge: OnMerge = (merge: LeadProps): Success => deps => {
  const mutate = async () => {
    deps.setState(prev => {
      return Array.from(new Set([merge, ...prev]))
    })
    await localForage.setItem(`${deps.bounty}.leads`, merge)
  }
  return task.of(mutate())
}

/**
 * Effectual function for lead create
 */
type Create = (
  state: LeadProps[]
) => (event: MessageEvent) => Success | t.Errors | string

/**
 * Merge state with runtime
 * @param {LeadProps[]} state Existing state
 * @param {MessageEvent} event Runtime
 * @returns {Success | t.Errors | string} Effectful function to run on success, or existing state
 */
export const create: Create = state => event =>
  pipe(
    event.data,
    JSON.parse,
    Lead.decode,
    // this doesn't get rid of the either.
    fold<t.Errors, Lead, Success | t.Errors | string>(
      (error: t.Errors) => error,
      onRuntime(state)
    )
  )

/**
 * Check for successful merge, if function or errors
 * @param {Success | t.Errors | string} merge Result of merge state with runtime
 * @returns {boolean} True if merge is callable
 */
export const isSuccess = (merge: Success | t.Errors | string): boolean =>
  typeof merge === 'function'

/**
 * Run effect if callable
 * @param {Dependencies} deps Requirements for effects
 * @returns {Success | t.Errors | string}
 */
export const run = (deps: Dependencies) => (
  effect: Success | t.Errors | string
) => {
  if (isSuccess(effect)) {
    void (effect as Success)(deps)()
  }
  return effect
}
