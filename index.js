const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
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
  try {
    await client.connect(); // ensure connection
    const db = client.db("glowMart");
    const productsCollection = db.collection("products");

    console.log("MongoDB Connected");

    app.get("/", (req, res) => {
  res.send("GlowMart backend is running!");
});


    // GET all products
    app.get("/shop", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    // GET latest 8 products
    app.get("/latestProducts", async (req, res) => {
      const result = await productsCollection
        .find()
        .sort({ _id: -1 })
        .limit(8)
        .toArray();
      res.send(result);
    });

    // GET single product by ID
app.get("/shop/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // MongoDB ObjectId validate
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid product ID" });
    }

    const product = await productsCollection.findOne({ _id: new ObjectId(id) });

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});


    // POST new product
    app.post("/shop", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send({ success: true, result });
    });

  } finally {
    // keep connection alive
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
