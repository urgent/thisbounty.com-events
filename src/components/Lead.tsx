import React, { useState, useEffect } from 'react'
import eventEmitter from '../utilities/eventEmitter'
import socket from '../utilities/socket'
import localForage from 'localforage'
import { create } from './Lead/create.effect'
import { filter } from './Lead/filter.effect'
import { init } from './Lead/init.effect'
import * as TE from 'fp-ts/lib/TaskEither'
import { request } from '../utilities/socket/request'
import { respond } from '../utilities/socket/respond'
import { receive } from '../utilities/socket/receive'
import { pipe, flow } from 'fp-ts/lib/function'
import * as t from 'io-ts'
import styles from './Lead/styles.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart'
import club from './Lead/club'
import diamond from './Lead/diamond'
import spade from './Lead/spade'

const suit = {
  H: <FontAwesomeIcon icon={faHeart} className={styles.heart} />,
  C: club,
  D: diamond,
  S: spade,
  X: '*'
}

/**
 * Leadbar component props
 * Leads have bounty dimension, active lead visible
 */

export interface LeadbarProps {
  bounty: string
}

/**
 * Lead component props
 */
export interface LeadProps {
  suit: 'C' | 'D' | 'H' | 'S' | 'X'
  number: number | 'A' | 'K' | 'Q' | 'J'
}

let _create: (lead: MessageEvent) => void
let _filter: (lead: MessageEvent) => void
let _bookmark: (lead: MessageEvent) => void

const decoder = t.type({
  suit: t.keyof({ C: null, D: null, H: null, S: null, X: null }),
  number: t.union([t.keyof({ A: null, K: null, Q: null, J: null }), t.Int])
})

type Codec = t.TypeOf<typeof decoder>

const eq = {
  equals: (x: Codec, y: Codec) => x.suit === y.suit && x.number === y.number
}

export function Leadbar (props: LeadbarProps): React.ReactElement {
  const [leads, setLeads] = useState(
    Object.assign({ '1': [], '2': [], '3': [], '4': [] })
  )
  const [bounty, setBounty] = useState(props.bounty)

  const deps = Object.assign(
    {},
    { bounty, setBounty, socket, localForage, decoder, eq },
    { state: leads, setState: setLeads }
  )

  useEffect(() => {
    _create = create(leads[bounty])(deps)
    _filter = filter(deps)
    _bookmark = event => console.log(event)

    eventEmitter.on('NEW_LEAD', _create)
    eventEmitter.on('BOOKMARK_LEAD', _bookmark)
    eventEmitter.on('CLICK_BOUNTY', _filter)
    eventEmitter.on('REQUEST_LEADS', request(deps))
    eventEmitter.on(
      'RESPOND_LEADS',
      flow(respond, reader => reader(deps)())
    )
    eventEmitter.on(
      'RECEIVE_LEADS',
      flow(receive, reader => reader(deps)())
    )
    // remove listeners on each render
    return () => {
      eventEmitter.off(`NEW_LEAD`, _create)
      eventEmitter.off(`BOOKMARK_LEAD`, _bookmark)
      eventEmitter.off(`CLICK_BOUNTY`, _filter)
      eventEmitter.off(`REQUEST_LEADS`, request(deps))
      eventEmitter.off(
        `RESPOND_LEADS`,
        flow(respond, reader => reader(deps)())
      )
      eventEmitter.off(
        'RECEIVE_LEADS',
        flow(receive, reader => reader(deps)())
      )
    }
  }, [leads, bounty])

  useEffect(() => {
    //init(deps)()
  }, [])

  return (
    <div id={styles.leadbar}>
      {leads[bounty].map((lead: LeadProps) => (
        <Lead {...lead} key={`${lead.suit}${lead.number}`} />
      ))}
    </div>
  )
}

export function Lead (props: LeadProps) {
  return (
    <button
      className={styles.lead}
      style={{ color: '#FFF' }}
      onClick={() => {
        eventEmitter.emit(
          'BOOKMARK_LEAD',
          JSON.stringify({ suit: props.suit, number: props.number })
        )
      }}
    >
      {suit[props.suit]}&nbsp;
      {`${props.number}`}
    </button>
  )
}

Leadbar.displayName = 'Leadbar'
