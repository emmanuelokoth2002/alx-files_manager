// controllers/UsersController.js
const { dbClient } = require('../utils/db');
const bcrypt = require('bcrypt');

class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }

        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }

        const existingUser = await dbClient.db().collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = { email, password: hashedPassword };
        const result = await dbClient.db().collection('users').insertOne(newUser);

        const user = {
            id: result.insertedId,
            email,
        };
        res.status(201).json(user);
    }
}

module.exports = UsersController;
