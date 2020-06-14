import * as React from 'react'
import * as animation from './UserLevel/animation.gif'

export interface UserLevelProps {
  degree: number
}

export function UserLevel (props: UserLevelProps): React.ReactElement {
  return (
    <>
      {Array.from(Array(props.degree), (_, i) => (
        <img key={i} src={animation.default} />
      ))}
    </>
  )
}

UserLevel.displayName = 'UserLevel'
