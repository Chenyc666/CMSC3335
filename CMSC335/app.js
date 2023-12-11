const express = require('express')
const path = require('path')
const { argv } = require('process')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb')

// ----------- Set up .env, Database and Collection Name -----------
require('dotenv').config()
const name = process.env.MONGO_DB_USERNAME
const password = process.env.MONGO_DB_PASSWORD
const name_DB = process.env.MONGO_DB_NAME
const collectionName = process.env.MONGO_COLLECTION
const data_collection = {
	db: name_DB,
	collection: collectionName,
}

// ----------- Connect to MongoDB -----------
const uri = `mongodb+srv://${name}:${password}@cluster0.26cxh3i.mongodb.net/${name_DB}?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
	serverApi: ServerApiVersion.v1,
})

let db;

client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
        db = client.db(data_collection.db); 
    })
    .catch(err => console.error('Failed to connect to MongoDB', err));


// ----------- Set up App -----------
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', '.ejs')

// App config
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))



// ------------------ ROUTES ------------------

// GET - home page
app.get('/', (req, res) => {
	res.render('home')
})


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/market', (req, res) => {
    // Fetch shoes data from MongoDB and render market.ejs
    MongoClient.connect(dbURL, (err, client) => {
        if (err) return console.error(err);
        const db = client.db(dbName);
        db.collection('shoes').find().toArray((err, result) => {
            if (err) return console.error(err);
            res.render('market', { shoes: result });
        });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
