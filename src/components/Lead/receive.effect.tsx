import { Leadbar, Dependencies, Effect, contraError, exec } from './effect'
import { LeadProps } from '../Lead'
import { io } from 'fp-ts/lib/IO'
import { Either, left, right, fold } from 'fp-ts/lib/Either'
import { filter, size } from 'fp-ts/lib/Record'
import { pipe, identity } from 'fp-ts/lib/function'

export const action = (event: Leadbar) => (deps: Dependencies) => {
  deps.setLeads(Object.assign({}, event, deps.leads))
}

type Valid = (leadbar: Leadbar) => Either<Error, Leadbar>
/**
 * Remove empty or invalid leads
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
 * Make an effectual function from a runtime message
 */
type Make = (leads: Leadbar) => Effect

export const make: Make = leads => deps => io.of(action(leads)(deps))

export const receive = (state: Leadbar) => (deps: Dependencies) => (
  event: MessageEvent
) => pipe(make(event.data), exec(deps))
