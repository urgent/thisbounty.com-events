import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { DesignLanguage, Diez } from 'diez-thisbounty-styles'
import { Titlebar } from './components/Titlebar'
import { Bounty } from './components/Bounty'
import styles from './index.module.scss'
import eventEmitter from './utilities/eventEmitter'

const diezDs = new Diez(DesignLanguage)

diezDs.attach((ds: DesignLanguage) => {
  const body = document.querySelector('body')
  body.style.backgroundColor =
    ds.thisbountyComStyleGuideTokens.colors.secondary.color
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
          leads={[{ suit: 'H', number: 'K' }]}
        />
        <Bounty
          id='2'
          title='Test2'
          image='/static/King of Hearts.svg'
          life={2}
          maxlife={3}
          money={2}
          maxmoney={3}
          programmer={50}
          user={1}
          leads={[{ suit: 'H', number: 'K' }]}
        />
        <Bounty
          id='3'
          title='Test3'
          image='/static/King of Hearts.svg'
          life={2}
          maxlife={3}
          money={2}
          maxmoney={3}
          programmer={50}
          user={1}
          leads={[{ suit: 'H', number: 'K' }]}
        />
        <Bounty
          id='4'
          title='Test4'
          image='/static/King of Hearts.svg'
          life={2}
          maxlife={3}
          money={2}
          maxmoney={3}
          programmer={50}
          user={1}
          leads={[{ suit: 'H', number: 'K' }]}
        />
        <button
          onClick={() =>
            eventEmitter.emit('bounty(1).lead.new()', {
              data: JSON.stringify({ suit: 'H', number: 'K' })
            })
          }
        >
          Click
        </button>
      </div>
    </DSContext.Provider>,
    document.getElementById('root')
  )
})
