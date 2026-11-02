import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import followerRoutes from './routes/followerRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', true);

const allowedOrigins = process.env.CLIENT_URL;
const allowedOriginsOne = process.env.CLIENT_URL2;

app.use(cors({
  origin: [allowedOrigins, allowedOriginsOne],
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/followers', followerRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on ${PORT}`);
  });
}

startServer();

