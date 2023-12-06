const expect = require('chai').expect;
const { dbClient } = require('../utils/db');

describe('dbClient', () => {
    it('should connect to MongoDB', async () => {
        await dbClient.connect();
        expect(dbClient.isAlive()).to.be.true;
    });

    it('should count users in the users collection', async () => {
        const nbUsers = await dbClient.nbUsers();
        expect(nbUsers).to.be.a('number');
    });

    it('should count files in the files collection', async () => {
        const nbFiles = await dbClient.nbFiles();
        expect(nbFiles).to.be.a('number');
    });
});
