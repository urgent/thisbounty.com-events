import { action, make, response } from './response.effect';

const validLeads = [
    { suit: 'H', number: 4 },
    { suit: 'H', number: 5 },
    { suit: 'H', number: 6 },
    { suit: 'H', number: 7 }
]

const invalidLeads = [
    { suit: 'Z', number: 4 },
    { suit: 'Z', number: 5 },
    { suit: 'H', number: 11 },
    { suit: 'H', number: 12 }
]

const validLeadbar = {
    '1': validLeads,
    '2': validLeads,
    '3': validLeads,
    '4': validLeads
};
const invalidLeadbar = {
    '1': invalidLeads,
    '2': invalidLeads,
    '3': invalidLeads,
    '4': invalidLeads
};
const emptyLeadbar = {
    '1': [],
    '2': [],
    '3': [],
    '4': []
}
const fewLeadbar = {
    '1': [{ suit: 'H', number: 5 }, { suit: 'H', number: 4 }, { suit: 'H', number: 3 }],
    '2': [{ suit: 'H', number: 4 }, { suit: 'H', number: 3 }],
    '3': [{ suit: 'H', number: 4 }],
    '4': []
}

const deps = {
    socket: {
        send: (message) => {
            console.log(message)
            throw (message);
        }
    }
}

test('env working', () => {
    expect(process.env.REQUEST_LEADS_THRESHOLD).toBe("4")
})

test('action emits REQUEST_LEADS', () => {
    expect(() => action(deps)(validLeadbar)).toThrow(JSON.stringify({ event: 'RESPONSE_LEADS', data: validLeadbar }))
});

test('make with valid leads returns a function', () => {
    expect(make(validLeadbar)).toEqual(expect.any(Function))
})

test('response with valid leads runs socket.send from reader', () => {
    expect(response(validLeadbar)(deps)).toThrow(JSON.stringify({ event: 'RESPONSE_LEADS', data: validLeadbar }))
})

test('response with few leads returns an error', () => {
    expect(response(fewLeadbar)(deps)({ event: 'RESPONSE_LEADS', data: {} })).toEqual(expect.any(Error))
});

test('response with empty leads returns an error', () => {
    expect(response(emptyLeadbar)(deps)({ event: 'RESPONSE_LEADS', data: {} })).toEqual(expect.any(Error))
});