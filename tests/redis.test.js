const expect = require('chai').expect;
const { redisClient } = require('../utils/redis');

describe('redisClient', () => {
    it('should be connected', async () => {
        expect(redisClient.isAlive()).to.be.true;
    });

    it('should set and get a key', async () => {
        const key = 'test_key';
        const value = 'test_value';
        await redisClient.set(key, value);
        const storedValue = await redisClient.get(key);
        expect(storedValue).to.equal(value);
    });

    it('should delete a key', async () => {
        const key = 'test_key';
        await redisClient.set(key, 'test_value');
        await redisClient.del(key);
        const storedValue = await redisClient.get(key);
        expect(storedValue).to.be.null;
    });
});
