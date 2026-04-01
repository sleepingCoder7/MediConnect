const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.test" });

let mongoServer;
jest.setTimeout(10000);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
});