require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;



// Middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    // console.log('Cookies:', token);
    if (!token) {
        console.log("No Token Found");
        return res.status(401).send({ message: 'Access Denied' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).send({ message: 'Invalid Token' });
        req.user = decoded;
        console.log("Decoded JWT:", decoded);
        next();
    });
};




//JWT token
app.post('/jwt', (req, res) => { 
    const user = req.body;
    console.log('User:', user);
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '5h'});

    res.cookie('token', accessToken, {httpOnly: true,
        //set true in production 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', //change later maybe
    }).send({success: true});
}
);


app.get('/', (req, res) => {
    res.send('Movie Server is running');
});


//MongoDB


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9gttp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db('ConsultHive');
    const servicesCollection = database.collection('consultservices');
    const bookingCollection = database.collection('bookings');

    // get all services
    app.get('/services', async (req, res) => {
        try {
            const result = await servicesCollection.find({}).toArray();
            res.send(result);
        } catch (error) {
            console.error(error);
        }
    });

    //get a service by id
    app.get('/services/:id', async (req, res) => {
        id = new ObjectId(req.params.id);
        try {
            const result = await servicesCollection.findOne({ _id: id });
            res.send(result);
        } catch (error) {
            console.error(error);
        }
    });

    // get feature services get max 6
    app.get('/featureservices', async (req, res) => {
        try {
            const result = await servicesCollection.find({}).limit(6).toArray();
            res.send(result);
        } catch (error) {
            console.error(error);
        }
    });

    // post a service
    app.post('/services', async (req, res) => {
        try {
            const result = await servicesCollection.insertOne(req.body);
            res.send(result);
        } catch (error) {
            console.error(error);
        }

    });

    //book a service
    app.post('/book-services', async (req, res) => {
        try {
            const result = await bookingCollection.insertOne(req.body);
        } catch (error) {
            console.error(error)
        }
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




// Services

app.get('/sservices', verifyToken, (req, res) => {
    // console.log('cookies', req.cookies);
    const email = req.query.email;
    console.log('Email:', email);
    if (email !== req.user.email) return res.status(403).send({message: 'Forbidden Access'});

    res.send({message: 'Services Alright'});
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});