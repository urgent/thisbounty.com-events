import * as React from "react";
import * as user from './UserLevel/animation.gif'

export interface UserLevelProps { degree: number, ds: any }

export const UserLevel = (props: UserLevelProps): React.ReactElement => <>{Array(props.degree).fill(<img src={user} />)}</>


