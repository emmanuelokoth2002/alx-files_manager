import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  /**
   * Authenticate user and generate a token.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response.
   */
  static async getConnect(req, res) {
    // Check if Authorization header is present
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode and extract credentials from the Authorization header
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find user by email in the database
    const user = await dbClient.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the hashed password
    const hashedPassword = sha1(password);
    if (hashedPassword !== user.password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a random token and store it in Redis for 24 hours
    const randomToken = uuidv4();
    const key = `auth_${randomToken}`;
    await redisClient.set(key, user._id.toString(), 86400);

    // Return the generated token
    return res.status(200).json({ token: randomToken });
  }

  /**
   * Disconnect user by deleting the token from Redis.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response.
   */
  static async getDisconnect(req, res) {
    // Check if X-Token header is present
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve user ID from Redis using the token
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete the token from Redis
    await redisClient.del(`auth_${token}`);

    // Return a successful response with no content
    return res.status(204).end();
  }
}

export default AuthController;
