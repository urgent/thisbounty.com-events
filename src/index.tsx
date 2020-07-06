import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { DesignLanguage, Diez } from 'diez-thisbounty-styles'
import { Titlebar } from './components/Titlebar'
import { Bounty } from './components/Bounty'
import { Leadbar } from './components/Lead'
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
        <div id={styles.content}>
          <div id={styles.navbar}>
            <button
              onClick={() =>
                eventEmitter.emit('NEW_LEAD', {
                  data: JSON.stringify({
                    suit: 'H',
                    number: Math.floor(Math.random() * 10) + 1,
                    bounty: '1'
                  })
                })
              }
            >
              Click
            </button>
          </div>
          <div id={styles.bounties}>
            <Bounty
              id='1'
              title='Diez'
              image='/static/King of Hearts.svg'
              life={2}
              maxlife={3}
              money={1}
              maxmoney={4}
              programmer={25}
              user={1}
              click={() =>
                eventEmitter.emit('CLICK_BOUNTY', {
                  data: JSON.stringify({ id: '1' })
                })
              }
            />
            <Bounty
              id='2'
              title='Storybook'
              image='/static/safe camp.jpg'
              life={2}
              maxlife={3}
              money={1}
              maxmoney={4}
              programmer={25}
              user={1}
              click={() =>
                eventEmitter.emit('CLICK_BOUNTY', {
                  data: JSON.stringify({ id: '2' })
                })
              }
            />
            <Bounty
              id='3'
              title='React'
              image='/static/Pirate_Flag_of_Blackbeard_(Edward_Teach).svg'
              center={true}
              life={3}
              maxlife={3}
              money={2}
              maxmoney={4}
              programmer={50}
              user={1}
              click={() =>
                eventEmitter.emit('CLICK_BOUNTY', {
                  data: JSON.stringify({ id: '3' })
                })
              }
            />
            <Bounty
              id='4'
              title='Websocket'
              image='/static/nc wyeth treasure island.jpeg'
              life={1}
              maxlife={3}
              money={3}
              maxmoney={4}
              programmer={25}
              user={1}
              click={() =>
                eventEmitter.emit('CLICK_BOUNTY', {
                  data: JSON.stringify({ id: '4' })
                })
              }
            />
          </div>
        </div>
      </div>
      <Leadbar
        bounty={'1'}
        leads={{
          '1': [{ suit: 'H', number: 'K' }],
          '2': [{ suit: 'D', number: 9 }]
        }}
      />
    </DSContext.Provider>,
    document.getElementById('root')
  )
})
