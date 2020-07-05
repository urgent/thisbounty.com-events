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
              title='Test'
              image='/static/King of Hearts.svg'
              life={2}
              maxlife={3}
              money={2}
              maxmoney={3}
              programmer={50}
              user={1}
              click={() =>
                eventEmitter.emit('CLICK_BOUNTY', {
                  data: JSON.stringify({ id: '1' })
                })
              }
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
              click={() =>
                eventEmitter.emit('CLICK_BOUNTY', {
                  data: JSON.stringify({ id: '2' })
                })
              }
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
              click={() =>
                eventEmitter.emit('CLICK_BOUNTY', {
                  data: JSON.stringify({ id: '3' })
                })
              }
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
            />
          </div>
        </div>
      </div>
      <Leadbar
        bounty={'1'}
        leads={{
          1: [
            { suit: 'H', number: 'A' },
            { suit: 'S', number: 'K' },
            { suit: 'C', number: 'Q' },
            { suit: 'D', number: 'J' },
            { suit: 'H', number: 2 },
            { suit: 'S', number: 2 },
            { suit: 'C', number: 2 },
            { suit: 'D', number: 2 },
            { suit: 'H', number: 3 },
            { suit: 'S', number: 3 },
            { suit: 'C', number: 3 },
            { suit: 'D', number: 3 },
            { suit: 'H', number: 4 },
            { suit: 'S', number: 4 },
            { suit: 'C', number: 4 },
            { suit: 'D', number: 4 },
            { suit: 'H', number: 5 },
            { suit: 'S', number: 5 },
            { suit: 'C', number: 5 },
            { suit: 'D', number: 5 },
            { suit: 'H', number: 6 },
            { suit: 'S', number: 6 },
            { suit: 'C', number: 6 },
            { suit: 'D', number: 6 },
            { suit: 'H', number: 7 },
            { suit: 'S', number: 7 },
            { suit: 'C', number: 7 },
            { suit: 'D', number: 7 },
            { suit: 'H', number: 8 },
            { suit: 'S', number: 8 },
            { suit: 'C', number: 8 },
            { suit: 'D', number: 8 },
            { suit: 'H', number: 9 },
            { suit: 'S', number: 9 },
            { suit: 'C', number: 9 },
            { suit: 'D', number: 9 }
          ],
          '2': [{ suit: 'D', number: 9 }]
        }}
      />
    </DSContext.Provider>,
    document.getElementById('root')
  )
})
