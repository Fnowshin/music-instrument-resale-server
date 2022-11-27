const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lt8wotk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
        const categoriesCollecton = client.db('musicInstrumentResale').collection('categories');

        const productsCollecton = client.db('musicInstrumentResale').collection('products');

        const bookingCollection = client.db('musicInstrumentResale').collection('bookings');

        const buyersCollection = client.db('musicInstrumentResale').collection('buyers');

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

        app.patch('/bookings/:id', async(req, res) => {
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

    }
    finally{

    }
}
run().catch(console.log);


app.get('/', async(req, res) => {
    res.send('Music Instrument server is running');
})

app.listen(port, () => console.log(`Music server running on ${port}`))