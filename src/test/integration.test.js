import WebSocket from 'ws'
const socket = new WebSocket(
    'wss://connect.websocket.in/v3/1?apiKey=66FzbgigXbiN77D7eYNEQBJ0F0SGGXfhGonNoNYz7IejUldW82tOUn7kT5gO'
)

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Leads', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:8080');
    });

    it('should accept leads"', async () => {
        jest.setTimeout(5000);
        // no lead exists
        const prior = await page.$x("//button[text()='J']");
        expect(prior.length).toEqual(0);
        // send websocket payload to generate lead
        setTimeout(() => {
            socket.send(
                JSON.stringify({
                    event: 'RESPONSE_LEADS',
                    data: {
                        '1': [
                            { suit: 'H', number: 'J' },
                            { suit: 'H', number: 'Q' },
                            { suit: 'H', number: 'K' },
                            { suit: 'H', number: 'A' }
                        ]
                    }
                })
            )
        }, 1000)
        await delay(2500);
        // lead now exists
        const update = await page.$x("//button[text()='J']");
        expect(update.length).toEqual(1);
    });
});