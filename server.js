require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? true : process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'HealthHub Auth Service' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HealthHub Auth Server running on port ${PORT}`);
});