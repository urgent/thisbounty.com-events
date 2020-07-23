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
        { suit: 'Y', number: 99 },
        { suit: 'Z', number: 2 },
        { suit: 'Z', number: 3 },
    ]
};
const empty = { '1': [] }

const few = { "1": [{ suit: 'H', number: 2 }] }

const deps = { setLeads: () => { }, leads: valid, bounty: "1" }

const event = {
    '1': [
        { suit: 'H', number: 8 },
        { suit: 'H', number: 9 },
        { suit: 'H', number: 10 },
        { suit: 'H', number: 'J' }
    ]
}

test('action sets valid leads', async () => {
    let state = empty
    const setLeads = update => state = update;
    await action(valid)({ leads: valid, setLeads, localForage: { setItem: () => { } } })
    expect(state).toEqual(valid)
})

test('action does not delete valid leads', async () => {
    let state = valid
    const setLeads = update => state = update;
    await action(few)({ leads: valid, setLeads, localForage: { setItem: () => { } } })
    expect(state).toEqual({ '1': [...valid['1'], ...few['1']] })
})

test('make returns a function with valid input', () => {
    expect(make(valid)(event)).toEqual(expect.any(Function))
})

test('make returns an error with invalid input', () => {
    expect(make(valid)(invalid)).toEqual(expect.any(Error))
    expect(make(valid)(empty)).toEqual(expect.any(Error))
})

test('receive returns a function with valid parameters', () => {
    expect(receive(valid)(deps)(event)).toEqual(expect.any(Function))
});

test('receive sets leads', async () => {
    let leads = {}
    const deps = { leads: few, setLeads: (update) => { leads = update }, localForage: { setItem: () => { } } };
    await receive(valid)(deps)(event)
    expect(leads).toEqual({ "1": [...few["1"], ...event["1"]], })
});