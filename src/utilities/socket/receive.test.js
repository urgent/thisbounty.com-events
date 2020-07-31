import { decodeWith, unique, receive } from './receive';
import * as t from 'io-ts'
import { sequenceT } from 'fp-ts/lib/Apply'
import { Either, right, left, fold } from 'fp-ts/lib/Either'
import { sequence } from 'fp-ts/lib/Record'
import { pipe, identity } from 'fp-ts/lib/function'

const valid = [
    { suit: 'H', number: 4 },
    { suit: 'H', number: 5 },
    { suit: 'H', number: 6 },
    { suit: 'H', number: 7 }
]
const invalid =
    [
        { suit: 'ZZ', number: 1, bounty: '1' },
        { suit: 'Y', number: 99, bounty: '1' },
        { suit: 'Zb', number: 2, bounty: '1' },
        { suit: 'Za', number: 3, bounty: '1' },
    ]

const empty = []

const few = [{ suit: 'H', number: 2 }]

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
    data: [
        { suit: 'H', number: 8, bounty: '1' },
        { suit: 'H', number: 9, bounty: '1' },
        { suit: 'H', number: 10, bounty: '1' },
        { suit: 'H', number: 'J', bounty: '1' }
    ]
}

test('decodeWith decodes Lead', async () => {
    expect(await decodeWith(deps.codec)(valid[0])).toEqual(right(valid[0]))
})

test('decodeWith returns error on invalid', async () => {
    expect(await decodeWith(deps.codec)(invalid[0])).toEqual(left(new Error('Invalid value "ZZ" supplied to : { suit: "C" | "D" | "H" | "S" | "X", number: ("A" | "K" | "Q" | "J" | Int) }/suit: "C" | "D" | "H" | "S" | "X"')))
})

test('unique finds unique leads', async () => {
    expect(await unique(deps.eq)(valid)(event.data[0])).toEqual(right(event.data[0]))
})

test('unique returns error on duplicate lead', async () => {
    expect(await unique(deps.eq)(valid)(valid[0])).toEqual(left(new Error(`Event ${JSON.stringify(valid[0])} already exists in state`)))
})

test('receive catches errors', async () => {
    const unit = pipe(
        await receive(valid)(invalid)(),
        fold(identity, identity)
    )
    expect(unit.errors.length).toEqual(4)
})

test('receive works', async () => {
    const unit = pipe(
        await receive(valid)(event.data)(),
        fold(identity, identity)
    )
    expect(unit.leads).toEqual(event.data)
})