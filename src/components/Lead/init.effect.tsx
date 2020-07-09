import socket from '../../utilities/socket'
import { LeadProps } from '../Lead'
import { Dependencies, Effect, contraError, exec } from './effect'
import { filter, size } from 'fp-ts/lib/Record'
import { task } from 'fp-ts/lib/Task'
import { pipe } from 'fp-ts/lib/function'
import localForage from 'localforage'

export const action = async (deps: Dependencies) => {
  const storage = await localForage.getItem(`leads`)
  // get from local storage
  const leads = Object.assign({ '1': [], '2': [], '3': [], '4': [] }, storage)

  // set leads from local storage
  deps.setLeads(leads)

  // send to channel if need leads
  const empty = pipe(
    leads,
    filter((leads: LeadProps[]) => leads.length < 5)
  )
  if (size(empty) !== 0) {
    socket.onopen = () =>
      socket.send(JSON.stringify({ event: 'NEED_LEADS', data: empty }))
  }
}

export const init = (deps: Dependencies) => task.of(action(deps))
