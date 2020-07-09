import eventEmitter from '../utilities/eventEmitter'

const socket = new WebSocket(
  'wss://connect.websocket.in/v3/1?apiKey=66FzbgigXbiN77D7eYNEQBJ0F0SGGXfhGonNoNYz7IejUldW82tOUn7kT5gO'
)

export const authorize = ['NEED_LEADS', 'READ_LEADS']

function testWebSocket () {
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
}

function onOpen (evt: MessageEvent) {
  writeToScreen('CONNECTED')
}

function onClose (evt: CloseEvent) {
  writeToScreen('DISCONNECTED')
}

function onMessage (evt: MessageEvent) {
  writeToScreen(evt.data)
  const message = JSON.parse(evt.data)
  if (authorize.includes(message.event)) {
    eventEmitter.emit(message.event, message.data)
  }
}

function onError (evt: MessageEvent) {
  writeToScreen(evt.data)
}

function doSend (message: string) {
  writeToScreen('SENT: ' + message)
  socket.send(message)
}

function writeToScreen (message: string) {
  console.log(message)
}
testWebSocket()

export default socket
