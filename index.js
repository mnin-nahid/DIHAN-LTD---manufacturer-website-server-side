const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


//connect to mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.joyr7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//This function is for varify valid user.
function varifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbideen access' })
        }
        req.decoded = decoded;
        next();
    })
}

//varify admin
const varifyAdmin = async (req, res, next) => {
    const requester = req.decoded.email;
    const requesterAccount = await userCollection.findOne({ email: requester });
    if (requesterAccount.role === 'admin') {
        next();
    }
    else {
        res.status(403).send({ message: 'You Dont have power to make him admin' })
    }
}

//function for all API.
async function run() {
    try {
        await client.connect();
        const productCollection = client.db('dihan_ltd').collection('products');
        const orderCollection = client.db('dihan_ltd').collection('order');
        const userCollection = client.db('dihan_ltd').collection('users');
        const reviewCollection = client.db('dihan_ltd').collection('reviews');

        //To get all user.
        app.get('/user', varifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });

        //varify admin
        const varifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                next();
            }
            else {
                res.status(403).send({ message: 'You Dont have power to make him admin' })
            }
        }
        
        //To get single user.
        app.get('/user/profile/:email',  async (req, res) => {
            const email = req.params.email;
            const query = { email: email};
            const user = await userCollection.findOne(query);
            res.send(user);
        });

        //To make a normal user to admin.
        app.put('/user/admin/:email', varifyJWT, varifyAdmin, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        //After login a valid user to send a Token and save the email in db.
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, option);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '8h' })
            res.send({ result, token });
        });


        //useAdmin
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin });
        })

        //Its for to take single user orders.
        app.get('/order', varifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const orders = await orderCollection.find(query).toArray();
                res.send(orders);
            }
            else {
                return res.status(403).send({ message: 'Forbidden access' })
            }
        })

        //To Delete a order.
        app.delete('/order/:orderId', async (req, res) => {
            const id = req.params.orderId;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

        //Its for Delete product.
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        //To get all products form server.
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        //To add products to server
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        //To get single product form server
        app.get('/product/:productId', async (req, res) => {
            const productId = req.params.productId;
            const query = { _id: ObjectId(productId) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        //Order collection api
        app.get('/order', async (req, res) => {
            const query = {};
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        })

        //Order POST API
        app.post('/order', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.send(result);
        });

        //review get API
        app.get('/review', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        });

        //review post to server
        app.post('/review', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        });

        app.put("/update/:email", async (req, res) => {
            const email = req.params.email;
            const data = req.body;
            const update = await userCollection.updateOne({ email: email },
                        {
                          $set: { ...data },
                        }
                        );
            res.send(update);
        })

    }
    finally {
        //final work
    }
};


run().catch(console.dir);


//Root api
app.get('/', (req, res) => {
    res.send('Hello form Dihan-LTD Web server');
});


app.listen(port, () => {
    console.log("listening to port", port);
});