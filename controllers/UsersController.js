// controllers/UsersController.js
import { Response, Request } from 'express';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req: Request, res: Response) {
    // ... (existing code)

    // Update to handle X-Token in headers
    const { 'x-token': xToken } = req.headers;

    if (!xToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user based on the token
    const key = `auth_${xToken}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient
      .client
      .db(dbClient.database)
      .collection('users')
      .findOne({ _id: userId });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({
      id: user._id.toString(),
      email: user.email,
    });
  }
}

export default UsersController;
