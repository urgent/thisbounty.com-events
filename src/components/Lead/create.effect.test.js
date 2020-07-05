import { Runtime, merge, onRuntime, onMerge, make, create } from './create.effect';
import { left, right, isLeft } from 'fp-ts/lib/Either'


const valid = { suit: "H", number: 2 };
const misnumber = { suit: "H", number: "Z" };
const missuit = { suit: "Z", number: "K" }
const deps = { setLeads: () => { }, bounty: "1" }
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

test('make returns a function', () => {
  const unit = make([])(event)(deps);
  expect(unit).toEqual(expect.any(Function))
});

test('action mutates states for specified bounty by id', () => {
  let state = { bounty: "1", leads: { "1": [{ suit: "H", number: "K" }, { suit: "H", number: "A" }], "2": [{ suit: "D", number: "K" }, { suit: "D", number: "A" }] } }
  const setLeads = (update) => state.leads = update;
  // first parameter is empty. state.leads["1"] overwritten. Used here, not in production, for easier equality test
  create([])({ bounty: "1", setLeads, setBounty: () => { } })(event);
  expect(state.leads["1"]).toEqual([{ suit: "H", number: 2 }]);
});

test('action isolates state mutation by bounty', () => {
  let state = { bounty: "1", leads: { "1": [{ suit: "H", number: "K" }, { suit: "H", number: "A" }], "2": [{ suit: "D", number: "K" }, { suit: "D", number: "A" }] } }
  const setLeads = (update) => state.leads = update
  create([])(event)({ bounty: "1", setLeads });
  expect(state.leads["2"]).toEqual([{ suit: "D", number: "K" }, { suit: "D", number: "A" }]);
});