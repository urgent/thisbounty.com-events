import React from 'react'

import { Lifebar } from '../src/components/Lifebar.tsx'

export default {
  title: 'Lifebar',
  component: Lifebar
}

export const Full = () => <Lifebar life={3} max={3} />

export const Hurt = () => <Lifebar life={2} max={3} />

Hurt.story = {
  name: 'with hurt'
}
