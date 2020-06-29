import React from 'react'
import { Leadbar } from '../src/components/Lead'

export default {
  title: 'Leadbar',
  component: Leadbar
}

export const leadbar = () => <Leadbar leads={[
  { suit: 'H', number: 'A' },
  { suit: 'S', number: 'K' },
  { suit: 'C', number: 'Q' },
  { suit: 'D', number: 'J' }
]}
  bounty={'1'}
  visible={true} />
