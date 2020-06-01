import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { DesignLanguage, Diez } from 'diez-thisbounty-styles'
import { Titlebar } from './components/Titlebar'
import { Bounty } from './components/Bounty'
import styles from './index.module.scss'

const diezDs = new Diez(DesignLanguage)

diezDs.attach(ds => {
  const body = document.querySelector('body')
  body.style.backgroundColor = '#343a40'
  body.style.margin = '0'

  const DSContext = React.createContext(ds)
  ReactDOM.render(
    <DSContext.Provider value={ds}>
      <div className={styles.app}>
        <Titlebar title='thisbounty.com' />
        <Bounty
          id='1'
          title='Test'
          image='/static/King of Hearts.svg'
          life={2}
          maxlife={3}
          money={2}
          maxmoney={3}
          programmer={50}
          user={1}
        />
      </div>
    </DSContext.Provider>,
    document.getElementById('root')
  )
})
