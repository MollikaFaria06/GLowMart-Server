const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:3000", "https://glowmart-client.vercel.app"]
}));
app.use(express.json());


// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.2xgatkm.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const db = client.db("glowMart");
  const productsCollection = db.collection("products");

  console.log("MongoDB Ready");

  app.get("/", (req, res) => {
    res.send("GlowMart backend is running 🚀");
  });

  app.get("/shop", async (req, res) => {
    try {
      const result = await productsCollection.find().toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  });

  app.get("/latestProducts", async (req, res) => {
    try {
      const result = await productsCollection
        .find()
        .sort({ _id: -1 })
        .limit(8)
        .toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  });

  app.get("/shop/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid product ID" });
      }

      const product = await productsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!product) {
        return res.status(404).send({ error: "Product not found" });
      }

      res.send(product);
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  });

  app.post("/shop", async (req, res) => {
    try {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send({ success: true, result });
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  });
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
