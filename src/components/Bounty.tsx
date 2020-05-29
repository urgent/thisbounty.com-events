import React from 'react'
import { Lifebar } from './Lifebar'
import { Moneybar } from './Moneybar'
import { ProgrammerLevel } from './ProgrammerLevel'
import { UserLevel } from './UserLevel'
import { View } from './Bounty/View'
import eventEmitter from '../eventEmitter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import faGithub from '@fortawesome/free-brands-svg-icons/faGithub'

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
}

export const Bounty = (props: BountyProps): React.ReactElement => (
  <View
    image={<img src={props.image} />}
    title={props.title}
    id={props.id}
    life={<Lifebar life={props.life} max={props.maxlife} />}
    money={<Moneybar money={props.money} max={props.maxmoney} />}
    programmer={
      <ProgrammerLevel
        percent={props.programmer}
        color='#000000'
        shadow='box-shadow: 8px 8px 8px black;'
      />
    }
    user={<UserLevel degree={props.user} />}
    icon={
      <>
        {' '}
        <FontAwesomeIcon icon={faGithub} />
      </>
    }
  />
)
