import eventEmitter from '../utilities/eventEmitter'
import WebSocket from 'isomorphic-ws'

const socket = new WebSocket(
  'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

let queue: Array<string> = []

export const action: Record<string, string> = {
  REQUEST_LEADS: 'RESPOND_LEADS',
  RESPOND_LEADS: 'RECEIVE_LEADS'
}

socket.onopen = function (evt: MessageEvent) {
  onOpen(evt)
}
socket.onclose = function (evt: CloseEvent) {
  onClose(evt)
}
socket.onmessage = function (evt: MessageEvent) {
  onMessage(evt)
}
socket.onerror = function (evt: MessageEvent) {
  onError(evt)
}

function onOpen (evt: MessageEvent) {
  writeToScreen('CONNECTED')
  while (queue.length > 0) {
    socket.send(queue.pop())
  }
}

function onClose (evt: CloseEvent) {
  writeToScreen('DISCONNECTED')
}

function onMessage (evt: MessageEvent) {
  const message = JSON.parse(evt.data)
  if (Object.keys(action).includes(message.event)) {
    eventEmitter.emit(action[message.event], [...message.data])
  }
}

function onError (evt: MessageEvent) {
  writeToScreen(evt.data)
}

export function doSend (message: string) {
  if (socket.readyState !== 1) {
    queue = [message, ...queue]
  } else {
    writeToScreen('SENT: ' + message)
    socket.send(message)
  }
}

function writeToScreen (message: string) {
  console.log(message)
}

export default socket
