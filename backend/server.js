const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const cors = require('cors');

// WebSocket imports
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

// Allow all CORS requests (for development, can be more restrictive in production)
app.use(cors());

// Require the User model (adjust the path as needed)
const User = require('./models/user.js');

app.use(bodyParser.json());

// Define a secret key for JWT (replace with your own secret)
const secretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTkyODUyNjcsImV4cCI6MTY5OTI4ODg2N30.EI7RzNSBVSG-Inu2IQqa1RuCTwFqh44SyaRFmIeWaQI';

// Connect to MongoDB (replace with your MongoDB URI)
mongoose.connect('mongodb+srv://sparashar5102001:snigdha510@cluster0.eyocizc.mongodb.net/tshirt', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// WebSocket event handling
io.on('connection', (socket) => {
    console.log('A user connected.');

    socket.on('colorPreference', (data) => {
        // Handle the color preference data received from the client
        console.log('Received color preference:', data);

        // You can save this data to your database or perform any other desired actions.
        // Modify the code as needed to save the color preference to your database.
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

// Middleware to authenticate the JWT token
function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Add this route to your backend/server.js
app.post('/api/preferences', authenticateToken, async (req, res) => {
    const userEmail = req.user.email;
    const colorPreference = req.body.colorPreference;

    try {
        // Update the user's preferences in the database (assuming you have a User model)
        const user = await User.findOne({ email: userEmail });
        if (user) {
            user.colorPreference = colorPreference;
            await user.save();
            res.status(200).json({ message: 'User preferences saved successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save user preferences' });
    }
});

// Protected route (requires a valid JWT token)
app.get('/api/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Protected route accessed' });
});

// Define your authentication route for user login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Check user credentials
    const user = checkUserCredentials(email, password);

    if (user) {
        // Generate a JSON Web Token (JWT) for the authenticated user
        const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: '1h' });

        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: 'Login failed' });
    }
});

// Define your authentication route for user registration
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;

    // Hash the user's password before storing it
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create a new user using the User model and store it in the database
    const newUser = new User({ email, password: hashedPassword });

    newUser.save()
        .then(() => {
            res.status(201).json({ message: 'Registration successful' });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Registration failed' });
        });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



