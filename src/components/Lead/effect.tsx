import * as t from 'io-ts'
import { Reader } from 'fp-ts/lib/Reader'
import { Task } from 'fp-ts/lib/Task'
import { LeadProps } from 'components/Lead'

/**
 * Cast a io-ts Lead decode error into a Node Error
 * @param {t.Errors} error error to convert
 */
export const contraError = (error: t.Errors) =>
  Error(
    error.reduce(
      (prev, current): string => `${prev} ${current.context}:${current.value}`,
      ''
    )
  )

/**
 * Dependencies needed to run effect
 * @export
 * @interface dependencies
 */
export interface Dependencies {
  bounty: string
  setLeads: React.Dispatch<React.SetStateAction<Record<string, LeadProps[]>>>
  setBounty: React.Dispatch<React.SetStateAction<string>>
}

/**
 * Prompt for dependencies required to run action
 */
export type Prompt = Reader<Dependencies, Task<void>>

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
