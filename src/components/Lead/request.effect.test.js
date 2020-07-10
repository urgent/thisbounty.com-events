import { make } from './request.effect'
import { eventEmitter } from '../../utilities/eventEmitter'

const full = [{ suit: 'H', number: 2 }, { suit: 'H', number: 3 }, { suit: 'H', number: 4 }, { suit: 'H', number: 5 }]
const above = { "1": full, "2": full, "3": full, "4": full };

test('if over lead threshold, do not request', () => {
    expect(make(above)).toEqual(expect.any(Error))
});