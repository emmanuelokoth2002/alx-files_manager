// controllers/FilesController.js
import { Response, Request } from 'express';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async getShow(req: Request, res: Response) {
    const { 'x-token': xToken } = req.headers;
    const { id } = req.params;

    if (!xToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user based on the token
    const key = `auth_${xToken}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve file document based on ID
    const file = await dbClient
      .client
      .db(dbClient.database)
      .collection('files')
      .findOne({ _id: id, userId });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json(file);
  }

  static async getIndex(req: Request, res: Response) {
    const { 'x-token': xToken } = req.headers;
    const { parentId, page } = req.query;

    if (!xToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user based on the token
    const key = `auth_${xToken}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Set parentId to 0 if not provided
    const parent = parentId || '0';

    // Pagination
    const pageSize = 20;
    const skip = page ? pageSize * page : 0;

    // Retrieve file documents based on parentId and pagination
    const files = await dbClient
      .client
      .db(dbClient.database)
      .collection('files')
      .find({ parentId, userId })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.json(files);
  }
}

export default FilesController;
