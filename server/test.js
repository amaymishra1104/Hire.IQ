require("dotenv").config();

const { MongoClient } = require("mongodb");

(async () => {
  try {
    console.log(process.env.MONGO_URI);

    const client = new MongoClient(process.env.MONGO_URI);

    await client.connect();

    console.log("✅ Connected!");

    await client.db().command({ ping: 1 });

    console.log("🏓 Ping successful!");

    await client.close();
  } catch (err) {
    console.error(err);
  }
})();