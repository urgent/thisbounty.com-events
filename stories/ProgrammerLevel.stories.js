import React from 'react'
import { ProgrammerLevel } from '../src/components/ProgrammerLevel'

export default {
  title: 'Programmer Level',
  component: ProgrammerLevel
}

export const full = () => <ProgrammerLevel percent={100} />

export const half = () => <ProgrammerLevel percent={50} />

export const primary = () => <ProgrammerLevel percent={100} color='#343A40' />

primary.story = {
  name: 'with Primary color'
}
