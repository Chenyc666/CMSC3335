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

//---------------------API ------------------------


// const translateText = async () => {
//   const url = 'https://text-translator2.p.rapidapi.com/translate';
//   const options = {
//     method: 'POST',
//     headers: {
//       'content-type': 'application/x-www-form-urlencoded',
//       'X-RapidAPI-Key': '453b6217ebmsh13952074b32d187p1e832ajsn8e3870176252',
//       'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com'
//     },
//     body: new URLSearchParams({
//       source_language: 'en',
//       target_language: 'id',
//       text: 'What is your name?'
//     })
//   };

//   try {
//     const response = await fetch(url, options);
//     const result = await response.text();
//     console.log(result);
//   } catch (error) {
//     console.error(error);
//   }
// };

// ------------------ ROUTES ------------------

// GET - home page
app.get('/', (req, res) => {
	res.render('home')
})


app.get('/market', (req, res) => {
    res.render('market');
});



// POST - applyResult page - Insert apply to DB
app.post('/marketResult', async (req, res) => {

	const { zipcode,brand,size } = req.body
	const now = new Date()
    // Basic validation (you can expand this as needed)
    if ( !zipcode||!brand|| !size) {
        return res.status(400).send("Invalid input data");
    }

	try {
		await client.connect()

		const app_collection = db.collection(data_collection.collection);


		// Insert apply to DB
		await app_collection.insertOne({
            // zipcode:zipcode,
			brand:brand,
			size:size,
			date: new Date(),
		})

		await client.close()

		return res.render('marketResult', {
            zipcode:zipcode,
			brand:brand,
			size:size,
			date: new Date(),
		})
	} catch (error) {
		console.error(error);
		res.status(500).send("An error occurred while processing your request");
	}
})

app.get('/search', (req, res) => {
        
      res.render("search");

});


app.post('/searchResult', async(req, res) => {
    // Fetch shoes data from MongoDB and  

    let size = req.body.size;

    let brand = req.body.brand;

    const filter = {
        size: size, // assuming size is a variable containing the user input
        brand: brand // assuming brand is a variable containing the user input
    };

       try {
        // const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect()
        const result = db.collection(data_collection.collection);
        const applicantResult = await result.find(filter);

        let applicantResult2 = await applicantResult.toArray();

        let ans = '<table><thead><tr><th>Brand</th><th>Size</th><th>Price</th></tr></thead><tbody>';

        applicantResult2.forEach( i => {
            // const sourceLanguage = 'auto'; // auto-detect language
            // const targetLanguage = 'en'; // translate to English
      
            // const translatedBrand = await translateText(i.brand, sourceLanguage, targetLanguage);
            // const translatedSize = await translateText(i.size, sourceLanguage, targetLanguage);
      

            ans += `<tr><td>${i.brand}</td><td>${i.size}</td><td>${i.price}</td></tr>`;
        });

        ans += '</tbody></table>';

        const variables = {
            stock: ans
        };

        client.close();

        res.render("searchResult", variables);
    } catch (e) {
        console.error(e);
        res.send('Error occurred while processing the request.');
    }
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ------------------ USER INTERFACE ------------------
let data = ''
console.log(`Web server started and running at http://localhost:${PORT}`)
process.stdin.setEncoding('utf8')
process.stdout.write('Stop to shutdown the server: ')
process.stdin.on('readable', () => {
	data = process.stdin.read()
	if (data !== null) {
		let cmd = data.trim()
		if (cmd === 'stop') {
			console.log('Shutting down server')
			process.exit(0)
		}
	}
	process.stdout.resume()
})

module.exports = app
