import React, { useState } from 'react';
import { Lifebar } from "./Lifebar"
import { Moneybar } from './Moneybar'
import { ProgrammerLevel } from './ProgrammerLevel'
import { UserLevel } from './UserLevel'
import { View } from './Bounty/View'
import eventEmitter from "../eventEmitter"

export interface BountyProps {
  id: string,
  title: string,
  image: string,
  life: number,
  maxlife: number,
  money: number,
  maxmoney: number,
  programmer?: number,
  user?: number
}

export const Bounty = (props: BountyProps): React.ReactElement => <><button onClick={() => eventEmitter.emit('your-event')} >Send Event</button>
  <View
    image={<img src={props.image} />}
    title={props.title}
    id={props.id}
    life={<Lifebar life={props.life} max={props.maxlife} />}
    money={<Moneybar money={props.money} max={props.maxmoney} />}
    programmer={<ProgrammerLevel percent={props.programmer} />}
    user={<UserLevel degree={props.user} />}
  /></>;