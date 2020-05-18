import React from 'react'
import { UserLevel } from '../src/components/UserLevel'

export default {
  title: 'User Level',
  component: UserLevel
}

export const firstDegree = () => <UserLevel degree={1} />

export const fourthDegree = () => <UserLevel degree={4} />

fourthDegree.story = {
  name: 'with fourth degree'
}
