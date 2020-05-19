import * as React from "react";

export interface ViewProps {
    image: React.ReactElement,
    title: string,
    id: string,
    life: React.ReactElement,
    money: React.ReactElement,
    programmer: React.ReactElement,
    user: React.ReactElement
}

export const View = (props: ViewProps): React.ReactElement => <>
    {props.image}
    <h2>{props.title}</h2> <h3>{props.id}</h3>
    {props.life}
    {props.money}
    {props.programmer}
    {props.user}
</>;