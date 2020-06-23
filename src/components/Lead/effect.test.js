import { Lead, merge, onRuntime, onMerge, create, isSuccess, run } from './effect';
import { left, right, isLeft } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { fold } from 'fp-ts/lib/Either'


const valid = { suit: "H", number: 2 };
const misnumber = { suit: "H", number: "Z" };
const missuit = { suit: "Z", number: "K" }
const reader = { bounty: "1", setState: () => { } }
const deps = { setState: () => { }, bounty: "1" }


test('Merge right', () => {
  expect(merge(valid)([])).toStrictEqual(right([valid]))
});

test('Merge left', () => {
  expect(merge(valid)([valid])).toStrictEqual(left(`${valid.suit}${valid.number} already exists in state`))
});

test('Decode -> Merge right', () => {
  expect(merge(Lead.decode(valid))([])).toStrictEqual(right([Lead.decode(valid)]))
});

test('Decode left', () => {
  expect(isLeft(Lead.decode(misnumber))).toBeTruthy()
});

test('onRuntime folds to onMerge', () => {
  const _ = onRuntime([])(Lead.decode(valid));
  const merge = onMerge(Lead.decode(valid));
  expect(_.toString()).toEqual(merge.toString())
});

test('onMerge task does not throw', () => {
  expect(onMerge([valid])(reader)).not.toThrow()
});

test('create is the pipe of parse, decode fold onRuntime ', () => {
  const _ = create([])({ data: JSON.stringify(valid) });
  const build = pipe(JSON.stringify(valid), JSON.parse, Lead.decode, fold(() => { }, onRuntime([])));
  expect(_.toString()).toEqual(build.toString())
});

test('isSuccess returns true with a function', () => {
  expect(isSuccess((() => { }))).toEqual(true)
});

test('isSuccess returns false with an object', () => {
  expect(isSuccess({})).toEqual(false)
});

test('run calls a function if success', (done) => {
  expect(
    () => run(deps)((deps) => { throw ('Run!') })).toThrow()
  done()
});

test('run returns error if error', (done) => {
  const _ = run(deps)('error');
  expect(_.toString()).toEqual('error')
  done()
})

test('run returns effect if success', (done) => {
  const effect = (deps) => () => { return 'Run!' };
  const _ = run(deps)(effect);
  expect(_.toString()).toEqual(effect.toString())
  done()
})