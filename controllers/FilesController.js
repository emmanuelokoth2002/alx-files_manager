// controllers/FilesController.js
import { Response, Request } from 'express';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req: Request, res: Response) {
    const { 'x-token': xToken } = req.headers;
    const { name, type, data, parentId, isPublic } = req.body;

    if (!xToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user based on the token
    const key = `auth_${xToken}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check parentId
    if (parentId) {
      const parentFile = await dbClient
        .client
        .db(dbClient.database)
        .collection('files')
        .findOne({ _id: parentId });

      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Prepare file document
    const fileDocument = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    };

    if (type === 'file' || type === 'image') {
      // Handle file content
      const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileUuid = uuidv4();
      const fileAbsolutePath = `${filePath}/${fileUuid}`;
      
      fs.writeFileSync(fileAbsolutePath, Buffer.from(data, 'base64'));

      fileDocument.localPath = fileAbsolutePath;
    }

    // Save file document in DB
    const newFile = await dbClient
      .client
      .db(dbClient.database)
      .collection('files')
      .insertOne(fileDocument);

    return res.status(201).json(newFile.ops[0]);
  }
}

export default FilesController;
