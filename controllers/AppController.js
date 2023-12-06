// controllers/AppController.js
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();
    res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  static async getStats(req, res) {
    const nbusers = await dbClient.nbUsers();
    const nbfiles = await dbClient.nbFiles();
    res.status(200).json({ users: nbusers, files: nbfiles });
  }
}

export default AppController;
