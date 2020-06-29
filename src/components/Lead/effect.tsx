import { LeadProps } from 'components/Lead'
import localForage from 'localforage'
import * as t from 'io-ts'
import { Either, fold, left, right } from 'fp-ts/lib/Either'
import { task, Task } from 'fp-ts/lib/Task'
import { Reader } from 'fp-ts/lib/Reader'
import { pipe, identity } from 'fp-ts/lib/function'

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
 * Prompt for dependencies required to run setState function or local storage id
 */
export type Prompt = Reader<Dependencies, Task<void>>

/**
 * Dependencies needed to run effect
 * @export
 * @interface dependencies
 */
export interface Dependencies {
  bounty: string
  setState: React.Dispatch<React.SetStateAction<Record<string, LeadProps[]>>>
}

/**
 * Effect to run on succesful runtime validation
 */
export type Effect = (deps: Dependencies) => (state: LeadProps[]) => void

/**
 * Set state and save to local storage
 * @param {Dependencies} deps Dependencies needed to run effect
 * @param {LeadProps[]} state State to set and save to local storage
 */
const effect: Effect = deps => async state => {
  deps.setState({ [deps['bounty']]: state })
  await localForage.setItem(`leads.${deps.bounty}`, state)
}

/**
 * Handle to merge runtime with state
 */
export type OnMerge = (merge: LeadProps[]) => Prompt

/**
 * Return effect which saves to local storage and state
 * @param {LeadProps} merge Merged state with runtime
 * @returns {Prompt} Prompt for Dependencies or errors
 */
export const onMerge: OnMerge = (merge: LeadProps[]): Prompt => deps =>
  task.of(effect(deps)(merge))

/**
 * Handle to decode runtime and merge with state
 */
export type OnRuntime = (
  state: LeadProps[]
) => (runtime: Runtime) => Error | Prompt

/**
 * Decode runtime and merge. Return errors or effectful function to run
 * @param {LeadProps[]} state React component state
 * @param {Runtime} runtime Runtime to add to state
 */
export const onRuntime: OnRuntime = function (state) {
  return runtime =>
    pipe(
      merge(state)(runtime),
      fold<Error, LeadProps[], Error | Prompt>(identity, onMerge)
    )
}

/**
 * Create an effectual function from a runtime message
 */
type Create = (state: LeadProps[]) => (event: MessageEvent) => Result

/**
 * Effectful function
 */
type Result = Prompt | Error

/**
 * Cast a io-ts Lead decode error into a Node Error
 * @param {t.Errors} error error to convert
 */
const contraError = (error: t.Errors) =>
  Error(
    error.reduce(
      (prev, current): string => `${prev} ${current.context}:${current.value}`,
      ''
    )
  )

/**
 * Create an effectful function to merge runtime with state, set state, and save to local storage
 * @param {MessageEvent} event Runtime message
 * @returns {Result} Prompt for Dependencies or decode/function errors
 */
export const create: Create = state => event =>
  pipe(
    event.data,
    JSON.parse,
    Runtime.decode,
    fold<t.Errors, Runtime, Prompt | Error>(contraError, onRuntime(state))
  )

/**
 * Checks for callable input to determine if Result is a Prompt
 * @param {Result} result
 * @returns {boolean} True if result is callable
 */
export const isPrompt = (result: Result): boolean =>
  typeof result === 'function'

/**
 * Run result if callable
 * @param {Dependencies} deps Requirements for effects
 * @param {Result} result result from a Create call
 * @returns {Result} Constant correct result with effectful function called
 */
export const run = (deps: Dependencies) => (result: Result) => {
  if (isPrompt(result)) {
    void (result as Prompt)(deps)()
  }
  return result
}
