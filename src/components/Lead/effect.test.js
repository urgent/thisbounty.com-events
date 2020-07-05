import { isEffect, exec } from './effect'
import { task } from 'fp-ts/lib/Task'

const deps = { setLeads: () => { }, bounty: "1" }

test('isEffect returns true with a function', () => {
    expect(isEffect((() => { }))).toEqual(true)
});

test('isEffect returns false with an Error', () => {
    expect(isEffect(new Error())).toEqual(false)
});

test('run calls a function on Prompt input', () => {
    expect(
        () => run(deps)((deps) => { throw ('Run!') })).toThrow()
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