// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const http = require('http'); 
const socketIo = require('socket.io');
const app = express();
const port = 3000;

const cors = require('cors');

// Allow all CORS requests (for development, can be more restrictive in production)
app.use(cors());


// Require the User model (adjust the path as needed)
const User = require('./models/user.js');

app.use(bodyParser.json());

// Define a secret key for JWT (replace with your own secret)
const secretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTkyODUyNjcsImV4cCI6MTY5OTI4ODg2N30.EI7RzNSBVSG-Inu2IQqa1RuCTwFqh44SyaRFmIeWaQI'
// Connect to MongoDB (replace with your MongoDB URI)
mongoose.connect('mongodb+srv://sparashar5102001:snigdha510@cluster0.eyocizc.mongodb.net/tshirt?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a function to check user credentials
async function checkUserCredentials(email, password) {
    try {
        const user = await User.findOne({ email });

        if (user && bcrypt.compareSync(password, user.password)) {
            return user;
        }
    } catch (error) {
        console.error(error);
    }

    return null;
}

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
        const userEmail = req.user.email; // User's email from the JWT token
        const preferences= req.body.preferences; // User's color preference
    
        try {
            // Update the user's preferences in the database (assuming you have a User model)
            const user = await User.findOne({ email: userEmail });
    
            if (user) {
                user.preferences = preferences; // Assuming you have a 'preferences' field in your User model
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

const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server); // Create a Socket.io instance and attach it to the server



// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected.');

    // Handle user preference updates via WebSocket
    socket.on('updatePreference', async (data) => {
        // Update the MongoDB database with the new preference
        await User.updateOne({ email: data.email }, { preferences: data.colorPreference });

        // Broadcast the updated data to all clients, including the user who made the update
        io.emit('preferenceUpdated', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected.');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
