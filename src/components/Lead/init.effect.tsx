import { Dependencies } from './effect'
import localForage from 'localforage'
import eventEmitter from '../../utilities/eventEmitter'
import { task } from 'fp-ts/lib/Task'

export const action = async (deps: Dependencies) => {
  const storage = await localForage.getItem(`leads`)
  // get from local storage
  const leads = Object.assign({ '1': [], '2': [], '3': [], '4': [] }, storage)

  // set leads from local storage
  deps.setLeads(leads)

  // send to channel if need leads
  eventEmitter.emit(JSON.stringify({ event: 'REQUEST_LEADS', data: leads }))
}

export const init = (deps: Dependencies) => task.of(action(deps))
