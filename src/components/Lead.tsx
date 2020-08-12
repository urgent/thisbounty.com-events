import React, { useState, useEffect } from 'react'
import eventEmitter from '../utilities/eventEmitter'
import socket from '../utilities/socket'
import localForage from 'localforage'
import { create } from '../utilities/component/create'
import { request } from '../utilities/socket/request'
import { respond } from '../utilities/socket/respond'
import { receive } from '../utilities/socket/receive'
import { flow } from 'fp-ts/lib/function'
import { Lead as decoder } from '../utilities/security/codec'
import { Lead as Type } from '../utilities/security/type'
import { Lead as eq } from '../utilities/security/eq'
import styles from './Lead/styles.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart'
import club from './Lead/club'
import diamond from './Lead/diamond'
import spade from './Lead/spade'
import * as E from 'fp-ts/lib/Either'
import { Dependencies, Result, parse } from '../utilities/utilities'

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

export function Leadbar (props: LeadbarProps): React.ReactElement {
  const [leads, setLeads] = useState([])
  const [bounty, setBounty] = useState(props.bounty)

  const deps = Object.assign(
    {},
    { bounty, setBounty, socket, localForage, decoder, eq },
    { state: leads, setState: setLeads }
  )

  const _create = create(deps)

  useEffect(() => {
    eventEmitter.on('NEW_LEAD', _create)
    /*eventEmitter.on('BOOKMARK_LEAD', _bookmark)
    eventEmitter.on('REQUEST_LEADS', request(deps))
    eventEmitter.on(
      'RESPOND_LEADS',
      flow(respond, reader => reader(deps)())
    )
    eventEmitter.on(
      'RECEIVE_LEADS',
      flow(receive, reader => reader(deps)())
    )*/
    // remove listeners on each render
    return () => {
      eventEmitter.off(`NEW_LEAD`, _create)
      /*eventEmitter.off(`BOOKMARK_LEAD`, _bookmark)
      eventEmitter.off(`REQUEST_LEADS`, request(deps))
      eventEmitter.off(
        `RESPOND_LEADS`,
        flow(respond, reader => reader(deps)())
      )
      eventEmitter.off(
        'RECEIVE_LEADS',
        flow(receive, reader => reader(deps)())
      )*/
    }
  }, [leads, bounty])

  useEffect(() => {
    //init(deps)()
  }, [])

  return (
    <div id={styles.leadbar}>
      {leads.map((lead: LeadProps) => (
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
