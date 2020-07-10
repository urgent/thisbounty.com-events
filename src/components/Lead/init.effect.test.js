import eventEmitter from '../../utilities/eventEmitter'
import { action, init } from './init.effect';

const deps = { setLeads: () => { }, bounty: "1" }

test('init returns a function', () => {
    expect(init(deps)).toEqual(expect.any(Function))
})

test('action emits event', (done) => {
    let spy = jest.fn();

    eventEmitter.on('REQUEST_LEADS', spy);

    setTimeout(() => {
        expect(spy).toHaveBeenCalled();
        done();
    }, 2000);

    action(deps)

})