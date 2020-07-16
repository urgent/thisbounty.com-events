import {
  Leadbar,
  Dependencies,
  Effect,
  exec,
  need,
  over,
  pick,
  eqLead
} from './effect'
import { LeadProps } from 'components/Lead'
import { io } from 'fp-ts/lib/IO'
import { Either, fold } from 'fp-ts/lib/Either'
import { filter, map, mapWithIndex } from 'fp-ts/lib/Record'
import { uniq } from 'fp-ts/lib/Array'
import { pipe, identity } from 'fp-ts/lib/function'

// replace this with create? Add to local storage. de dup, validate
export const action = (leadbar: Leadbar) => (deps: Dependencies) => {
  const assign = (bounty: string, leads: LeadProps[]): LeadProps[] => {
    const update = [...leads, ...leadbar[bounty]]
    let result = uniq<LeadProps>(eqLead)(update)
    return result
  }
  const update = pipe(deps.leads, mapWithIndex(assign))
  deps.setLeads(update)
}

const _over = over(parseInt(process.env.REQUEST_LEADS_THRESHOLD))

/**
 * Remove empty or invalid leads
 */
const validate = (leadbar: Leadbar): Either<Error, Leadbar> =>
  pipe(
    leadbar,
    map(pick),
    filter(_over),
    need(
      `RECEIVE_LEADS canceled. No bounties over threshold of ${process.env.REQUEST_LEADS_THRESHOLD} leads`
    )
  )

/**
 * Make an effectual function from a runtime message
 */
type Make = (leadbar: Leadbar) => Effect

export const make: Make = leadbar =>
  pipe(
    leadbar,
    validate,
    fold<Error, Leadbar, Effect>(identity, leadbar => (deps: Dependencies) =>
      io.of(action(leadbar)(deps))
    )
  )

export const receive = (leadbar: Leadbar) => (deps: Dependencies) => (
  event: MessageEvent
) => pipe(make(event.data), exec(deps))
