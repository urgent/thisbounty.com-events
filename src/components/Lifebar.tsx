import React, { useState, useEffect } from 'react'
import styles from './Lifebar/styles.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart'
import { faHeart as faEmptyHeart } from '@fortawesome/free-regular-svg-icons/faHeart'
import eventEmitter from '../utilities/eventEmitter'

export interface LifebarProps {
  max: number
  life: number
  bounty: string
}

let _heal: (lead: MessageEvent) => void
let _hurt: (lead: MessageEvent) => void
export function Lifebar (props: LifebarProps): React.ReactElement {
  const [life, setLife] = useState(props.life)
  const [max, setMax] = useState(props.max)

  useEffect(() => {
    _heal = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      if (data.bounty == props.bounty) {
        setLife(Math.min(life + 1, max))
      }
    }

    _hurt = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      if (data.bounty == props.bounty) {
        setLife(Math.max(life - 1, 0))
      }
    }

    eventEmitter.on('HEAL', _heal)
    eventEmitter.on('HURT', _hurt)

    // remove listeners on each render
    return () => {
      eventEmitter.off(`HEAL`, _heal)
      eventEmitter.off(`HURT`, _hurt)
    }
  }, [life])

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
