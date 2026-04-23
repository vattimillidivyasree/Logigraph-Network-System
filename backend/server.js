
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const graphRoutes = require('./routes/graphRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

const MONGO_URI = "mongodb+srv://task_user:2FTK5ykbnn9Mj%25f@cluster0.ni35bqe.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB (Auth) Connected'))
    .catch(err => console.log(err));

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/graphs', graphRoutes);
const PORT = 5000;
app.listen(PORT, () => console.log(`Logistics Server running on ${PORT}`));