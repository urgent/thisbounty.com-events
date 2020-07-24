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
export const action = (eq: Eq<Codec>) => (state: Codex) => (
  valid: Codex
) => async (deps: Dependencies) => {
  const update = pipe(state, mapWithIndex(assign(eq)(valid)))
  await deps.localForage.setItem(`leads`, update)
  deps.setState(update)
}

const _over = over(parseInt(process.env.REQUEST_LEADS_THRESHOLD))

type Validate = (
  codec: Codec
) => (
  eq: Eq<Codec>
) => (state: Codex) => (event: MessageEvent) => Either<Error, Codex>
/**
 * Remove empty or invalid leads
 */
const validate: Validate = codec => eq => state => event =>
  pipe(
    event,
    codex.of,
    pipe(pick(codec), map),
    pipe(deduplicate(eq)(state), mapWithIndex),
    filter(_over),
    need(
      `RECEIVE_LEADS canceled. No bounties over threshold of ${process.env.REQUEST_LEADS_THRESHOLD} leads`
    )
  )

/**
 * Make an effectual function from a runtime message
 */
type Make = (
  codec: Codec
) => (eq: Eq<Codec>) => (state: Codex) => (event: MessageEvent) => Effect
export const make: Make = codec => eq => state => event =>
  pipe(
    event,
    validate(codec)(eq)(state),
    fold<Error, Codex, Effect>(
      identity,
      (valid: Codex) => (deps: Dependencies) =>
        task.of(action(eq)(state)(valid)(deps))
    )
  )

type Receive = (
  codec: Codec
) => (
  eq: Eq<Codec>
) => (state: Codex) => (deps: Dependencies) => (event: MessageEvent) => Effect
export const receive: Receive = codec => eq => state => deps => event =>
  pipe(make(codec)(eq)(state)(event), exec(deps))
