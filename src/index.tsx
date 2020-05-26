import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { UserLevel } from './components/UserLevel'

ReactDOM.render(
  <UserLevel degree={4} />,

  document.getElementById('example')
)
