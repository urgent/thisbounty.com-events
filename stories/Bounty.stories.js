import React from 'react'
import { Bounty } from '../src/components/Bounty'

export default {
  title: 'Bounty',
  component: Bounty
}

export const bounty = () => (
  <Bounty
    id='1'
    image='/King of Hearts.svg'
    title='test'
    life={2}
    maxlife={3}
    money={2}
    maxmoney={3}
    user={1}
    programmer={50}
  />
)

bounty.story = {
  name: 'with default'
}
