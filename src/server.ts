import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from './config/passport'; 
import authRoutes from './routes/auth.route'
import quizRoutes from './routes/quiz.route';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(passport.initialize()); 

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes); 


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  // Check for Prisma specific errors if needed, e.g., P2002 for unique constraint
  if ((err as any).code === 'P2002') { // Prisma unique constraint violation
    return res.status(409).json({ message: 'Conflict: A record with this value already exists.', details: (err as any).meta?.target });
  }
  if ((err as any).code === 'P2025') { // Prisma record not found for delete/update
    return res.status(404).json({ message: 'Not Found: The record to be updated or deleted does not exist.' });
  }
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});


// Start server function
const startServer = async () => {
  try {
    // Test database connection (optional, Prisma handles this on first query)
    await prisma.$connect();
    console.log('Successfully connected to the database.');

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    await prisma.$disconnect();
    process.exit(1); // Exit if DB connection fails
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server and DB connection');
  await prisma.$disconnect();
  console.log('Prisma connection disconnected.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server and DB connection');
  await prisma.$disconnect();
  console.log('Prisma connection disconnected.');
  process.exit(0);
});

startServer();

