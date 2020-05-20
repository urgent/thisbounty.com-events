import * as React from "react";
import * as animation from './UserLevel/animation.gif'

export interface UserLevelProps { degree: number }

export const UserLevel = (props: UserLevelProps): React.ReactElement => <>{Array(props.degree).fill(<img src={animation.default} />)}</>;
