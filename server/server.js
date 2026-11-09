import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import orderRoutes from './routes/orders.js';
import operatorRoutes from './routes/operator.js';
import locationRoutes from './routes/locations.js';
import slotRoutes from './routes/slots.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4200'],
  credentials: true,
}));

const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Preserved for backwards compatibility with legacy stored avatar paths
app.use('/src', express.static(path.join(__dirname, '../src')));

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/slots', slotRoutes);

// Fallback wildcard routing allows React Router to manage client-side routes
app.get('/{*path}', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <html><body>
          <p>React app not built yet. Run <code>npm run build</code></p>
        </body></html>
      `);
    }
  });
});

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
