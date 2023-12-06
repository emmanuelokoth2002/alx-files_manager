// controllers/UsersController.js
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  /**
   * Create a new user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response.
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });

    // Check if the user with the provided email already exists
    const existingUser = await dbClient.findUserByEmail(email);
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Hash the password
    const hashedPassword = sha1(password);

    // Create a new user in the database
    const newUser = await dbClient.createUser(email, hashedPassword);

    // Return the newly created user information
    return res.status(201).json({
      id: newUser.insertedId,
      email,
    });
  }

  /**
   * Get information about the authenticated user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Object} - JSON response.
   */
  static async getMe(req, res) {
    const token = req.headers['x-token'];

    // Check if authentication token is provided
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    // Retrieve user ID from Redis using the authentication token
    const userId = await redisClient.get(`auth_${token}`);

    // Check if user ID is found
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Retrieve user information from the database using the user ID
    const user = await dbClient.findUserById(userId);

    // Check if user is found
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Return user information
    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
