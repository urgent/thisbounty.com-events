import { Runtime, isEffect, exec, contraError, need, under, decode, pick } from './effect'
import { task } from 'fp-ts/lib/Task'
import { pipe, identity } from 'fp-ts/lib/function'
import { fold, left, right } from 'fp-ts/lib/Either'

const deps = { setLeads: () => { }, bounty: "1" }

test('isEffect returns true with a function', () => {
    expect(isEffect((() => { }))).toEqual(true)
});

test('isEffect returns false with an Error', () => {
    expect(isEffect(new Error())).toEqual(false)
});

test('exec calls a function on Prompt input', () => {
    expect(
        () => exec(deps)((deps) => { throw ('Run!') })).toThrowError('Run!')
});

test('exec returns error if error', () => {
    const error = new Error('error');
    const _ = exec(deps)(error);
    expect(_).toEqual(error)
})

test('exec returns results on Effect input', () => {
    const result = (effect) => task.of(() => { return 'Run!' });
    const _ = exec(deps)(result);
    expect(_(deps)()).toEqual(result(deps)())
})

test('contraError parses iots decode', () => {
    const errors = pipe(Runtime.decode({}), fold(identity, identity))
    expect(contraError(errors)).toEqual(expect.any(Error))
})

test('need returns right on valid', () => {
    const leadbar = { '1': [{ suit: 'H', number: 2 }], '2': [{ suit: 'H', number: 2 }], '3': [{ suit: 'H', number: 2 }], '4': [{ suit: 'H', number: 2 }] };
    expect(need('under')(leadbar)).toEqual(right(leadbar))
})

test('need returns left on valid', () => {
    const leadbar = {};
    expect(need('under')(leadbar)).toEqual(left(new Error('under')))
})

test('under compares to env', () => {
    expect(under(process.env.REQUEST_LEADS_THRESHOLD)(['', '', ''])).toEqual(true)
    expect(under(process.env.REQUEST_LEADS_THRESHOLD)(['', '', '', ''])).toEqual(false)
})

test('decode compares', () => {
    expect(decode({ suit: 'H', number: 2 })).toEqual({ suit: 'H', number: 2 })
    expect(decode({ suit: 'Z', number: 2 })).toEqual(false)
})

test('pick removes invalid lead', () => {
    expect(pick([{ suit: 'H', number: 2 }, { suit: 'Z', number: 2 }])).toEqual([{ suit: 'H', number: 2 }])
})