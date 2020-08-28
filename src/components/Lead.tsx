import React, { useState, useEffect } from 'react'
import eventEmitter from '../utilities/eventEmitter'
import localForage from 'localforage'
import { create, receive } from '../utilities/component/create'
import { request } from '../utilities/socket/request'
import { respond } from '../utilities/socket/respond'
import { init } from '../utilities/component/init'
import { Lead as decoder } from '../utilities/security/codec'
import { Lead as eq } from '../utilities/security/eq'
import styles from './Lead/styles.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart'
import club from './Lead/club'
import diamond from './Lead/diamond'
import spade from './Lead/spade'
import { doSend } from '../utilities/socket'

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
  bounty: number
}

/**
 * Lead component props
 */
export interface LeadProps {
  suit: 'C' | 'D' | 'H' | 'S' | 'X'
  number: number | 'A' | 'K' | 'Q' | 'J'
  bounty: number
}

export function Leadbar (props: LeadbarProps): React.ReactElement {
  const [leads, setLeads] = useState([])
  const [bounty, setBounty] = useState(props.bounty)

  const deps = Object.assign(
    {},
    { bounty, setBounty, doSend, localForage, decoder, eq },
    { state: leads, setState: setLeads }
  )

  const _create = create(deps)
  const _receive = receive(deps)
  const _bookmark = console.log
  const _request = (event: MessageEvent) => {
    request(deps)()
  }
  const _respond = respond(deps)

  useEffect(() => {
    eventEmitter.on('NEW_LEAD', _create)
    eventEmitter.on('RECEIVE_LEADS', _receive)
    eventEmitter.on('CLICK_BOUNTY', setBounty)
    eventEmitter.on('BOOKMARK_LEAD', _bookmark)
    eventEmitter.on('REQUEST_LEADS', _request)
    eventEmitter.on('RESPOND_LEADS', _respond)

    // remove listeners on each render
    return () => {
      eventEmitter.off(`NEW_LEAD`, _create)
      eventEmitter.off('RECEIVE_LEADS', _receive)
      eventEmitter.off('CLICK_BOUNTY', setBounty)
      eventEmitter.off(`BOOKMARK_LEAD`, _bookmark)
      eventEmitter.off(`REQUEST_LEADS`, _request)
      eventEmitter.off(`RESPOND_LEADS`, _respond)
    }
  }, [leads, bounty])

  useEffect(() => {
    init(deps)('leads')()
  }, [])

  return (
    <div id={styles.leadbar}>
      {leads
        .filter(lead => {
          return lead.bounty === bounty
        })
        .map((lead: LeadProps) => (
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
