import * as React from 'react'
import styles from './styles.module.scss'

export interface ViewProps {
  image: React.ReactElement
  title: string
  id: string
  life: React.ReactElement
  money: React.ReactElement
  programmer: React.ReactElement
  user: React.ReactElement
  icon?: React.ReactElement
  center?: boolean
  click?: () => void
}

function style (props: ViewProps) {
  return (id: string) => {
    if (props.center && id === 'image') {
      return `${styles.image} ${styles.center}`
    }
    return styles.image
  }
}

export function View (props: ViewProps): React.ReactElement {
  const _style = style(props)

  return (
    <div className={styles.bounty} onClick={props.click}>
      <div className={_style('image')}>{props.image}</div>
      <div className={styles.stats}>
        <div className={`${styles.title} ${styles.bar}`}>
          <h2>{props.title}</h2> <h3>#{props.id}</h3>
        </div>
        <div className={`${styles.life} ${styles.bar}`}>{props.life}</div>
        <div className={`${styles.money} ${styles.bar}`}>{props.money}</div>
        <div className={`${styles.programmer} ${styles.bar}`}>
          {props.programmer}
        </div>
        <div className={`${styles.user} ${styles.bar}`}>{props.user}</div>
        <div className={styles.icon}>{props.icon}</div>
      </div>
    </div>
  )
}
