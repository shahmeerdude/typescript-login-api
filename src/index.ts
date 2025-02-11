import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { register, login } from './auth';
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Register route
app.post('/register', register);

// Login route
app.post('/login', login);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the TypeScript Login API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});