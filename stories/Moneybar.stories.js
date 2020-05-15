import React from 'react'

import { Moneybar } from '../src/components/Moneybar.tsx'

export default {
  title: 'Moneybar',
  component: Moneybar
}

export const Full = () => <Moneybar money={3} max={3} />

export const Hurt = () => <Moneybar money={2} max={3} />

Hurt.story = {
  name: 'with hurt'
}
