import { make, action, receive } from './receive.effect';

const valid = {
    '1': [
        { suit: 'H', number: 4 },
        { suit: 'H', number: 5 },
        { suit: 'H', number: 6 },
        { suit: 'H', number: 7 }
    ]
};
const invalid = {
    '1': [
        { suit: 'Z', number: 0 },
        { suit: 'X', number: 99 },
        { suit: 'Z', number: 2 },
        { suit: 'Z', number: 3 },
    ]
};
const empty = { '1': [] }

const few = { "1": [{ suit: 'H', number: 8 }] }

const deps = { setLeads: () => { }, bounty: "1" }

test('action sets valid leads', () => {
    let state = empty
    const setLeads = update => state = update;
    action(valid)({ leads: valid, setLeads })
    expect(state).toEqual(valid)
})

test('action does not delete valid leads', () => {
    let state = valid
    const setLeads = update => state = update;
    action(few)({ leads: valid, setLeads })
    expect(state).toEqual({ '1': [...valid['1'], ...few['1']] })
})

test('make returns a function with valid input', () => {
    expect(make(valid)).toEqual(expect.any(Function))
})

test('make returns an error with invalid input', () => {
    expect(make(invalid)).toEqual(expect.any(Error))
    expect(make(empty)).toEqual(expect.any(Error))
})

test('receive returns a function with valid parameters', () => {
    expect(receive(valid)(deps)).toEqual(expect.any(Function))
});

test('receive sets leads', () => {
    const deps = { leads: few, setLeads: (update) => { throw (JSON.stringify(update)) } };
    const event = { event: 'RECEIVE_LEADS', data: valid }
    expect(() => receive(valid)(deps)(event)).toThrowError(JSON.stringify(({ "1": [...few["1"], ...valid["1"]] })))
});