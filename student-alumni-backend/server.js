const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ MongoDB connected and server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

