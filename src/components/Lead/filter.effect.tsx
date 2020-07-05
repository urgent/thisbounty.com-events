import { Dependencies, Prompt, Effect, contraError, exec } from './effect'
import * as t from 'io-ts'
import { pipe, identity } from 'fp-ts/lib/function'
import { fold, parseJSON, toError } from 'fp-ts/lib/Either'
import { task } from 'fp-ts/lib/Task'

export const Bounty = t.type({
  id: t.keyof({ '1': null, '2': null, '3': null, '4': null })
})

type Bounty = t.TypeOf<typeof Bounty>

export const make = (bounty: MessageEvent): Effect =>
  pipe(
    parseJSON(bounty.data, toError),
    fold(identity, (json: JSON) =>
      pipe(
        Bounty.decode(json),
        fold<t.Errors, Bounty, Effect>(
          contraError,
          (bounty: Bounty) => (deps: Dependencies) =>
            task.of(deps.setBounty(bounty.id))
        )
      )
    )
  )

/**
 * Filter leads per bounty dimension
 *
 * @param {Dependencies} deps Dependencies needed to run effect
 * @param {MessageEvent} event Runtime message
 * @returns {Effect} Prompt for Dependencies or decode/function errors
 */
export const filter = (deps: Dependencies) => (event: MessageEvent) =>
  pipe(make(event), exec(deps))
