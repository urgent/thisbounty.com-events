import React, { useState, useEffect } from 'react'
import { Lifebar } from './Lifebar'
import { Moneybar } from './Moneybar'
import { ProgrammerLevel } from './ProgrammerLevel'
import { UserLevel } from './UserLevel'
import { View } from './Bounty/View'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub'

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
  center?: boolean
  click?: () => void
}

export function Bounty (props: BountyProps): React.ReactElement {
  return (
    <View
      image={<img src={props.image} />}
      title={props.title}
      id={props.id}
      life={<Lifebar life={props.life} max={props.maxlife} bounty={props.id} />}
      money={
        <Moneybar money={props.money} max={props.maxmoney} bounty={props.id} />
      }
      programmer={
        <ProgrammerLevel percent={props.programmer} color='#000000' />
      }
      user={<UserLevel degree={props.user} />}
      icon={<FontAwesomeIcon icon={faGithub} />}
      click={props.click}
      center={props.center}
    />
  )
}

Bounty.displayName = 'Bounty'
