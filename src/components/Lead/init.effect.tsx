import { Dependencies } from './effect'
import eventEmitter from '../../utilities/eventEmitter'
import { task } from 'fp-ts/lib/Task'

function delay (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const action = async (deps: Dependencies) => {
  const storage = await deps.localForage.getItem(`leads`)
  // get from local storage
  const leads = Object.assign({ '1': [], '2': [], '3': [], '4': [] }, storage)
  // set leads from local storage
  deps.setLeads(leads)
  await delay(1000)
  // effect does not run if leads above threshold
  eventEmitter.emit('REQUEST_LEADS', leads)
}

export const init = (deps: Dependencies) => task.of(action(deps))
