import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Function to generate JWT token
export const generateToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
};

// Register route handler with validation
export const register = async (req: Request, res: Response): Promise<void> => {
  // Validation rules
  await body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .run(req);

  await body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .run(req);

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Login route handler with validation
export const login = async (req: Request, res: Response): Promise<void> => {
  // Validation rules
  await body('username')
    .notEmpty()
    .withMessage('Username is required')
    .run(req);

  await body('password')
    .notEmpty()
    .withMessage('Password is required')
    .run(req);

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return the token
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};