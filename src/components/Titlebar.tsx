import React from 'react'
import styles from './Titlebar/styles.module.scss'

export interface TitlebarProps {
  title: string
}

export function Titlebar (props: TitlebarProps): React.ReactElement {
  return (
    <h1 className={styles.titlebar}>
      <a href='/'>{props.title}</a>
    </h1>
  )
}
