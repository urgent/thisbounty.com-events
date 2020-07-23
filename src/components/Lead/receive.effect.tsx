import {
  Leadbar,
  Dependencies,
  Effect,
  exec,
  need,
  over,
  pick,
  deduplicate,
  eqLead
} from './effect'
import { LeadProps } from 'components/Lead'
import { task } from 'fp-ts/lib/Task'
import { Either, fold } from 'fp-ts/lib/Either'
import { filter, map, mapWithIndex } from 'fp-ts/lib/Record'
import { uniq } from 'fp-ts/lib/Array'
import { pipe, identity } from 'fp-ts/lib/function'

/**
 * Add leads from websocket to state
 *
 * @param {Leadbar} leadbar leads from websocket, overwrites leads in state
 * @param {deps} Dependencies dependencies to write leads to state
 *
 * @return {void} runs effect
 */
export const action = (leadbar: Leadbar) => async (deps: Dependencies) => {
  leadbar = Object.assign({ '1': [], '2': [], '3': [], '4': [] }, leadbar)

  const assign = (bounty: string, leads: LeadProps[]): LeadProps[] => {
    const update = [...leads, ...leadbar[bounty]]
    let result = uniq<LeadProps>(eqLead)(update)
    return result
  }
  const update = pipe(deps.leads, mapWithIndex(assign))
  await deps.localForage.setItem(`leads`, update)
  deps.setLeads(update)
}

const _over = over(parseInt(process.env.REQUEST_LEADS_THRESHOLD))

/**
 * Remove empty or invalid leads
 */
const validate = (state: Leadbar) => (
  event: MessageEvent
): Either<Error, Leadbar> =>
  pipe(
    Object.assign({} as Leadbar, event),
    map(pick),
    mapWithIndex(deduplicate(state)),
    filter(_over),
    need(
      `RECEIVE_LEADS canceled. No bounties over threshold of ${process.env.REQUEST_LEADS_THRESHOLD} leads`
    )
  )

/**
 * Make an effectual function from a runtime message
 */
type Make = (leadbar: Leadbar) => (event: MessageEvent) => Effect

export const make: Make = leadbar => event =>
  pipe(
    event,
    validate(leadbar),
    fold<Error, Leadbar, Effect>(identity, leadbar => (deps: Dependencies) =>
      task.of(action(leadbar)(deps))
    )
  )

export const receive = (state: Leadbar) => (deps: Dependencies) => (
  event: MessageEvent
) => pipe(make(state)(event), exec(deps))
