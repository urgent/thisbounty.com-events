import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faEmptyHeart } from '@fortawesome/free-regular-svg-icons'

export interface LifebarProps { max: number; life: number; }

export const Lifebar = (props: LifebarProps): React.ReactElement => {
    const [life, setLife] = useState(props.life);
    const [max, setMax] = useState(props.max);

    return <>
        <button onClick={() => setLife(3)} >Set Life</button>
        {Array(life).fill(<FontAwesomeIcon icon={faHeart} />).concat(
            Array(max - life).fill(<FontAwesomeIcon icon={faEmptyHeart} />)
        )}
    </>
}
