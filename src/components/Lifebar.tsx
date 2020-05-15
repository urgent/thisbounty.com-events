import * as React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faEmptyHeart } from '@fortawesome/free-regular-svg-icons'

export interface LifebarProps { max: number; life: number; }

export const Lifebar = (props: LifebarProps): React.ReactElement => <>{Array(props.life).fill(<FontAwesomeIcon icon={faHeart} />).concat(
    Array(props.max - props.life).fill(<FontAwesomeIcon icon={faEmptyHeart} />)
)}</>
