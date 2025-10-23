import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import routes from './src/routes/index.js';
import errorHandler from './src/middleware/errorHandler.js';
import pool from './src/config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? true : process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', service: 'HealthHub Auth Service', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', service: 'HealthHub Auth Service', database: error.message });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HealthHub Auth Server running on port ${PORT}`);
});