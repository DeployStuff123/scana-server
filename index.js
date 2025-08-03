/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { handleDelete, handleUpload } from './utils/fileUploadHandler.js';
import { userRoute } from './route/user.route.js';
import cookieParser from 'cookie-parser';
import linkRoute from './route/link.routes.js';
import emailRoute from './route/email.routes.js';
import dashboardRoute from './route/dashboard.routes.js';
import visitRoute from './route/visit.route.js';
import followUpRouter from './route/followUp.route.js';
import './corn/followUpCorn.js';


const app = express();
dotenv.config();

app.use(express.urlencoded({ extended: false }));


const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('mongodb connected');
});
mongoose.connection.on('disconnected', () => {
  console.log('mongodb disconnected');
});

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
connectToDatabase();


//allowed origin
app.use(cors({
  origin: [
    'http://localhost:4000',
    'http://localhost:3000',
    'https://litz.vercel.app',
    'https://litz-admin.vercel.app',
  ], credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });



// Routes
app.use('/api/user', userRoute);
app.use('/api/visit', visitRoute);
app.use('/api/link', linkRoute);
app.use('/api/email', emailRoute);
app.use('/api/follow-up', followUpRouter);
app.use('/api/dashboard', dashboardRoute);
app.post('/api/file/upload', upload.single('my_file'), handleUpload);
app.post('/api/file/delete', handleDelete);


// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).send(message);
});
