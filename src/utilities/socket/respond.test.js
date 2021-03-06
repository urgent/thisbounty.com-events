import { respond, action } from './respond';
import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'

const valid = [
    { suit: 'H', number: 4, bounty: 1 },
    { suit: 'H', number: 5, bounty: 1 },
    { suit: 'H', number: 6, bounty: 1 },
    { suit: 'H', number: 7, bounty: 1 }
]
const invalid =
    [
        { suit: 'ZZ', number: 1, bounty: 1 },
        { suit: 'Y', number: 99, bounty: 1 },
        { suit: 'Zb', number: 2, bounty: 1 },
        { suit: 'Za', number: 3, bounty: 1 },
    ]

const empty = []

const few = [{ suit: 'H', number: 2 }]

const Lead = t.type({
    suit: t.keyof({ C: null, D: null, H: null, S: null, X: null }),
    number: t.union([t.keyof({ A: null, K: null, Q: null, J: null }), t.Int])
})

const eqLead = {
    equals: (x, y) =>
        x.suit === y.suit && x.number === y.number
}

const deps = {
    bounty: "1",
    state: valid,
    setState: () => { },
    decoder: Lead,
    eq: eqLead,
    localForage: { setItem: () => { } },
    socket: { send: () => { } }
}

const event = {
    data: [
        { suit: 'H', number: 8 },
        { suit: 'H', number: 9 },
        { suit: 'H', number: 10 },
        { suit: 'H', number: 'J' }
    ]
}

test('env working', () => {
    expect(process.env.REQUEST_LEADS_THRESHOLD).toBe("4")
})

test('respond catches errors', async () => {
    // duplicate, deps.state = valid
    const unit = await respond(deps)(valid)()
    expect(E.isLeft(unit)).toBeTruthy()
})
test('respond works', async () => {
    const unit = await respond(deps)(event.data)
    expect(unit).toBeTruthy()
})
test('respond sends state', async () => {
    const unit = await respond(deps)(event.data)()
    expect(unit).toEqual(E.right({ left: [], right: valid }))
})