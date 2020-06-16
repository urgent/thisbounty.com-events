const socket = new WebSocket('ws://echo.websocket.org')

socket.onopen = function () {
  //socket.send(JSON.stringify({ CREATE_LEAD: 'echo.websocket.org connected' }))
}

socket.onmessage = function (event: MessageEvent) {
  console.log(`Received ${event.data}`)
}

export default socket
