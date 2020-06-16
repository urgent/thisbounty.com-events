import React, { useState, useEffect } from 'react'
import eventEmitter from '../utilities/eventEmitter'
import socket from '../utilities/socket'
import localForage from 'localforage'
import { Mutate, Effect, leadCreate } from './Lead/effect'

export interface LeadbarProps {
  leads: LeadProps[]
  bounty: string
  visible: boolean
}

interface LeadbarEffect {
  leads: LeadProps[]
  setLeads: React.Dispatch<React.SetStateAction<LeadProps[]>>
  bounty: string
  handle: (
    mutate: Mutate
  ) => (
    effect: Effect
  ) => (state: LeadProps[]) => (response: MessageEvent) => void
}
export interface LeadProps {
  suit: 'C' | 'D' | 'H' | 'S' | 'X'
  number: number | 'A' | 'K' | 'Q' | 'J'
}

let handle: (response: MessageEvent) => void

export function Leadbar (props: LeadbarProps): React.ReactElement {
  const [leads, setLeads] = useState(props.leads)

  const store: Effect = async function (update: LeadProps[]) {
    await localForage.setItem(`bounty(${props.bounty}).leads`, update)
  }

  handle = event => {
    setLeads(prevLeads => {
      const state = [...prevLeads, JSON.parse(event.data)]
      store(state)
      return state
    })
  }

  useEffect(() => {
    socket.onmessage = handle
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
