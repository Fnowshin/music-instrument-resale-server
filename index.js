const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lt8wotk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded) {
        if(err) {
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
};

async function run(){

    try{
        const categoriesCollecton = client.db('musicInstrumentResale').collection('categories');

        const productsCollecton = client.db('musicInstrumentResale').collection('products');

        const bookingCollection = client.db('musicInstrumentResale').collection('bookings');

        const buyersCollection = client.db('musicInstrumentResale').collection('buyers');

        const usersCollection = client.db('musicInstrumentResale').collection('users');

        app.get('/categories', async(req, res) => {
            const query = {};
            const category = await categoriesCollecton.find(query).toArray();
            res.send(category);
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: (id) };
            const product = await productsCollecton.find(query).toArray();
            res.send(product);
        })

        app.get('/bookings', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })

        app.get('/buyers', async(req, res) => {
            const query = {};
            const buyers = await buyersCollection.find(query).toArray();
            res.send(buyers)
        })


        app.get ('/jwt', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '30d'});
                return res.send({accessToken: token});
            }
          
            res.status(403).send({accessToken: ''});
        })
        
         
        app.get('/users', async(req, res) => {
            const query ={};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        
        app.post('/bookings/:id', async(req, res) => {
            const booking = req.body
            console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.post('/buyers', async(req, res) =>{
            const buyer = req.body;
            console.log(buyer);
            const result = await buyersCollection.insertOne(buyer);
            res.send(result);
        })

        app.delete('/buyers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await buyersCollection.deleteOne(filter);
            res.send(result);
        })

        app.post('/users', async(req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);

        })

        app.get('/users/admin/:email', async (req, res ) =>{
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin'});
        })

        app.put('/users/:id',verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);
            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'})
            }
            const id = req.params.id;
            const filter = {_id: ObjectId(id) }
            const options = { upsert: true};
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })


    }
    finally{

    }
}
run().catch(console.log);


app.get('/', async(req, res) => {
    res.send('Music Instrument server is running');
})

app.listen(port, () => console.log(`Music server running on ${port}`))