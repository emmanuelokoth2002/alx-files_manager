// controllers/UsersController.js
import { Response, Request } from 'express';
import dbClient from '../utils/db';
import sha1 from 'sha1';

class UsersController {
  static async postNew(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if email already exists
    const existingUser = await dbClient
      .client
      .db(dbClient.database)
      .collection('users')
      .findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password
    const hashedPassword = sha1(password);

    // Create a new user
    const newUser = await dbClient
      .client
      .db(dbClient.database)
      .collection('users')
      .insertOne({ email, password: hashedPassword });

    // Return the new user with only email and id
    const { _id, email: userEmail } = newUser.ops[0];
    return res.status(201).json({ id: _id, email: userEmail });
  }
}

export default UsersController;
