import * as React from "react";
import * as animation from './animation.gif'

export interface ViewProps { width: number, color: string, shadow: string }

export const View = (props: ViewProps): React.ReactElement => <div className="wrapper" style={{ border: `2px solid ${props.color}`, borderLeft: "none", borderRight: "none", boxShadow: props.shadow }}>
    <div style={{
        backgroundImage: `url(${animation.default})`, width: `${props.width}px`, height: `24px`, boxShadow: "7px 0px 0px black"
    }} />
</div>;
