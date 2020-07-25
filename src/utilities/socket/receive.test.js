import { make, action, receive } from './receive';
import * as t from 'io-ts'

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

export const Lead = t.type({
    suit: t.keyof({ C: null, D: null, H: null, S: null, X: null }),
    number: t.union([t.keyof({ A: null, K: null, Q: null, J: null }), t.Int])
})

export const eqLead = {
    equals: (x, y) =>
        x.suit === y.suit && x.number === y.number
}

const deps = {
    bounty: "1",
    state: valid,
    setState: () => { },
    codec: Lead,
    eq: eqLead,
    localForage: { setItem: () => { } }
}

const event = {
    data: {
        '1': [
            { suit: 'H', number: 8 },
            { suit: 'H', number: 9 },
            { suit: 'H', number: 10 },
            { suit: 'H', number: 'J' }
        ]
    }
}



test('action sets valid leads', async () => {
    deps.state = empty
    deps.setState = update => deps.state = update;
    await action(valid)(deps)
    expect(deps.state).toEqual(valid)
})

test('action does not delete valid leads', async () => {
    deps.state = valid
    deps.setState = update => deps.state = update;
    await action(few)(deps)
    expect(deps.state).toEqual({ '1': [...valid['1'], ...few['1']] })
})

test('make returns a function with valid input', () => {
    expect(make(deps)(event)).toEqual(expect.any(Function))
})

test('make returns an error with invalid input', () => {
    expect(make(deps)(invalid)).toEqual(expect.any(Error))
    expect(make(deps)(empty)).toEqual(expect.any(Error))
})

test('receive returns a function with valid parameters', () => {
    expect(receive(deps)(event)).toEqual(expect.any(Function))
});

test('receive sets leads', async () => {
    deps.state = valid
    deps.setState = (update) => { deps.state = update }
    await receive(deps)(event)
    expect(deps.state).toEqual({ "1": [...valid["1"], ...event.data["1"]], })
});