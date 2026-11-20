import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { explainHandler } from './handlers/explain.js';
import { chatHandler } from './handlers/chat.js';
import { summaryHandler } from './handlers/summary.js';
import { piiMaskMiddleware } from './middleware/piiMask.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_EXTENSION_ID = process.env.ALLOWED_EXTENSION_ID;

// CORS: allow only the Chrome extension origin
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, false);
      // Chrome extension origin format: chrome-extension://<id>
      const allowed =
        ALLOWED_EXTENSION_ID &&
        origin === `chrome-extension://${ALLOWED_EXTENSION_ID}`;
      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json({ limit: '32kb' }));

// Rate limiting: 20 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// PII masking middleware (runs on request body before hitting LLM)
app.use('/api/', piiMaskMiddleware);

// Routes
app.post('/api/explain', explainHandler);
app.post('/api/chat', chatHandler);
app.post('/api/summary', summaryHandler);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Neem backend listening on port ${PORT}`);
});

export default app;
