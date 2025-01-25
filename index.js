require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
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
    console.log('Cookies:', token);
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
        secure: false
    }).send({success: true});
}
);


app.get('/', (req, res) => {
    res.send('Movie Server is running');
});


// Services

app.get('/services', verifyToken, (req, res) => {
    // console.log('cookies', req.cookies);
    const email = req.query.email;

    if (email !== req.user.email) return res.status(403).send({message: 'Forbidden Access'});

    res.send({message: 'Services Alright'});
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});