import * as React from "react";
import * as animation from './animation.gif'

export interface ViewProps { width: number, color: string }

export const View = (props: ViewProps): React.ReactElement => <div style={{
    backgroundImage: `url(${animation})`, width: `${props.width}px`, height: `24px`, border: `2px solid ${props.color}`,
}} />;