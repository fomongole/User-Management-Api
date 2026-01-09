import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});