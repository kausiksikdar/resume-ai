const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/mongodb');
const { redisClient } = require('./config/redis'); // ✅ destructure
const { initQdrant } = require('./services/qdrantService');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://resume-ai-azure-five.vercel.app'   // your actual Vercel URL
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use('/auth', require('./routes/authRoutes'));
app.use('/resume', require('./routes/resumeRoutes'));
app.use('/ai', require('./routes/aiRoutes'));
app.use('/jobs', require('./routes/jobRoutes'));
app.use('/applications', require('./routes/applicationRoutes'));
app.use('/feedback', require('./routes/feedbackRoutes'));

const InitalizeConnection = async () => {
  try {
    await Promise.all([main(), initQdrant()]); // ✅ removed redisClient.connect()
    console.log('DB Connected');

    app.listen(process.env.PORT, () => {
      console.log('Server listening at port number: ' + process.env.PORT);
    });
  } catch (err) {
    console.log('Error: ' + err);
  }
};

InitalizeConnection();