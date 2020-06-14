import React, { useState } from 'react'
import styles from './Lifebar/styles.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart'
import { faHeart as faEmptyHeart } from '@fortawesome/free-regular-svg-icons/faHeart'

export interface LifebarProps {
  max: number
  life: number
}

export function Lifebar (props: LifebarProps): React.ReactElement {
  const [life, setLife] = useState(props.life)
  const [max, setMax] = useState(props.max)

  return (
    <div className={styles.lifebar}>
      {
        <>
          <Heart count={life} icon={faHeart} style={styles.full} />
          <Heart count={max - life} icon={faEmptyHeart} style={styles.empty} />
        </>
      }
    </div>
  )
}

interface LifeProps {
  count: number
  icon: typeof faHeart
  style: string
}

function Heart (props: LifeProps): React.ReactElement {
  return (
    <>
      {Array.from(Array(props.count), (_, i) => (
        <FontAwesomeIcon key={i} icon={props.icon} className={props.style} />
      ))}
    </>
  )
}

Lifebar.displayName = 'Lifebar'
Heart.displayName = 'Heart'
