import eventEmitter from '../utilities/eventEmitter'
import WebSocket from 'ws'
import socket from '../utilities/socket'


const socket2 = new WebSocket(
    'wss://connect.websocket.in/v3/1?apiKey=4sC6D9hsMYg5zcl15Y94nXNz8KAxr8eezGglKE9FkhRLnHcokuKsgCCQKZcW'
)

afterAll(() => {
    socket2.close()
});

test('receives websocket message and emits event', (done) => {
    let spy = jest.fn();
    eventEmitter.on('RECEIVE_LEADS', () => {
        spy()
    });
    setTimeout(() => {
        socket2.send(JSON.stringify({ event: 'RESPOND_LEADS', data: [{}] }))
    }, 1000)

    setTimeout(() => {
        expect(spy).toHaveBeenCalled();
        done();
    }, 4000);
})