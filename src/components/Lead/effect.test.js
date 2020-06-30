import { Runtime, merge, onRuntime, onMerge, create, isPrompt, run } from './effect';
import { left, right, isLeft } from 'fp-ts/lib/Either'
import { task } from 'fp-ts/lib/Task'


const valid = { suit: "H", number: 2 };
const misnumber = { suit: "H", number: "Z" };
const missuit = { suit: "Z", number: "K" }
const deps = { setState: () => { }, bounty: "1" }
const data = JSON.stringify(valid);
const event = { data }

test('Merge right', () => {
  const unit = merge([])(valid);
  const result = right([valid]);
  expect(unit).toStrictEqual(result)
});

test('Merge left', () => {
  const unit = merge([valid])(valid);
  const error = left(Error(`${valid.suit}${valid.number} already exists in state.`));
  expect(unit).toStrictEqual(error)
});

test('Decode -> Merge right', () => {
  const unit = merge([])(Runtime.decode(valid));
  const result = right([Runtime.decode(valid)]);
  expect(unit).toStrictEqual(result)
});

test('Decode left', () => {
  const suit = Runtime.decode(missuit);
  expect(isLeft(suit)).toBeTruthy()

  const number = Runtime.decode(misnumber);
  expect(isLeft(number)).toBeTruthy()
});

test('onRuntime returns a Task', () => {
  const prompt = onRuntime([])(valid);
  expect(prompt).toEqual(expect.any(Function))
  const error = onRuntime([valid])(valid)
  expect(error instanceof Error).toBeTruthy()
});

test('onMerge returns a Task', () => {
  const prompt = onMerge([valid])
  expect(prompt).toEqual(expect.any(Function))
});

test('create returns a function', () => {
  const unit = create([])(event)(deps);
  expect(unit).toEqual(expect.any(Function))
});

test('isPrompt returns true with a function', () => {
  expect(isPrompt((() => { }))).toEqual(true)
});

test('isPrompt returns false with an Error', () => {
  expect(isPrompt(new Error())).toEqual(false)
});

test('run calls a function on Prompt input', () => {
  expect(
    () => run(deps)((deps) => { throw ('Run!') })).toThrow()
});

test('run returns error if error', () => {
  const error = new Error('error');
  // runs side effect if not error and returns result
  const _ = run(deps)(error);
  expect(_).toEqual(error)
})

test('run returns results on Prompt input', () => {
  const result = (prompt) => task.of(() => { return 'Run!' });
  // runs side effect if not error and returns result
  const _ = run(deps)(result);
  expect(_(deps)()).toEqual(result(deps)())
})

test('effect changes for specified bounty by id', () => {
  let state = { bounty: "1", leads: { "1": [{ suit: "H", number: "K" }, { suit: "H", number: "A" }], "2": [{ suit: "D", number: "K" }, { suit: "D", number: "A" }] } }
  const setState = (update) => state.leads = Object.assign({}, state.leads, update)
  const unit = create([])(event)({ bounty: "1", setState });
  expect(state.leads["1"]).toEqual([{ suit: "H", number: 2 }]);
});

test('effect leaves alone bounties not specified by id', () => {
  let state = { bounty: "1", leads: { "1": [{ suit: "H", number: "K" }, { suit: "H", number: "A" }], "2": [{ suit: "D", number: "K" }, { suit: "D", number: "A" }] } }
  const setState = (update) => state.leads = Object.assign({}, state.leads, update)
  const unit = create([])(event)({ bounty: "1", setState });
  expect(state.leads["2"]).toEqual([{ suit: "D", number: "K" }, { suit: "D", number: "A" }]);
});