import { action, make, request } from './request.effect'


const full = [{ suit: 'H', number: 2 }, { suit: 'H', number: 3 }, { suit: 'H', number: 4 }, { suit: 'H', number: 5 }]
const valid = { "1": [{ suit: 'H', number: 2 }], "2": [{ suit: 'H', number: 2 }], "3": [], "4": [] };
const invalid = { "1": full, "2": full, "3": full, "4": full };
const deps = {
    socket: {
        send: (message) => {
            throw (message);
        }
    }
}

test('action sends to websocket', () => {
    expect(() => action(deps)(valid)).toThrowError(JSON.stringify({ event: 'REQUEST_LEADS', data: valid }))
})

test('make returns function with valid input', () => {
    expect(make(valid)).toEqual(expect.any(Function))
})

test('make returns error with invalid input', () => {
    expect(make(invalid)).toEqual(expect.any(Error))
});

test('request sends to websocket', () => {
    expect(() => request(valid)(deps)({ event: 'REQUEST_LEADS', data: {} })).toThrowError(JSON.stringify({ event: 'REQUEST_LEADS', data: valid }))
});