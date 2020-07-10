import eventEmitter from '../../utilities/eventEmitter'
import socket from '../../utilities/socket'
import { make, action } from './response.effect';

const validLeads = {
    '1': [
        { suit: 'H', number: 4 },
        { suit: 'H', number: 5 }
    ]
};
const invalidLeads = {
    '1': [
        { suit: 'Z', number: 0 },
        { suit: 'X', number: 99 }
    ]
};
const emptyLeads = { '1': [] }
const extraLeads = {
    '2': [
        { suit: 'H', number: 4 },
        { suit: 'H', number: 5 }
    ]
}
const validRead = {
    event: 'RESPONSE_LEADS',
    data: validLeads
};
const deps = { setLeads: () => { }, bounty: "1" }

afterAll(() => {
    socket.close()
});

test('receives websocket message and emits event', (done) => {
    jest.setTimeout(5500);
    let spy = jest.fn();
    eventEmitter.on('RESPONSE_LEADS', spy);
    socket.onopen = (evt) => socket.send(JSON.stringify({ event: 'RESPONSE_LEADS', data: validRead }))
    setTimeout(() => {
        expect(spy).toHaveBeenCalled();
        done();
    }, 5000);
})

test('make returns a function', () => {
    expect(make(validLeads)(deps)).toEqual(expect.any(Function))
})

test('action sets valid leads', () => {
    let state = emptyLeads
    const setLeads = update => state = update;
    action(validLeads)({ setLeads })
    expect(state).toEqual(validLeads)
})

test('action does not delete valid leads', () => {
    let state = validLeads
    const setLeads = update => state = update;
    action(emptyLeads)({ setLeads })
    expect(state).toEqual(validLeads)
})

test('buffer waits before changing state', (done) => {
    let state = emptyLeads
    const setLeads = update => state = update;
    action(validLeads)({ setLeads })
    expect(state).toEqual(emptyLeads)
})

test('buffer captures consecutive state', (done) => {
    let state = emptyLeads
    const setLeads = update => state = update;
    action(validLeads)({ setLeads })
    expect(state).toEqual(emptyLeads)
    setTimeout(() => {
        action(extraLeads)({ setLeads })
        expect(state).toEqual(Object.assign({}, validLeads, extraLeads))
        done();
    }, 5000);
})

test('if no leads, do not respond', () => {

});