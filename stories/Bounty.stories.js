import React from 'react'
import { Bounty } from '../src/components/Bounty'

export default {
  title: 'Bounty',
  component: Bounty
}

export const bounty = () => (
  <>
    <Bounty
      id='1'
      image='/King of Hearts.svg'
      title='test'
      life={10}
      maxlife={10}
      money={3}
      maxmoney={3}
      user={4}
      programmer={100}
    />
    <Bounty
      id='1'
      image='/King of Hearts.svg'
      title='test'
      life={2}
      maxlife={3}
      money={0}
      maxmoney={3}
      user={4}
      programmer={100}
    />
    <Bounty
      id='1'
      image='/King of Hearts.svg'
      title='test'
      life={2}
      maxlife={3}
      money={0}
      maxmoney={3}
      user={4}
      programmer={100}
    />
  </>
)

bounty.story = {
  name: 'with default'
}
