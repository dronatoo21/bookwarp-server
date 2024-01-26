const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nqakwmz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const allBooksCollection = client.db("bookWarp").collection("allBooks");
    const allBlogs = client.db("bookWarp").collection("allBlogs");
    const bookmarkCollection = client.db("bookWarp").collection("bookmark");

    // 
    // All Books---------------------
    // 

    app.get("/allBooks", async (req, res) => {
      const result = await allBooksCollection.find().toArray();
      res.send(result);
    });

    app.get('/allBooks/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await allBooksCollection.findOne(query)
      res.send(result);
    })

    // 
    //Blogs--------------------------- 
    //  

    app.get("/allBlogs", async (req, res) => {
      const result = await allBlogs.find().toArray();
      res.send(result);
    });

    // 
    // Bookmark -----------------------------------
    // 

    app.post("/bookmark", async(req, res)=>{
      const bookmark=req.body;
      const result =await bookmarkCollection.insertOne(bookmark);
      res.send(result);
    })
  
    app.get("/bookmark", async(req, res)=>{
      let query ={};
      if(req.query?.email){
        query={email : req.query.email};
      }
      const cursor =bookmarkCollection.find(query);
      const result=await cursor.toArray();
      res.send(result);
    })

    // 
    // search------------------------------
    // 

    app.get("/search", async (req, res) => {
      const text = req.query.text;
      const query = { title: { $regex: text, $options: "i" } };
      const result = await allBooksCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is runing");
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
