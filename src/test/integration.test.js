import WebSocket from 'ws'
const socket = new WebSocket(
    'wss://connect.websocket.in/v3/1?apiKey=66FzbgigXbiN77D7eYNEQBJ0F0SGGXfhGonNoNYz7IejUldW82tOUn7kT5gO'
)

describe('Google', () => {
    beforeAll(async () => {
        await page.goto('https://google.com');
    });

    it('should be titled "Google"', async () => {
        await expect(page.title()).resolves.toMatch('Google');
    });
});