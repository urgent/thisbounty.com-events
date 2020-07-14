import {
  Leadbar,
  Dependencies,
  Effect,
  need,
  under,
  pick,
  exec
} from './effect'
import { LeadProps } from '../Lead'
import * as t from 'io-ts'
import { io } from 'fp-ts/lib/IO'
import { Either, fold } from 'fp-ts/lib/Either'
import { filter, map } from 'fp-ts/lib/Record'
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
export const action: Action = deps => leadbar => {
  deps.socket.send(JSON.stringify({ event: 'REQUEST_LEADS', data: leadbar }))
}

const _under = under(parseInt(process.env.REQUEST_LEADS_THRESHOLD))

/**
 * Validate leadbar for REQUEST_LEADS websocket send
 * @param {Leadbar} leadbar leads with bounty dimension
 * @returns {Either<Error, Leadbar>} Leadbar if valid, Error leadbar under threshold
 */
const validate = (leadbar: Leadbar): Either<Error, Leadbar> =>
  pipe(
    leadbar,
    map(pick),
    filter(_under),
    need(
      `REQUEST_LEADS canceled. No bounties under threshold of ${process.env.REQUEST_LEADS_THRESHOLD} leads`
    )
  )

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
type Request = (
  leadbar: Leadbar
) => (deps: Dependencies) => (event: MessageEvent) => void

/**
 * Send a request to a websocket for leads
 * @param leadbar existing leads in state dimensioned by bounty
 */
export const request: Request = leadbar => deps => message =>
  pipe(make(leadbar), exec(deps))
