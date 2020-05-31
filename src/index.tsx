import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { DesignLanguage, Diez } from 'diez-thisbounty-styles'
import styles from './index.scss'

import { Bounty } from './components/Bounty'

const diezDs = new Diez(DesignLanguage)

diezDs.attach(ds => {
  const DSContext = React.createContext(ds)

  ReactDOM.render(
    <DSContext.Provider value={ds}>
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
    </DSContext.Provider>,
    document.getElementById('root')
  )
})
