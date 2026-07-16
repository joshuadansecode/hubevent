import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { prisma } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();
