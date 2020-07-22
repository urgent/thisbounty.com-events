import {
  Leadbar,
  Dependencies,
  Effect,
  pick,
  over,
  need,
  deduplicate,
  exec
} from './effect'
import { io } from 'fp-ts/lib/IO'
import { Either, fold } from 'fp-ts/lib/Either'
import { filter, mapWithIndex, map } from 'fp-ts/lib/Record'
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
export const action: Action = deps => response => {
  deps.socket.send(JSON.stringify({ event: 'RESPONSE_LEADS', data: response }))
}

/**
 * Returns true if amount of leads is greater than or equal to env.REQUEST_LEADS_THRESHOLD
 *
 * @param {LeadProps[]} leads amout of leads to check
 * @return {boolean} result of leads to env comparison
 */
const _over = over(parseInt(process.env.REQUEST_LEADS_THRESHOLD))

/**
 * Validates leadbar for amount of leads over threshold
 */
type Validate = (
  event: MessageEvent
) => (state: Leadbar) => Either<Error, Leadbar>

/**
 * Validate leadbar eligibility to send to websocket for RESPONSE_LEADS
 *
 * @param {Leadbar} leadbar leads dimensioned by bounty
 * @returns {Either<Error, Leadbar>} Leadbar if leads over threshold, Error if under threshold
 */
const validate: Validate = event => state =>
  // need to invert params. Check local state before sending in response, check response in receive
  pipe(
    state,
    map(pick),
    mapWithIndex(
      deduplicate(
        Object.assign({ '1': [], '2': [], '3': [], '4': [] } as Leadbar, event)
      )
    ),
    filter(_over),
    need(
      `RESPONSE_LEADS canceled. Amount of leads in state under threshold of ${process.env.REQUEST_LEADS_THRESHOLD}`
    )
  )

/**
 * Make an effectual function to send RESPONSE_LEADS to websocket
 */
type Make = (state: Leadbar) => (event: MessageEvent) => Effect

export const make: Make = state => event => {
  return pipe(
    state,
    validate(event),
    fold<Error, Leadbar, Effect>(identity, response => (deps: Dependencies) =>
      io.of(action(deps)(response))
    )
  )
}

/**
 * Send leads to websocket
 * @param state
 */
export const response = (state: Leadbar) => (deps: Dependencies) => (
  event: MessageEvent
) => pipe(make(state)(event), exec(deps))
