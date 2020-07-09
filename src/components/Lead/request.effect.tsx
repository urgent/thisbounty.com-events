import { Dependencies, Effect, contraError, exec } from './effect'
import { LeadProps } from '../Lead'
import { task } from 'fp-ts/lib/Task'
import { pipe } from 'fp-ts/lib/function'
import { filter, size } from 'fp-ts/lib/Record'
import socket from '../../utilities/socket'

export const action = (state: Record<string, LeadProps[]>) => {
  socket.send(JSON.stringify({ event: 'REQUEST_LEADS', data: state }))
}

const valid = state => {
  const empty = pipe(
    leads,
    filter((leads: LeadProps[]) => leads.length < 5)
  )
  if (size(empty) !== 0) {
    socket.onopen = () =>
      socket.send(JSON.stringify({ event: 'REQUEST_LEADS', data: empty }))
  }
}

export const request = (state: Record<string, LeadProps[]>) => (
  event: MessageEvent
) => {}
