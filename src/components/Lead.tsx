import React, { useState, useEffect } from 'react'
import eventEmitter from '../utilities/eventEmitter'
import socket from '../utilities/socket'
import { create, run } from './Lead/effect'
import { pipe } from 'fp-ts/lib/function'

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

  handle = (message: MessageEvent) => {
    return pipe(
      // create an effect to set state and save to local storage
      create(leads)(message),
      // create return type is a union of io-ts error, string error, or a Task
      // if no errors, run Task with required dependencies
      // if errors, return errors. @TODO: if error emit in userland events or set state in local component.
      run({ bounty: props.bounty, setState: setLeads })
    )
  }

  useEffect(() => {
    socket.onmessage = message => {
      handle(message)
    }
    eventEmitter.on('NEW_LEAD', handle)
    // remove listeners on each render
    return () => {
      socket.removeEventListener('message', handle)
      eventEmitter.off(`CREATE_LEAD`, handle)
    }
  }, [])

  return (
    <>
      {leads.map((lead: LeadProps) => (
        <div
          key={`${lead.suit}${lead.number}`}
          style={{ color: '#FFF' }}
        >{`${lead.suit}${lead.number}`}</div>
      ))}
    </>
  )
}

Leadbar.displayName = 'Leadbar'
