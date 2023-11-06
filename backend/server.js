// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Require the User model (adjust the path as needed)
const User = require('./models/user.js');

app.use(bodyParser.json());

// Define a secret key for JWT (replace with your own secret)
const secretKey = 'snigdha510parashar';

// Connect to MongoDB (replace with your MongoDB URI)
mongoose.connect('mongodb+srv://sparashar5102001:snigdha510@cluster0.eyocizc.mongodb.net/your-database-name', {
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

// Create a route to save user preferences (protected route)
app.post('/api/preferences', authenticateToken, (req, res) => {
    // You can handle saving user preferences here, e.g., store them in the database.
    // You can access the authenticated user's email from req.user.email.
    const userEmail = req.user.email;

    // Example: Save the user's preferences to the database
    // Replace this with your actual code for saving preferences
    // For example, you can use the User model to update the preferences field for the user.
    
    // Sample code (update the User model as needed)
    User.updateOne({ email: userEmail }, { preferences: req.body.preferences }, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Failed to save preferences' });
        } else {
            res.status(200).json({ message: 'Preferences saved' });
        }
    });
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
