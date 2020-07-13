import { Leadbar, Dependencies, Effect, contraError, exec } from './effect'
import { LeadProps } from '../Lead'
import { io } from 'fp-ts/lib/IO'
import { Either, left, right, fold } from 'fp-ts/lib/Either'
import { filter, size } from 'fp-ts/lib/Record'
import { pipe, identity } from 'fp-ts/lib/function'

/**
 * Action with effect to run on valid lead request to socket
 */
type Action = (deps: Dependencies) => (leadbar: Leadbar) => void

/**
 * Send REQUEST_LEADS with existing leads to socket
 * @param {Leadbar} leadbar existing leads so peers can check
 * @param {Dependencies} deps Dependencies needed to send to socket
 */
const action: Action = deps => leadbar => {
  deps.socket.send(JSON.stringify({ event: 'REQUEST_LEADS', data: leadbar }))
}

/**
 * Validation to determine if REQUEST_LEADS should send to websocket
 */
type Valid = (leadbar: Leadbar) => Either<Error, Leadbar>

/**
 * Validate leadbar for REQUEST_LEADS websocket send
 * @param {Leadbar} leadbar leads with bounty dimension
 * @returns {Either<Error, Leadbar>} Leadbar if valid, Error leadbar under threshold
 */
const validate: Valid = leadbar => {
  const empty = pipe(
    leadbar,
    filter(
      (leads: LeadProps[]) =>
        leads.length < parseInt(process.env.REQUEST_LEADS_THRESHOLD)
    )
  )
  if (size(empty) === 0) {
    return left(
      new Error(
        `REQUEST_LEADS canceled. No bounties under threshold of ${process.env.REQUEST_LEADS_THRESHOLD} leads`
      )
    )
  } else {
    return right(empty)
  }
}

/**
 * Make an effectful function for REQUEST_LEADS send
 */
type Make = (leadbar: Leadbar) => Effect

/**
 * Make an effectful function to send REQUEST_LEADS to websocket for valid leads
 * @param {Leadbar} leadbar leads dimensioned by bounty
 * @returns {Effect} Prompt for socket dependencies or Error
 */
export const make: Make = leadbar =>
  pipe(
    leadbar,
    validate,
    fold<Error, Leadbar, Effect>(identity, leadbar => (deps: Dependencies) =>
      io.of(action(deps)(leadbar))
    )
  )

/**
 * Request leads from websocket
 */
type Request = (leadbar: Leadbar) => (deps: Dependencies) => () => void

/**
 * Send a request to a websocket for leads
 * @param leadbar existing leads in state dimensioned by bounty
 */
export const request: Request = leadbar => deps => () =>
  pipe(make(leadbar), exec(deps))
