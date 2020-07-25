import {
  Codec,
  Codex,
  codex,
  Dependencies,
  Effect,
  exec,
  need,
  over,
  pick,
  deduplicate,
  assign
} from './effect'
import { task } from 'fp-ts/lib/Task'
import { Either, fold } from 'fp-ts/lib/Either'
import { filter, map, mapWithIndex } from 'fp-ts/lib/Record'
import { pipe, identity } from 'fp-ts/lib/function'
import { Eq } from 'fp-ts/lib/Eq'

/**
 * Add leads from websocket to state
 *
 * @param {Leadbar} leadbar leads from websocket, overwrites leads in state
 * @param {deps} Dependencies dependencies to write leads to state
 *
 * @return {void} runs effect
 */
export const action = (valid: Codex) => async (deps: Dependencies) => {
  const update = pipe(deps.state, mapWithIndex(assign(deps.eq)(valid)))
  await deps.localForage.setItem(`leads`, update)
  deps.setState(update)
}

const _over = over(parseInt(process.env.REQUEST_LEADS_THRESHOLD))

type Validate = (
  deps: Dependencies
) => (event: MessageEvent) => Either<Error, Codex>
/**
 * Remove empty or invalid leads
 */
const validate: Validate = deps => event =>
  pipe(
    event,
    codex.of,
    pipe(pick(deps.codec), map),
    pipe(deduplicate(deps.eq)(deps.state), mapWithIndex),
    filter(_over),
    need(
      `RECEIVE_LEADS canceled. No bounties over threshold of ${process.env.REQUEST_LEADS_THRESHOLD} leads`
    )
  )

/**
 * Make an effectual function from a runtime message
 */
type Make = (deps: Dependencies) => (event: MessageEvent) => Effect
export const make: Make = deps => event =>
  pipe(
    event,
    validate(deps),
    fold<Error, Codex, Effect>(
      identity,
      (valid: Codex) => (deps: Dependencies) => task.of(action(valid)(deps))
    )
  )

type Receive = (deps: Dependencies) => (event: MessageEvent) => Effect
export const receive: Receive = deps => event =>
  pipe(make(deps)(event), exec(deps))
