import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

// Middleware to handle JSON requests
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define a route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html')
});

app.get('/test', (req, res) => {
    res.send()
});


export default app
