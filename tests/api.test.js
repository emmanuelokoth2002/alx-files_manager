const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);

describe('API', () => {
    // GET /status
    it('should return status and health', async () => {
        const response = await chai.request(app).get('/status');
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('redis');
        expect(response.body).to.have.property('db');
    });

    // GET /stats
    it('should return number of users and files', async () => {
        const response = await chai.request(app).get('/stats');
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('users');
        expect(response.body).to.have.property('files');
    });

    // POST /users
    it('should create a new user', async () => {
        const user = { email: 'test@example.com', password: 'password' };
        const response = await chai.request(app).post('/users').send(user);
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('email');
    });

});
