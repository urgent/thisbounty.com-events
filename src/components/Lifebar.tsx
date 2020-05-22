import React, { useState } from "react";
import styles from "./Lifebar/styles.module.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faEmptyHeart } from '@fortawesome/free-regular-svg-icons'

export interface LifebarProps { max: number; life: number; }

export const Lifebar = (props: LifebarProps): React.ReactElement => {
    const [life, setLife] = useState(props.life);
    const [max, setMax] = useState(props.max);

    return <div className={styles.lifebar}>
        {Array(life).fill(<FontAwesomeIcon icon={faHeart} className={styles.full} />).concat(
            Array(max - life).fill(<FontAwesomeIcon icon={faEmptyHeart} className={styles.empty} />)
        )}
    </div>
}
