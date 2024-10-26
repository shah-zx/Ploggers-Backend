// Code written by Harshal Anil Pohankar ->


const express = require('express');
const connectDB = require('./config/db');
const donationRoutes = require('./routes/donationRoutes');
const dotenv = require('dotenv');

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // For parsing application/json

app.use('/api/donations', donationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});