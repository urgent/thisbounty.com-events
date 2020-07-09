import { Dependencies, Effect, contraError, exec } from './effect'
import { LeadProps } from '../Lead'
import { task } from 'fp-ts/lib/Task'

export const action = (event: Record<string, LeadProps[]>) => (
  deps: Dependencies
) => {
  deps.setLeads(Object.assign({}, deps.leads, event))
}

/**
 * Make an effectual function from a runtime message
 */
type Make = (leads: Record<string, LeadProps[]>) => Effect

export const make: Make = leads => {
  return (deps: Dependencies) => task.of(action(leads)(deps))
}

export const response = (state: Record<string, LeadProps[]>) => (
  event: MessageEvent
) => {
  // setLeads(Object.assign({}, leads, event))
}
