const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//function for all api
async function run() {
    try {

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