import { Leadbar, Dependencies, Effect, contraError, exec } from './effect'
import { LeadProps } from '../Lead'
import { io } from 'fp-ts/lib/IO'
import { Either, left, right, fold } from 'fp-ts/lib/Either'
import { filter, size } from 'fp-ts/lib/Record'
import { pipe, identity } from 'fp-ts/lib/function'

/**
 * Action with effect to send for valid RESPONSE_LEADS
 */
type Action = (deps: Dependencies) => (leadbar: Leadbar) => void

/**
 * Send RESPONSE_LEADS with data to websocket
 *
 * @param deps
 * @returns {void}
 */
export const action: Action = deps => leadbar => {
  deps.socket.send(JSON.stringify({ event: 'RESPONSE_LEADS', data: leadbar }))
}

/**
 * Validates leadbar for amount of leads over threshold
 */
type Validate = (leadbar: Leadbar) => Either<Error, Leadbar>

/**
 * Checks length
 *
 * @param {LeadProps[]} leads
 * @returns
 */
function valid (leads: LeadProps[]) {
  return leads.length >= parseInt(process.env.REQUEST_LEADS_THRESHOLD)
}

/**
 * Make sure leads are unique to request
 * @param leadbar
 */

/**
 * Validate leadbar eligibility to send to websocket for RESPONSE_LEADS
 *
 * @param {Leadbar} leadbar leads dimensioned by bounty
 * @returns {Either<Error, Leadbar>} Leadbar if leads over threshold, Error if under threshold
 */
const validate: Validate = leadbar =>
  pipe(leadbar, filter(valid), (valid: Leadbar) => {
    if (size(valid) === 0) {
      return left(
        new Error(
          `RESPONSE_LEADS canceled. Amount of leads in state under threshold of ${process.env.REQUEST_LEADS_THRESHOLD}`
        )
      )
    }
    return right(leadbar)
  })

/**
 * Make an effectual function to send RESPONSE_LEADS to websocket
 */
type Make = (leadbar: Leadbar) => Effect

export const make: Make = leadbar => {
  return pipe(
    leadbar,
    validate,
    fold<Error, Leadbar, Effect>(identity, leadbar => (deps: Dependencies) =>
      io.of(action(deps)(leadbar))
    )
  )
}

/**
 * Send leads to websocket
 * @param state
 */
export const response = (leadbar: Leadbar) => (deps: Dependencies) => (
  event: MessageEvent
) => pipe(make(leadbar), exec(deps))
