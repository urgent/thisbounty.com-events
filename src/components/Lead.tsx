import React, { useState, useEffect } from 'react'
import eventEmitter from '../utilities/eventEmitter'
import socket from '../utilities/socket'
import { create } from './Lead/create.effect'
import { filter } from './Lead/filter.effect'
import { init } from './Lead/init.effect'
import { request } from './Lead/request.effect'
import { response } from './Lead/response.effect'
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
let _request: (lead: MessageEvent) => void
let _response: (lead: MessageEvent) => void

export function Leadbar (props: LeadbarProps): React.ReactElement {
  const [leads, setLeads] = useState(
    Object.assign({ '1': [], '2': [], '3': [], '4': [] })
  )
  const [bounty, setBounty] = useState(props.bounty)
  // flags for websocket
  const [requesting, setRequesting] = useState(false)
  const [responding, setResponding] = useState(false)
  // buffer
  const [interval, setInterval] = useState(false)
  const deps = { leads, bounty, setLeads, setBounty, socket }

  useEffect(() => {
    _create = create(leads[bounty])(deps)
    _filter = filter(deps)
    _bookmark = event => console.log(event)
    _request = request(leads)(deps)
    _response = response(leads)

    eventEmitter.on('NEW_LEAD', _create)
    eventEmitter.on('BOOKMARK_LEAD', _bookmark)
    eventEmitter.on('CLICK_BOUNTY', _filter)
    eventEmitter.on('REQUEST_LEADS', _request)
    eventEmitter.on('RESPONSE_LEADS', _response)
    // remove listeners on each render
    return () => {
      eventEmitter.off(`NEW_LEAD`, _create)
      eventEmitter.off(`BOOKMARK_LEAD`, _bookmark)
      eventEmitter.off(`CLICK_BOUNTY`, _filter)
      eventEmitter.off(`REQUEST_LEADS`, _request)
      eventEmitter.off(`RESPONSE_LEADS`, _response)
    }
  }, [leads, bounty])

  useEffect(() => {
    init(deps)()
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
