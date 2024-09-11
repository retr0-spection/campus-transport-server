import express from 'express';
import v1API from './routers/v1/index.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

// Middleware to handle JSON requests
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);


app.use('/v1', v1API)





export default app
