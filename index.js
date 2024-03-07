const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
app.use(cors());
app.use(express.json())







const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.rhsqxdw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // all Colletctons here
    const productsCollection = client.db('next_sofa_app').collection('all_products')
    const usersCollection = client.db('next_sofa_app').collection('all_users')

    // jwt here

    app.post('/jwt', async(req, res)=> {
      const userData = req.body;
      const all_users = await usersCollection.find().toArray()
      const user_exist = all_users.find(user=> user.email === userData.email)

      if(!user_exist){
        const result = await usersCollection.insertOne(userData);
        if(result.acknowledged){
          const token = jwt.sign(userData, process.env.SECRET_KEY_JWT)
          res.send({token});
        }else{
          res.send({message:'forbiden access'});
        }
      }else{
         res.send({message:'email already used'})
      }

    })

    app.post('/login', async(req, res)=> {
      const userData = req.body;
      const all_users = await usersCollection.find().toArray()
      const user_exist = all_users.find(user=> user.email === userData.email && user.password === userData.password)

     if(user_exist){
      res.send({success:'login successfully'})
     }else{
      res.send({error:'email or password worng'})
     }

    })






    app.get('/all-products', async (req,res)=> {
        const result = await productsCollection.find().toArray()
        res.send(result);
    })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);




app.get('/', (req , res)=>{
    res.send('App is running on server')
})

app.listen(port, ()=>{
    console.log(`app is running on port : ${port}`);
})