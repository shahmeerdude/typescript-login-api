import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

// In-memory user database (for demonstration purposes)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' }
];

// Function to generate JWT token
export const generateToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
};

// Login route handler
export const login = (req: Request, res: Response): void => {
  const { username, password } = req.body;

  // Find the user in the in-memory database
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  // Generate JWT token
  const token = generateToken(user.id);

  // Return the token
  res.json({ token });
};