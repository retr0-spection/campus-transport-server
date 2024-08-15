import express from 'express';
const app = express();

// Middleware to handle JSON requests
app.use(express.json());

// Define a route
app.get('/', (req, res) => {
    res.send('Hello World!');
});


export default app
