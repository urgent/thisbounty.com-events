import * as React from "react";
import * as user from './ProgrammerLevel/animation.gif'

export interface ProgrammerLevelProps { percent: number }

export const ProgrammerLevel = (props: ProgrammerLevelProps): React.ReactElement => <div style={{ backgroundImage: `url(${user})`, width: props.percent / 100 * 245, height: `24px` }} />


