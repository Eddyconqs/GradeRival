import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import studyGroupRoutes from './routes/studyGroups';
import userRoutes from './routes/users';
import miscRoutes from './routes/misc';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'GradeRival API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/users', userRoutes);
app.use('/api', miscRoutes);

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ message: 'Something went wrong.', detail: error.message });
});

app.listen(port, () => {
  console.log(`GradeRival backend running on port ${port}`);
});
