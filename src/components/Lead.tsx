import React, { useState, useEffect } from 'react'
import eventEmitter from '../utilities/eventEmitter'
import socket from '../utilities/socket'
import { create, run } from './Lead/effect'
import styles from './Lead/styles.module.scss'
import { pipe } from 'fp-ts/lib/function'
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

export interface LeadbarProps {
  leads: LeadProps[]
  bounty: string
  visible: boolean
}

/**
 * Lead component props
 */
export interface LeadProps {
  suit: 'C' | 'D' | 'H' | 'S' | 'X'
  number: number | 'A' | 'K' | 'Q' | 'J'
}

let handle: (message: MessageEvent) => void

export function Leadbar (props: LeadbarProps): React.ReactElement {
  const [leads, setLeads] = useState(props.leads)

  useEffect(() => {
    handle = (message: MessageEvent) =>
      pipe(
        // create an effect to set state and save to local storage
        create(leads)(message),
        // create return type is a union of io-ts error, string error, or a Task
        // if no error, run Task with required dependencies
        // if lead decode or duplicate error, return error without running side effects
        run({ bounty: props.bounty, setState: setLeads })
      )

    socket.onmessage = handle

    eventEmitter.on('NEW_LEAD', handle)
    // remove listeners on each render
    return () => {
      socket.removeEventListener('NEW_LEAD', handle)
      eventEmitter.off(`NEW_LEAD`, handle)
    }
  }, [leads])

  return (
    <div id={styles.leadbar}>
      {leads.map((lead: LeadProps) => (
        <Lead {...lead} />
      ))}
    </div>
  )
}

export function Lead (props: LeadProps) {
  return (
    <button
      className={styles.lead}
      key={`${props.suit}${props.number}`}
      style={{ color: '#FFF' }}
    >
      {suit[props.suit]}&nbsp;
      {`${props.number}`}
    </button>
  )
}

Leadbar.displayName = 'Leadbar'
