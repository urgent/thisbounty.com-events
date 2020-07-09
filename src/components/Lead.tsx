import React, { useState, useEffect } from 'react'
import eventEmitter from '../utilities/eventEmitter'
import socket from '../utilities/socket'
import { create } from './Lead/create.effect'
import { filter } from './Lead/filter.effect'
import { init } from './Lead/init.effect'
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
 
LeadbarProps passed as an array.
Find bounty id.

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

export function Leadbar (props: LeadbarProps): React.ReactElement {
  const [leads, setLeads] = useState(
    Object.assign({ '1': [], '2': [], '3': [], '4': [] })
  )
  const [bounty, setBounty] = useState(props.bounty)
  const deps = { leads, bounty, setLeads, setBounty }

  useEffect(() => {
    _create = create(leads[bounty])(deps)
    _filter = filter(deps)
    _bookmark = event => console.log(event)

    const need = (event: MessageEvent) =>
      socket.send(JSON.stringify({ event: 'READ_LEADS', data: leads }))

    const read = (event: Record<string, LeadProps[]>) =>
      setLeads(Object.assign({}, leads, event))

    eventEmitter.on('NEW_LEAD', _create)
    eventEmitter.on('BOOKMARK_LEAD', _bookmark)
    eventEmitter.on('CLICK_BOUNTY', _filter)
    eventEmitter.on('NEED_LEADS', need)
    eventEmitter.on('READ_LEADS', read)
    // remove listeners on each render
    return () => {
      eventEmitter.off(`NEW_LEAD`, _create)
      eventEmitter.off(`BOOKMARK_LEAD`, _bookmark)
      eventEmitter.off(`CLICK_BOUNTY`, _filter)
      eventEmitter.off(`NEED_LEADS`, need)
      eventEmitter.off(`READ_LEADS`, read)
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
        socket.send(
          JSON.stringify({
            event: 'BOOKMARK_LEAD',
            suit: props.suit,
            number: props.number
          })
        )
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
