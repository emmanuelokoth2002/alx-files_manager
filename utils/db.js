// utils/db.js
import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const {
      DB_HOST = 'localhost',
      DB_PORT = 27017,
      DB_DATABASE = 'files_manager',
    } = process.env;

    this.host = DB_HOST;
    this.port = DB_PORT;
    this.database = DB_DATABASE;

    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.client.connect()
      .then(() => console.log('Connected to MongoDB'))
      .catch((error) => console.error(`Error connecting to MongoDB: ${error}`));
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const usersCollection = this.client.db(this.database).collection('users');
    return usersCollection.countDocuments();
  }

  async nbFiles() {
    const filesCollection = this.client.db(this.database).collection('files');
    return filesCollection.countDocuments();
  }
}

const dbClient = new DBClient();

export default dbClient;
