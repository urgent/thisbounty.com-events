import React, { useState, useEffect } from 'react'
import { Lifebar } from './Lifebar'
import { Moneybar } from './Moneybar'
import { ProgrammerLevel } from './ProgrammerLevel'
import { UserLevel } from './UserLevel'
import { View } from './Bounty/View'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub'
import { LeadProps } from 'components/Lead'
import socket from '../utilities/socket'
import eventEmitter from '../utilities/eventEmitter'
import localForage from 'localforage'

export interface BountyProps {
  id: string
  title: string
  image: string
  life: number
  maxlife: number
  money: number
  maxmoney: number
  programmer?: number
  user?: number
  leads: LeadProps[]
}

type Validate = (leads: LeadProps[], created: LeadProps) => void
type Parse = (json: string) => LeadProps
type Mutate = (value: React.SetStateAction<LeadProps[]>) => void
type Effect = (created: LeadProps[]) => void

// create :: validate -> parse -> mutate -> effect -> state -> response -> void
function create (
  validate: Validate
): (
  parse: Parse
) => (
  mutate: Mutate
) => (
  effect: Effect
) => (state: LeadProps[]) => (response: MessageEvent) => void {
  return parse => mutate => effect => state => response => {
    console.log(response)
    const created = parse(response.data)
    validate(state, created)
    const update = [...state, created]
    mutate(update)
    effect(update)
  }
}
const validate: Validate = function (leads, created) {
  if (leads.indexOf(created) !== -1) {
    throw RangeError(`${created} already exists in state`)
  }
}
// curried create outside of component state. Validate and parse parameters
const leadCreate = create(validate)(JSON.parse)
let handler: (response: MessageEvent) => void

export function Bounty (props: BountyProps): React.ReactElement {
  // component state
  const [leads, setLeads] = useState(props.leads)
  // Effect for saving to local storage. Needs component props
  const store: Effect = async function (update: LeadProps[]) {
    await localForage.setItem(`bounty(${props.id}).leads`, update)
  }
  // curried leadCreate inside component state. Mutate and Effect parameters. Needs component state
  const leadStore = leadCreate(setLeads)(store)
  // component effect, runs after each render.
  function leadEffect (): () => void {
    handler = leadStore(leads)
    // Add leads per websocket
    socket.onmessage = handler
    // Add leads per local event emitter
    eventEmitter.on(`bounty(${props.id}).lead.new()`, handler)
    //  Return a function for cleanup, remove listeners.
    return () => {
      socket.removeEventListener('message', handler)
      eventEmitter.off(`bounty(${props.id}).lead.new()`, handler)
    }
  }
  useEffect(leadEffect, [])

  return (
    <View
      image={<img src={props.image} />}
      title={props.title}
      id={props.id}
      life={<Lifebar life={props.life} max={props.maxlife} />}
      money={<Moneybar money={props.money} max={props.maxmoney} />}
      programmer={
        <ProgrammerLevel percent={props.programmer} color='#000000' />
      }
      user={<UserLevel degree={props.user} />}
      icon={<FontAwesomeIcon icon={faGithub} />}
    />
  )
}

Bounty.displayName = 'Bounty'
