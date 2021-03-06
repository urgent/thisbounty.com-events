import * as React from 'react'
import { View } from './ProgrammerLevel/View'

export interface ProgrammerLevelProps {
  percent: number
  color?: string
  shadow?: string
}

const scale = (width: number): number => (width / 100) * 184

export const ProgrammerLevel = (
  props: ProgrammerLevelProps
): React.ReactElement => (
  <View width={scale(props.percent)} color={props.color} />
)

ProgrammerLevel.displayName = 'ProgrammerLevel'
