const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


//connect to mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.joyr7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//function for all api
async function run() {
    try {
        await client.connect();
        const productCollection = client.db('dihan_ltd').collection('products');

        //to get products form server
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

    }
    finally {

    }
};
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello form Dihan-LTD Web server');
});

app.listen(port, () => {
    console.log("listening port", port);
});