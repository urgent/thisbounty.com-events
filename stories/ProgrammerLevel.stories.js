import React from 'react'
import { ProgrammerLevel } from '../src/components/ProgrammerLevel'

export default {
  title: 'Programmer Level',
  component: ProgrammerLevel
}

export const full = () => <ProgrammerLevel percent={100} />

export const half = () => <ProgrammerLevel percent={50} />

export const primary = () => (
  <ProgrammerLevel
    percent={100}
    color='#343A40'
    shadow='7px 7px 7px rgba(0, 0, 0, 0.5)'
  />
)

primary.story = {
  name: 'with border color and render effect'
}
