// controllers/AuthController.js
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req: Request, res: Response) {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find user in DB
    const hashedPassword = sha1(password);
    const user = await dbClient
      .client
      .db(dbClient.database)
      .collection('users')
      .findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate token and store in Redis
    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 86400); // 24 hours
    return res.status(200).json({ token });
  }

  static async getDisconnect(req: Request, res: Response) {
    const { 'x-token': xToken } = req.headers;

    if (!xToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete token in Redis
    const key = `auth_${xToken}`;
    await redisClient.del(key);
    
    return res.status(204).end();
  }
}

export default AuthController;
